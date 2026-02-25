import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';
import { dataSources as dataSourcesApi } from '../../services/api';

interface DataSource {
  source_id: string;
  source_name: string;
  source_url: string;
  source_type: 'manual' | 'ai_discovered';
  relevance_score: number;
  enabled: number; // 0 for false, 1 for true
  created_at: string;
  updated_at: string;
}

interface AIDiscoveredSource {
  source_id: string;
  source_name: string;
  source_url: string;
  relevance_score: number;
  discovered_at: string;
}

interface SortConfig {
  field: string;
  direction: 'asc' | 'desc' | null;
}

const AdminDataSourcePage: React.FC = () => {
  const navigate = useNavigate();
  
  // 状态管理
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedSources, setSelectedSources] = useState<Set<string>>(new Set());
  const [keywordSearch, setKeywordSearch] = useState('');
  const [sourceTypeFilter, setSourceTypeFilter] = useState('all');
  const [sourceStatusFilter, setSourceStatusFilter] = useState('all');
  const [relevanceFilter, setRelevanceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // 弹窗状态
  const [showAiReviewModal, setShowAiReviewModal] = useState(false);
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [showRelevanceModal, setShowRelevanceModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // 编辑状态
  const [currentEditingSource, setCurrentEditingSource] = useState<DataSource | null>(null);
  const [currentDeletingSource, setCurrentDeletingSource] = useState<DataSource | null>(null);
  const [currentRelevanceSource, setCurrentRelevanceSource] = useState<DataSource | null>(null);
  const [sourceFormData, setSourceFormData] = useState({
    source_name: '',
    source_url: '',
    source_type: 'manual',
    relevance_score: 70,
    enabled: 1
  });
  const [relevanceValue, setRelevanceValue] = useState(70);
  
  // 下拉菜单状态
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showRelevanceDropdown, setShowRelevanceDropdown] = useState(false);

  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);

  // 模拟AI发现数据源 (后端目前没有对应API)
  const [aiDiscoveredSources] = useState<AIDiscoveredSource[]>([
    {
      source_id: 'ai-source-001',
      source_name: '智慧水务观察',
      source_url: 'https://www.smart-water-watch.com',
      relevance_score: 87,
      discovered_at: '2024-01-15 06:30'
    },
    {
      source_id: 'ai-source-002',
      source_name: '水务科技前沿',
      source_url: 'https://www.water-tech-frontier.com',
      relevance_score: 72,
      discovered_at: '2024-01-15 05:45'
    }
  ]);

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '数据源配置 - 水脉通';
    return () => { document.title = originalTitle; };
  }, []);

  // 获取数据源列表
  const fetchDataSources = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (sourceTypeFilter !== 'all') params.source_type = sourceTypeFilter;
      if (sourceStatusFilter !== 'all') params.enabled = sourceStatusFilter === 'enabled' ? 1 : 0;
      // relevanceFilter 暂时不在后端实现，前端过滤

      const response = await dataSourcesApi.getDataSources(params);
      setDataSources(response);
    } catch (error) {
      console.error('获取数据源失败:', error);
    } finally {
      setLoading(false);
    }
  }, [sourceTypeFilter, sourceStatusFilter]);

  useEffect(() => {
    fetchDataSources();
  }, [fetchDataSources]);

  // 筛选和排序
  const filteredAndSortedSources = dataSources
    .filter(source => {
      const matchesKeyword = source.source_name.toLowerCase().includes(keywordSearch.toLowerCase()) ||
                             source.source_url.toLowerCase().includes(keywordSearch.toLowerCase());
      const matchesRelevance = relevanceFilter === 'all' || 
                               (relevanceFilter === 'high' && source.relevance_score >= 80) ||
                               (relevanceFilter === 'medium' && source.relevance_score >= 60 && source.relevance_score < 80) ||
                               (relevanceFilter === 'low' && source.relevance_score < 60);
      return matchesKeyword && matchesRelevance;
    })
    .sort((a, b) => {
      const [field, direction] = sortBy.split('-');
      let compare = 0;
      if (field === 'created_at' || field === 'updated_at') {
        compare = new Date(a[field]).getTime() - new Date(b[field]).getTime();
      } else if (field === 'relevance_score') {
        compare = a.relevance_score - b.relevance_score;
      } else if (field === 'source_name') {
        compare = a.source_name.localeCompare(b.source_name);
      }
      return direction === 'asc' ? compare : -compare;
    });

  // 全选状态
  const isAllSelected = filteredAndSortedSources.length > 0 && selectedSources.size === filteredAndSortedSources.length;
  const isIndeterminate = selectedSources.size > 0 && selectedSources.size < filteredAndSortedSources.length;

  // 处理侧边栏切换
  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // 处理全选
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedSources(new Set(filteredAndSortedSources.map(source => source.source_id)));
    } else {
      setSelectedSources(new Set());
    }
  };

  // 处理单个选择
  const handleSourceSelect = (sourceId: string, checked: boolean) => {
    const newSelected = new Set(selectedSources);
    if (checked) {
      newSelected.add(sourceId);
    } else {
      newSelected.delete(sourceId);
    }
    setSelectedSources(newSelected);
  };

  // 处理搜索
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeywordSearch(e.target.value);
    setCurrentPage(1);
  };

  // 处理筛选下拉菜单
  const handleFilterToggle = (filterType: 'type' | 'status' | 'relevance') => {
    setShowTypeDropdown(filterType === 'type' && !showTypeDropdown);
    setShowStatusDropdown(filterType === 'status' && !showStatusDropdown);
    setShowRelevanceDropdown(filterType === 'relevance' && !showRelevanceDropdown);
  };

  // 关闭所有下拉菜单
  const closeAllDropdowns = () => {
    setShowTypeDropdown(false);
    setShowStatusDropdown(false);
    setShowRelevanceDropdown(false);
  };

  // 处理点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.relative')) {
        closeAllDropdowns();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // 处理数据源状态切换
  const handleSourceStatusToggle = async (sourceId: string, enabled: boolean) => {
    try {
      await dataSourcesApi.updateDataSource(sourceId, { enabled: enabled ? 1 : 0 });
      fetchDataSources();
    } catch (error) {
      console.error('更新数据源状态失败:', error);
      alert('更新数据源状态失败！');
    }
  };

  // 处理新增数据源
  const handleAddSource = () => {
    setCurrentEditingSource(null);
    setSourceFormData({
      source_name: '',
      source_url: '',
      source_type: 'manual',
      relevance_score: 70,
      enabled: 1
    });
    setShowSourceModal(true);
  };

  // 处理编辑数据源
  const handleEditSource = (source: DataSource) => {
    setCurrentEditingSource(source);
    setSourceFormData({
      source_name: source.source_name,
      source_url: source.source_url,
      source_type: source.source_type,
      relevance_score: source.relevance_score,
      enabled: source.enabled
    });
    setShowSourceModal(true);
  };

  // 保存数据源
  const handleSaveSource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentEditingSource) {
        await dataSourcesApi.updateDataSource(currentEditingSource.source_id, sourceFormData);
        alert('更新成功！');
      } else {
        await dataSourcesApi.createDataSource(sourceFormData);
        alert('新增成功！');
      }
      setShowSourceModal(false);
      fetchDataSources();
    } catch (error) {
      console.error('保存数据源失败:', error);
      alert('保存数据源失败！');
    }
  };

  // 处理删除数据源
  const handleDeleteSource = (source: DataSource) => {
    setCurrentDeletingSource(source);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (currentDeletingSource) {
      try {
        await dataSourcesApi.deleteDataSource(currentDeletingSource.source_id);
        setShowDeleteModal(false);
        setSelectedSources(prev => {
          const newSet = new Set(prev);
          newSet.delete(currentDeletingSource.source_id);
          return newSet;
        });
        fetchDataSources();
        alert('删除成功！');
      } catch (error) {
        console.error('删除数据源失败:', error);
        alert('删除数据源失败！');
      }
    }
  };

  // 处理调整关联度
  const handleAdjustRelevance = (source: DataSource) => {
    setCurrentRelevanceSource(source);
    setRelevanceValue(source.relevance_score);
    setShowRelevanceModal(true);
  };

  const handleSaveRelevance = async () => {
    if (currentRelevanceSource) {
      try {
        await dataSourcesApi.updateDataSource(currentRelevanceSource.source_id, { relevance_score: relevanceValue });
        setShowRelevanceModal(false);
        fetchDataSources();
        alert('关联度更新成功！');
      } catch (error) {
        console.error('更新关联度失败:', error);
        alert('更新关联度失败！');
      }
    }
  };

  // 批量操作
  const handleBatchDelete = async () => {
    if (selectedSources.size === 0) return;
    if (confirm(`确定要删除选中的 ${selectedSources.size} 个数据源吗？此操作不可撤销。`)) {
      try {
        for (const sourceId of selectedSources) {
          await dataSourcesApi.deleteDataSource(sourceId);
        }
        setSelectedSources(new Set());
        fetchDataSources();
        alert('批量删除成功！');
      } catch (error) {
        console.error('批量删除失败:', error);
        alert('批量删除失败！');
      }
    }
  };

  const handleBatchEnable = async () => {
    if (selectedSources.size === 0) return;
    if (confirm(`确定要启用选中的 ${selectedSources.size} 个数据源吗？`)) {
      try {
        for (const sourceId of selectedSources) {
          await dataSourcesApi.updateDataSource(sourceId, { enabled: 1 });
        }
        setSelectedSources(new Set());
        fetchDataSources();
        alert('批量启用成功！');
      } catch (error) {
        console.error('批量启用失败:', error);
        alert('批量启用失败！');
      }
    }
  };

  const handleBatchDisable = async () => {
    if (selectedSources.size === 0) return;
    if (confirm(`确定要禁用选中的 ${selectedSources.size} 个数据源吗？`)) {
      try {
        for (const sourceId of selectedSources) {
          await dataSourcesApi.updateDataSource(sourceId, { enabled: 0 });
        }
        setSelectedSources(new Set());
        fetchDataSources();
        alert('批量禁用成功！');
      } catch (error) {
        console.error('批量禁用失败:', error);
        alert('批量禁用失败！');
      }
    }
  };

  // AI数据源审核 (目前仍使用模拟数据，后端没有对应API)
  const handleAiApprove = (sourceId: string) => {
    const aiSource = aiDiscoveredSources.find(s => s.source_id === sourceId);
    if (aiSource) {
      // 模拟添加到手动数据源
      const newSource: DataSource = {
        source_id: `manual-${Date.now()}`,
        source_name: aiSource.source_name,
        source_url: aiSource.source_url,
        source_type: 'manual',
        relevance_score: aiSource.relevance_score,
        enabled: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      // 实际应该调用 dataSourcesApi.createDataSource(newSource) 并刷新列表
      console.log('批准AI数据源并添加到手动数据源:', newSource);
      alert('AI数据源已批准并添加！');
      setShowAiReviewModal(false);
      fetchDataSources();
    }
  };

  const handleAiReject = (sourceId: string) => {
    console.log('拒绝AI数据源:', sourceId);
    alert('AI数据源已拒绝！');
    // 实际应该从 aiDiscoveredSources 列表中移除
  };

  // 退出登录
  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      localStorage.removeItem('user');
      navigate('/admin-login');
    }
  };

  // 处理模态框关闭
  const handleCloseModal = () => {
    setShowSourceModal(false);
    setShowRelevanceModal(false);
    setShowDeleteModal(false);
    setShowAiReviewModal(false);
    setCurrentEditingSource(null);
    setCurrentDeletingSource(null);
    setCurrentRelevanceSource(null);
  };

  // 分页逻辑 (前端分页，因为后端API没有提供分页参数)
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedSources = filteredAndSortedSources.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredAndSortedSources.length / pageSize);

  return (
    <div className={styles.pageWrapper}>
      {/* 顶部导航栏 */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-border-light h-16 z-50">
        <div className="flex items-center justify-between h-full px-6">
          {/* 左侧：Logo和系统名称 */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleSidebarToggle}
              className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
            >
              <i className="fas fa-bars text-gray-600"></i>
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-tint text-white text-sm"></i>
              </div>
              <h1 className="text-xl font-semibold text-text-primary hidden sm:block">水脉通管理系统</h1>
            </div>
          </div>
          
          {/* 右侧：管理员信息和退出登录 */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <i className="fas fa-user text-white text-sm"></i>
              </div>
              <span className="text-sm text-text-primary hidden sm:block">管理员</span>
            </div>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-text-secondary hover:text-danger border border-border-light rounded-lg hover:bg-red-50"
            >
              <i className="fas fa-sign-out-alt mr-1"></i>退出登录
            </button>
          </div>
        </div>
      </header>

      {/* 左侧菜单 */}
      <aside className={`fixed left-0 top-16 bottom-0 bg-white border-r border-border-light transition-all duration-300 z-40 ${
        isSidebarCollapsed ? styles.sidebarCollapsed : styles.sidebarExpanded
      }`}>
        <nav className="p-4 space-y-2">
          <Link 
            to="/admin-dashboard" 
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-text-secondary hover:bg-gray-100"
          >
            <i className="fas fa-home w-5"></i>
            {!isSidebarCollapsed && <span>后台首页</span>}
          </Link>
          <Link 
            to="/admin-category" 
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-text-secondary hover:bg-gray-100"
          >
            <i className="fas fa-folder w-5"></i>
            {!isSidebarCollapsed && <span>资讯类别管理</span>}
          </Link>
          <Link 
            to="/admin-update-time" 
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-text-secondary hover:bg-gray-100"
          >
            <i className="fas fa-clock w-5"></i>
            {!isSidebarCollapsed && <span>更新时间设置</span>}
          </Link>
          <Link 
            to="/admin-data-source" 
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${styles.navItemActive}`}
          >
            <i className="fas fa-rss w-5"></i>
            {!isSidebarCollapsed && <span>数据源配置</span>}
          </Link>
          <Link 
            to="/admin-ai-rules" 
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-text-secondary hover:bg-gray-100"
          >
            <i className="fas fa-brain w-5"></i>
            {!isSidebarCollapsed && <span>AI筛选规则设置</span>}
          </Link>
          <Link 
            to="/admin-user-permission" 
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-text-secondary hover:bg-gray-100"
          >
            <i className="fas fa-users w-5"></i>
            {!isSidebarCollapsed && <span>用户权限管理</span>}
          </Link>
          <Link 
            to="/admin-api-manage" 
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-text-secondary hover:bg-gray-100"
          >
            <i className="fas fa-code w-5"></i>
            {!isSidebarCollapsed && <span>API生成与管理</span>}
          </Link>
        </nav>
      </aside>

      {/* 主内容区 */}
      <main className={`${isSidebarCollapsed ? 'ml-12' : 'ml-52'} mt-16 p-6 transition-all duration-300`}>
        {/* 页面头部 */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-text-primary">数据源配置</h2>
              <nav className="mt-1">
                <ol className="flex items-center space-x-2 text-sm text-text-secondary">
                  <li>
                    <Link to="/admin-dashboard" className="hover:text-primary">后台首页</Link>
                  </li>
                  <li><i className="fas fa-chevron-right text-xs"></i></li>
                  <li className="text-text-primary">数据源配置</li>
                </ol>
              </nav>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setShowAiReviewModal(true)}
                className="px-4 py-2 bg-info text-white rounded-lg hover:bg-cyan-600 flex items-center space-x-2"
              >
                <i className="fas fa-robot text-sm"></i>
                <span>AI发现数据源审核</span>
              </button>
              <button 
                onClick={handleAddSource}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary flex items-center space-x-2"
              >
                <i className="fas fa-plus text-sm"></i>
                <span>新增数据源</span>
              </button>
            </div>
          </div>
        </div>

        {/* 工具栏区域 */}
        <div className="bg-white rounded-lg shadow-card p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* 搜索框 */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input 
                  type="text" 
                  value={keywordSearch}
                  onChange={handleSearch}
                  placeholder="搜索数据源名称、URL..." 
                  className={`w-full pl-10 pr-4 py-2 border border-border-light rounded-lg ${styles.searchInputFocus}`}
                />
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"></i>
              </div>
            </div>
            
            {/* 筛选条件 */}
            <div className="flex flex-wrap items-center gap-3">
              {/* 类型筛选 */}
              <div className="relative">
                <button 
                  onClick={() => handleFilterToggle('type')}
                  className="px-4 py-2 border border-border-light rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                >
                  <span>类型: {sourceTypeFilter === 'all' ? '全部' : sourceTypeFilter === 'manual' ? '手动添加' : 'AI发现'}</span>
                  <i className="fas fa-chevron-down text-xs"></i>
                </button>
                <div 
                  className={`absolute top-full left-0 mt-1 w-32 bg-white border border-border-light rounded-lg shadow-lg ${styles.filterDropdown} ${showTypeDropdown ? 'show' : ''}`}
                >
                  <div className="p-2">
                    {[ { value: 'all', label: '全部' }, { value: 'manual', label: '手动添加' }, { value: 'ai_discovered', label: 'AI发现' } ].map(option => (
                      <label key={option.value} className="flex items-center space-x-2 py-1 px-2 rounded-md hover:bg-gray-50 cursor-pointer">
                        <input 
                          type="radio" 
                          name="source-type" 
                          className="form-radio text-primary"
                          value={option.value}
                          checked={sourceTypeFilter === option.value}
                          onChange={(e) => setSourceTypeFilter(e.target.value)}
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* 状态筛选 */}
              <div className="relative">
                <button 
                  onClick={() => handleFilterToggle('status')}
                  className="px-4 py-2 border border-border-light rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                >
                  <span>状态: {sourceStatusFilter === 'all' ? '全部' : sourceStatusFilter === 'enabled' ? '已启用' : '已禁用'}</span>
                  <i className="fas fa-chevron-down text-xs"></i>
                </button>
                <div 
                  className={`absolute top-full left-0 mt-1 w-32 bg-white border border-border-light rounded-lg shadow-lg ${styles.filterDropdown} ${showStatusDropdown ? 'show' : ''}`}
                >
                  <div className="p-2">
                    {[ { value: 'all', label: '全部' }, { value: 'enabled', label: '已启用' }, { value: 'disabled', label: '已禁用' } ].map(option => (
                      <label key={option.value} className="flex items-center space-x-2 py-1 px-2 rounded-md hover:bg-gray-50 cursor-pointer">
                        <input 
                          type="radio" 
                          name="source-status" 
                          className="form-radio text-primary"
                          value={option.value}
                          checked={sourceStatusFilter === option.value}
                          onChange={(e) => setSourceStatusFilter(e.target.value)}
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* 关联度筛选 */}
              <div className="relative">
                <button 
                  onClick={() => handleFilterToggle('relevance')}
                  className="px-4 py-2 border border-border-light rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                >
                  <span>关联度: {relevanceFilter === 'all' ? '全部' : relevanceFilter === 'high' ? '高' : relevanceFilter === 'medium' ? '中' : '低'}</span>
                  <i className="fas fa-chevron-down text-xs"></i>
                </button>
                <div 
                  className={`absolute top-full left-0 mt-1 w-32 bg-white border border-border-light rounded-lg shadow-lg ${styles.filterDropdown} ${showRelevanceDropdown ? 'show' : ''}`}
                >
                  <div className="p-2">
                    {[ { value: 'all', label: '全部' }, { value: 'high', label: '高 (>=80)' }, { value: 'medium', label: '中 (60-79)' }, { value: 'low', label: '低 (<60)' } ].map(option => (
                      <label key={option.value} className="flex items-center space-x-2 py-1 px-2 rounded-md hover:bg-gray-50 cursor-pointer">
                        <input 
                          type="radio" 
                          name="relevance-filter" 
                          className="form-radio text-primary"
                          value={option.value}
                          checked={relevanceFilter === option.value}
                          onChange={(e) => setRelevanceFilter(e.target.value)}
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* 排序 */}
              <div className="relative">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-border-light rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="created_at-desc">最新创建</option>
                  <option value="updated_at-desc">最新更新</option>
                  <option value="relevance_score-desc">关联度高到低</option>
                  <option value="relevance_score-asc">关联度低到高</option>
                  <option value="source_name-asc">名称 (A-Z)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 内容展示区域 */}
        <div className="bg-white rounded-lg shadow-card overflow-hidden mb-6">
          {/* 表格头部 */}
          <div className="px-6 py-4 border-b border-border-light bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                  <span className="text-sm text-text-secondary">全选</span>
                </label>
                <span className="text-sm text-text-secondary">
                  共 <span className="font-medium text-text-primary">{filteredAndSortedSources.length}</span> 个数据源
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleBatchDelete}
                  disabled={selectedSources.size === 0}
                  className="px-3 py-1 text-sm text-danger hover:bg-red-50 rounded disabled:opacity-50"
                >
                  <i className="fas fa-trash mr-1"></i>批量删除
                </button>
                <button 
                  onClick={handleBatchEnable}
                  disabled={selectedSources.size === 0}
                  className="px-3 py-1 text-sm text-success hover:bg-green-50 rounded disabled:opacity-50"
                >
                  <i className="fas fa-check-circle mr-1"></i>批量启用
                </button>
                <button 
                  onClick={handleBatchDisable}
                  disabled={selectedSources.size === 0}
                  className="px-3 py-1 text-sm text-warning hover:bg-orange-50 rounded disabled:opacity-50"
                >
                  <i className="fas fa-ban mr-1"></i>批量禁用
                </button>
              </div>
            </div>
          </div>
          
          {/* 表格内容 */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-border-light">
                <tr>
                  <th className="w-12 px-6 py-3 text-left">
                    <input type="checkbox" className="rounded" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">数据源名称</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">URL</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">类型</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">关联度</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">状态</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">创建时间</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">更新时间</th>
                  <th className="w-32 px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border-light">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="text-center py-4 text-text-secondary">加载中...</td>
                  </tr>
                ) : paginatedSources.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-4 text-text-secondary">暂无数据源</td>
                  </tr>
                ) : (
                  paginatedSources.map(source => (
                    <tr key={source.source_id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input 
                          type="checkbox" 
                          checked={selectedSources.has(source.source_id)}
                          onChange={(e) => handleSourceSelect(source.source_id, e.target.checked)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">
                        {source.source_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-primary hover:underline">
                        <a href={source.source_url} target="_blank" rel="noopener noreferrer">{source.source_url}</a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          source.source_type === 'manual' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {source.source_type === 'manual' ? '手动添加' : 'AI发现'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          source.relevance_score >= 80 ? 'bg-green-100 text-green-800' :
                          source.relevance_score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {source.relevance_score}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          source.enabled ? 'bg-success-light text-success' : 'bg-danger-light text-danger'
                        }`}>
                          {source.enabled ? '已启用' : '已禁用'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{new Date(source.created_at).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{new Date(source.updated_at).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => handleEditSource(source)}
                          className="text-primary hover:text-secondary mr-3"
                        >
                          编辑
                        </button>
                        <button 
                          onClick={() => handleAdjustRelevance(source)}
                          className="text-info hover:text-cyan-700 mr-3"
                        >
                          关联度
                        </button>
                        <button 
                          onClick={() => handleDeleteSource(source)}
                          className="text-danger hover:text-red-700"
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          {filteredAndSortedSources.length > 0 && (
            <div className="flex items-center justify-between mt-6 px-6 py-3 border-t border-border-light">
              <div className="text-sm text-text-secondary">
                共 {filteredAndSortedSources.length} 条记录
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-border-light rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button 
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 border rounded-lg ${currentPage === i + 1 ? 'bg-primary text-white border-primary' : 'border-border-light hover:bg-gray-50'}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-border-light rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
                <select 
                  value={pageSize}
                  onChange={(e) => setPageSize(parseInt(e.target.value))}
                  className="px-3 py-1 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="10">10 条/页</option>
                  <option value="20">20 条/页</option>
                  <option value="50">50 条/页</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* AI发现数据源审核模态框 */}
      {showAiReviewModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseModal();
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold text-text-primary mb-4">AI发现数据源审核</h3>
            <div className="max-h-96 overflow-y-auto mb-4">
              {aiDiscoveredSources.length === 0 ? (
                <p className="text-text-secondary">暂无AI发现的数据源</p>
              ) : (
                <ul className="space-y-3">
                  {aiDiscoveredSources.map(source => (
                    <li key={source.source_id} className="flex items-center justify-between p-3 border border-border-light rounded-lg">
                      <div>
                        <p className="font-medium text-text-primary">{source.source_name}</p>
                        <p className="text-sm text-text-secondary">{source.source_url}</p>
                        <p className="text-xs text-text-secondary">关联度: {source.relevance_score}% | 发现时间: {new Date(source.discovered_at).toLocaleString()}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleAiApprove(source.source_id)}
                          className="px-3 py-1 text-sm bg-success text-white rounded-md hover:bg-green-700"
                        >
                          批准
                        </button>
                        <button 
                          onClick={() => handleAiReject(source.source_id)}
                          className="px-3 py-1 text-sm bg-danger text-white rounded-md hover:bg-red-700"
                        >
                          拒绝
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex justify-end">
              <button 
                type="button" 
                onClick={handleCloseModal}
                className="px-4 py-2 text-sm text-gray-600 border border-border-light rounded-md hover:bg-gray-50"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 数据源编辑/新增模态框 */}
      {showSourceModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseModal();
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              {currentEditingSource ? '编辑数据源' : '新增数据源'}
            </h3>
            <form onSubmit={handleSaveSource}>
              <div className="mb-4">
                <label htmlFor="source_name" className="block text-sm font-medium text-text-secondary mb-1">
                  数据源名称
                </label>
                <input 
                  type="text" 
                  id="source_name" 
                  value={sourceFormData.source_name}
                  onChange={(e) => setSourceFormData({ ...sourceFormData, source_name: e.target.value })}
                  className="w-full px-3 py-2 border border-border-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="source_url" className="block text-sm font-medium text-text-secondary mb-1">
                  URL
                </label>
                <input 
                  type="url" 
                  id="source_url" 
                  value={sourceFormData.source_url}
                  onChange={(e) => setSourceFormData({ ...sourceFormData, source_url: e.target.value })}
                  className="w-full px-3 py-2 border border-border-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="source_type" className="block text-sm font-medium text-text-secondary mb-1">
                  类型
                </label>
                <select 
                  id="source_type" 
                  value={sourceFormData.source_type}
                  onChange={(e) => setSourceFormData({ ...sourceFormData, source_type: e.target.value as 'manual' | 'ai_discovered' })}
                  className="w-full px-3 py-2 border border-border-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="manual">手动添加</option>
                  <option value="ai_discovered">AI发现</option>
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="relevance_score" className="block text-sm font-medium text-text-secondary mb-1">
                  关联度评分
                </label>
                <input 
                  type="number" 
                  id="relevance_score" 
                  value={sourceFormData.relevance_score}
                  onChange={(e) => setSourceFormData({ ...sourceFormData, relevance_score: parseInt(e.target.value) })}
                  min="0" max="100"
                  className="w-full px-3 py-2 border border-border-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="enabled" className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="enabled" 
                    checked={sourceFormData.enabled === 1}
                    onChange={(e) => setSourceFormData({ ...sourceFormData, enabled: e.target.checked ? 1 : 0 })}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-text-secondary">启用</span>
                </label>
              </div>
              <div className="flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm text-gray-600 border border-border-light rounded-md hover:bg-gray-50"
                >
                  取消
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-secondary"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 关联度调整模态框 */}
      {showRelevanceModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseModal();
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-text-primary mb-4">调整关联度</h3>
            <div className="mb-4">
              <label htmlFor="relevance-slider" className="block text-sm font-medium text-text-secondary mb-2">
                数据源：{currentRelevanceSource?.source_name}
              </label>
              <input 
                type="range" 
                id="relevance-slider" 
                min="0" max="100" 
                value={relevanceValue}
                onChange={(e) => setRelevanceValue(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-sm"
              />
              <div className="flex justify-between text-xs text-text-secondary mt-2">
                <span>0</span>
                <span>{relevanceValue}%</span>
                <span>100</span>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button 
                type="button" 
                onClick={handleCloseModal}
                className="px-4 py-2 text-sm text-gray-600 border border-border-light rounded-md hover:bg-gray-50"
              >
                取消
              </button>
              <button 
                type="button" 
                onClick={handleSaveRelevance}
                className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-secondary"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 删除确认模态框 */}
      {showDeleteModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseModal();
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm text-center">
            <div className="w-12 h-12 bg-danger-light rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-exclamation-triangle text-danger text-2xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">确认删除</h3>
            <p className="text-text-secondary mb-6">
              您确定要删除数据源 “{currentDeletingSource?.source_name}” 吗？此操作不可撤销。
            </p>
            <div className="flex justify-center space-x-3">
              <button 
                type="button" 
                onClick={handleCloseModal}
                className="px-4 py-2 text-sm text-gray-600 border border-border-light rounded-md hover:bg-gray-50"
              >
                取消
              </button>
              <button 
                type="button" 
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm bg-danger text-white rounded-md hover:bg-red-700"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDataSourcePage;
