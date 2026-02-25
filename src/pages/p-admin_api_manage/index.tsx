

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';

interface ApiKey {
  id: string;
  key: string;
  description: string;
  creator: string;
  createTime: string;
  enabled: boolean;
}

interface ApiLog {
  time: string;
  method: string;
  path: string;
  status: number;
  duration: number;
  ip: string;
}

const AdminApiManagePage: React.FC = () => {
  const navigate = useNavigate();
  
  // 状态管理
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedApiKeys, setSelectedApiKeys] = useState<string[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [gotoPage, setGotoPage] = useState('');
  
  // 模态框状态
  const [showGenerateApiModal, setShowGenerateApiModal] = useState(false);
  const [showEditPermissionModal, setShowEditPermissionModal] = useState(false);
  const [showApiLogsModal, setShowApiLogsModal] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  
  // 当前操作的API密钥ID
  const [currentEditApiKeyId, setCurrentEditApiKeyId] = useState<string | null>(null);
  const [currentViewLogsApiKeyId, setCurrentViewLogsApiKeyId] = useState<string | null>(null);
  const [currentDeleteApiKeyId, setCurrentDeleteApiKeyId] = useState<string | null>(null);
  
  // 表单数据
  const [apiDescription, setApiDescription] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(['read_news', 'read_categories', 'read_sources']);
  
  // API密钥数据
  const [apiKeys] = useState<ApiKey[]>([
    {
      id: 'api_key_001',
      key: 'sk_water_2563e...',
      description: '水务APP生产环境调用密钥',
      creator: '管理员',
      createTime: '2024-01-15 10:30',
      enabled: true
    },
    {
      id: 'api_key_002',
      key: 'sk_water_7892a...',
      description: '数据分析平台调用密钥',
      creator: '管理员',
      createTime: '2024-01-14 16:45',
      enabled: true
    },
    {
      id: 'api_key_003',
      key: 'sk_water_4567b...',
      description: '测试环境密钥',
      creator: '开发人员',
      createTime: '2024-01-13 09:20',
      enabled: false
    },
    {
      id: 'api_key_004',
      key: 'sk_water_1234c...',
      description: '合作伙伴系统集成密钥',
      creator: '管理员',
      createTime: '2024-01-12 14:15',
      enabled: true
    },
    {
      id: 'api_key_005',
      key: 'sk_water_8901d...',
      description: '移动端小程序调用密钥',
      creator: '管理员',
      createTime: '2024-01-11 11:30',
      enabled: false
    }
  ]);
  
  // API调用日志数据
  const [apiLogs] = useState<ApiLog[]>([
    {
      time: '2024-01-15 14:30:25',
      method: 'GET',
      path: '/api/news',
      status: 200,
      duration: 156,
      ip: '192.168.1.100'
    },
    {
      time: '2024-01-15 14:28:12',
      method: 'GET',
      path: '/api/categories',
      status: 200,
      duration: 89,
      ip: '192.168.1.101'
    },
    {
      time: '2024-01-15 14:25:43',
      method: 'GET',
      path: '/api/news/123',
      status: 404,
      duration: 45,
      ip: '192.168.1.102'
    }
  ]);

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = 'API生成与管理 - 水脉通';
    return () => { document.title = originalTitle; };
  }, []);

  // 侧边栏切换
  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // 退出登录
  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      navigate('/admin-login');
    }
  };

  // 全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedApiKeys(apiKeys.map(key => key.id));
    } else {
      setSelectedApiKeys([]);
    }
  };

  // 单个选择
  const handleSelectApiKey = (apiKeyId: string, checked: boolean) => {
    if (checked) {
      setSelectedApiKeys([...selectedApiKeys, apiKeyId]);
    } else {
      setSelectedApiKeys(selectedApiKeys.filter(id => id !== apiKeyId));
    }
  };

  // 复制API密钥
  const handleCopyApiKey = async (apiKey: string) => {
    try {
      await navigator.clipboard.writeText(apiKey);
      // 复制成功的视觉反馈可以通过CSS动画实现
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // 切换API密钥状态
  const handleToggleApiKeyStatus = (apiKeyId: string) => {
    console.log('切换API密钥状态，ID：', apiKeyId);
    // 这里应该调用API来切换状态
  };

  // 生成API密钥
  const handleGenerateApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiDescription.trim()) {
      console.log('生成API密钥，描述：', apiDescription);
      alert('API密钥生成成功！');
      setShowGenerateApiModal(false);
      setApiDescription('');
    }
  };

  // 编辑API权限
  const handleEditPermission = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('编辑API权限，ID：', currentEditApiKeyId, '描述：', editDescription, '权限：', selectedPermissions);
    alert('API权限更新成功！');
    setShowEditPermissionModal(false);
    setCurrentEditApiKeyId(null);
    setEditDescription('');
    setSelectedPermissions(['read_news', 'read_categories', 'read_sources']);
  };

  // 删除API密钥
  const handleDeleteApiKey = () => {
    console.log('删除API密钥，ID：', currentDeleteApiKeyId);
    alert('API密钥删除成功！');
    setShowConfirmDeleteModal(false);
    setCurrentDeleteApiKeyId(null);
  };

  // 批量操作
  const handleBatchDelete = () => {
    if (selectedApiKeys.length > 0 && confirm(`确定要删除选中的 ${selectedApiKeys.length} 个API密钥吗？`)) {
      console.log('批量删除API密钥：', selectedApiKeys);
      alert('API密钥删除成功！');
    }
  };

  const handleBatchEnable = () => {
    if (selectedApiKeys.length > 0) {
      console.log('批量启用API密钥：', selectedApiKeys);
      alert('API密钥启用成功！');
    }
  };

  const handleBatchDisable = () => {
    if (selectedApiKeys.length > 0) {
      console.log('批量禁用API密钥：', selectedApiKeys);
      alert('API密钥禁用成功！');
    }
  };

  // 搜索
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      console.log('搜索API密钥，关键词：', searchKeyword);
    }
  };

  // 状态筛选
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    console.log('筛选API密钥状态：', value);
  };

  // 分页
  const handleGotoPage = () => {
    if (gotoPage && parseInt(gotoPage) >= 1 && parseInt(gotoPage) <= 3) {
      setCurrentPage(parseInt(gotoPage));
      console.log('跳转到页面：', gotoPage);
    }
  };

  // 页面大小改变
  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    setCurrentPage(1);
    console.log('每页显示：', value);
  };

  // 模态框背景点击关闭
  const handleModalOverlayClick = (e: React.MouseEvent, closeModal: () => void) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  // 权限复选框处理
  const handlePermissionChange = (permission: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions([...selectedPermissions, permission]);
    } else {
      setSelectedPermissions(selectedPermissions.filter(p => p !== permission));
    }
  };

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
      <aside className={`fixed left-0 top-16 bottom-0 bg-white border-r border-border-light transition-all duration-300 z-40 ${isSidebarCollapsed ? styles.sidebarCollapsed : styles.sidebarExpanded}`}>
        <nav className="p-4 space-y-2">
          <Link to="/admin-dashboard" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-text-secondary hover:bg-gray-100">
            <i className="fas fa-home w-5"></i>
            {!isSidebarCollapsed && <span>后台首页</span>}
          </Link>
          <Link to="/admin-category" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-text-secondary hover:bg-gray-100">
            <i className="fas fa-folder w-5"></i>
            {!isSidebarCollapsed && <span>资讯类别管理</span>}
          </Link>
          <Link to="/admin-update-time" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-text-secondary hover:bg-gray-100">
            <i className="fas fa-clock w-5"></i>
            {!isSidebarCollapsed && <span>更新时间设置</span>}
          </Link>
          <Link to="/admin-data-source" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-text-secondary hover:bg-gray-100">
            <i className="fas fa-rss w-5"></i>
            {!isSidebarCollapsed && <span>数据源配置</span>}
          </Link>
          <Link to="/admin-ai-rules" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-text-secondary hover:bg-gray-100">
            <i className="fas fa-brain w-5"></i>
            {!isSidebarCollapsed && <span>AI筛选规则设置</span>}
          </Link>
          <Link to="/admin-user-permission" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-text-secondary hover:bg-gray-100">
            <i className="fas fa-users w-5"></i>
            {!isSidebarCollapsed && <span>用户权限管理</span>}
          </Link>
          <Link to="/admin-api-manage" className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${styles.navItemActive}`}>
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
              <h2 className="text-2xl font-semibold text-text-primary">API生成与管理</h2>
              <nav className="mt-1">
                <ol className="flex items-center space-x-2 text-sm text-text-secondary">
                  <li><Link to="/admin-dashboard" className="hover:text-primary">后台首页</Link></li>
                  <li><i className="fas fa-chevron-right text-xs"></i></li>
                  <li className="text-text-primary">API生成与管理</li>
                </ol>
              </nav>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setShowGenerateApiModal(true)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary flex items-center space-x-2"
              >
                <i className="fas fa-plus text-sm"></i>
                <span>生成新API密钥</span>
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
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyPress={handleSearch}
                  placeholder="搜索API密钥描述..." 
                  className={`w-full pl-10 pr-4 py-2 border border-border-light rounded-lg ${styles.searchInputFocus}`}
                />
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"></i>
              </div>
            </div>
            
            {/* 状态筛选 */}
            <div className="flex items-center space-x-3">
              <select 
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:border-primary"
              >
                <option value="all">全部状态</option>
                <option value="enabled">已启用</option>
                <option value="disabled">已禁用</option>
              </select>
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
                    checked={selectedApiKeys.length === apiKeys.length && apiKeys.length > 0}
                    ref={(input) => {
                      if (input) input.indeterminate = selectedApiKeys.length > 0 && selectedApiKeys.length < apiKeys.length;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-text-secondary">全选</span>
                </label>
                <span className="text-sm text-text-secondary">共 <span className="font-medium text-text-primary">{apiKeys.length}</span> 个API密钥</span>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleBatchDelete}
                  disabled={selectedApiKeys.length === 0}
                  className="px-3 py-1 text-sm text-danger hover:bg-red-50 rounded disabled:opacity-50"
                >
                  <i className="fas fa-trash mr-1"></i>删除
                </button>
                <button 
                  onClick={handleBatchEnable}
                  disabled={selectedApiKeys.length === 0}
                  className="px-3 py-1 text-sm text-success hover:bg-green-50 rounded disabled:opacity-50"
                >
                  <i className="fas fa-check mr-1"></i>启用
                </button>
                <button 
                  onClick={handleBatchDisable}
                  disabled={selectedApiKeys.length === 0}
                  className="px-3 py-1 text-sm text-warning hover:bg-yellow-50 rounded disabled:opacity-50"
                >
                  <i className="fas fa-ban mr-1"></i>禁用
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    API密钥
                  </th>
                  <th className="w-52 px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    描述
                  </th>
                  <th className="w-32 px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary">
                    创建人 <i className="fas fa-sort ml-1"></i>
                  </th>
                  <th className="w-40 px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary">
                    创建时间 <i className="fas fa-sort ml-1"></i>
                  </th>
                  <th className="w-24 px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary">
                    状态 <i className="fas fa-sort ml-1"></i>
                  </th>
                  <th className="w-60 px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border-light">
                {apiKeys.map((apiKey) => (
                  <tr key={apiKey.id} className={styles.tableRowHover}>
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        checked={selectedApiKeys.includes(apiKey.id)}
                        onChange={(e) => handleSelectApiKey(apiKey.id, e.target.checked)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-text-primary font-mono">{apiKey.key}</span>
                        <button 
                          onClick={() => handleCopyApiKey(apiKey.key)}
                          className="text-text-secondary hover:text-primary text-xs" 
                          title="复制密钥"
                        >
                          <i className="fas fa-copy"></i>
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {apiKey.description}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {apiKey.creator}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {apiKey.createTime}
                    </td>
                    <td className="px-6 py-4">
                      <label className={styles.switch}>
                        <input 
                          type="checkbox" 
                          checked={apiKey.enabled}
                          onChange={() => handleToggleApiKeyStatus(apiKey.id)}
                          className={styles.statusToggle}
                        />
                        <span className={styles.slider}></span>
                      </label>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        <button 
                          onClick={() => {
                            setCurrentEditApiKeyId(apiKey.id);
                            setEditDescription(apiKey.description);
                            setShowEditPermissionModal(true);
                          }}
                          className="px-2 py-1 text-xs text-primary hover:bg-blue-50 rounded" 
                          title="编辑权限"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          onClick={() => handleToggleApiKeyStatus(apiKey.id)}
                          className={`px-2 py-1 text-xs rounded ${
                            apiKey.enabled 
                              ? 'text-warning hover:bg-yellow-50' 
                              : 'text-success hover:bg-green-50'
                          }`} 
                          title={apiKey.enabled ? "禁用" : "启用"}
                        >
                          <i className={`fas ${apiKey.enabled ? 'fa-ban' : 'fa-check'}`}></i>
                        </button>
                        <button 
                          onClick={() => {
                            setCurrentDeleteApiKeyId(apiKey.id);
                            setShowConfirmDeleteModal(true);
                          }}
                          className="px-2 py-1 text-xs text-danger hover:bg-red-50 rounded" 
                          title="删除"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                        <button 
                          onClick={() => {
                            setCurrentViewLogsApiKeyId(apiKey.id);
                            setShowApiLogsModal(true);
                          }}
                          className="px-2 py-1 text-xs text-info hover:bg-cyan-50 rounded" 
                          title="查看日志"
                        >
                          <i className="fas fa-list"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 分页区域 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-text-secondary">
              显示第 <span className="font-medium">1-{Math.min(pageSize, apiKeys.length)}</span> 条，共 <span className="font-medium">{apiKeys.length}</span> 条
            </span>
            <select 
              value={pageSize}
              onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
              className="px-3 py-1 border border-border-light rounded text-sm focus:outline-none focus:border-primary"
            >
              <option value="5">5条/页</option>
              <option value="10">10条/页</option>
              <option value="20">20条/页</option>
              <option value="50">50条/页</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-border-light rounded text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              <i className="fas fa-chevron-left mr-1"></i>上一页
            </button>
            
            <div className="flex items-center space-x-1">
              <button 
                onClick={() => setCurrentPage(1)}
                className={`px-3 py-1 rounded text-sm ${currentPage === 1 ? 'bg-primary text-white' : 'border border-border-light hover:bg-gray-50'}`}
              >
                1
              </button>
              <button 
                onClick={() => setCurrentPage(2)}
                className={`px-3 py-1 rounded text-sm ${currentPage === 2 ? 'bg-primary text-white' : 'border border-border-light hover:bg-gray-50'}`}
              >
                2
              </button>
              <button 
                onClick={() => setCurrentPage(3)}
                className={`px-3 py-1 rounded text-sm ${currentPage === 3 ? 'bg-primary text-white' : 'border border-border-light hover:bg-gray-50'}`}
              >
                3
              </button>
            </div>
            
            <button 
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === 3}
              className="px-3 py-1 border border-border-light rounded text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              下一页<i className="fas fa-chevron-right ml-1"></i>
            </button>
            
            <div className="flex items-center space-x-2 ml-4">
              <span className="text-sm text-text-secondary">跳转到</span>
              <input 
                type="number" 
                value={gotoPage}
                onChange={(e) => setGotoPage(e.target.value)}
                min="1" 
                max="3" 
                className="w-16 px-2 py-1 border border-border-light rounded text-sm text-center focus:outline-none focus:border-primary"
              />
              <span className="text-sm text-text-secondary">页</span>
              <button 
                onClick={handleGotoPage}
                className="px-3 py-1 bg-primary text-white rounded text-sm hover:bg-secondary"
              >
                跳转
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* 生成API密钥弹窗 */}
      {showGenerateApiModal && (
        <div className="fixed inset-0 z-50">
          <div 
            className={styles.modalOverlay}
            onClick={(e) => handleModalOverlayClick(e, () => setShowGenerateApiModal(false))}
          ></div>
          <div className="relative flex items-center justify-center min-h-screen p-4">
            <div className={`bg-white rounded-lg shadow-xl max-w-md w-full ${styles.modalEnter} ${styles.modalEnterActive}`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-primary">生成新API密钥</h3>
                  <button 
                    onClick={() => setShowGenerateApiModal(false)}
                    className="text-text-secondary hover:text-text-primary"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                
                <form onSubmit={handleGenerateApiKey} className="space-y-4">
                  <div>
                    <label htmlFor="api-description" className="block text-sm font-medium text-text-primary mb-2">描述</label>
                    <input 
                      type="text" 
                      id="api-description" 
                      value={apiDescription}
                      onChange={(e) => setApiDescription(e.target.value)}
                      className={`w-full px-3 py-2 border border-border-light rounded-lg ${styles.searchInputFocus}`}
                      placeholder="请输入API密钥描述" 
                      required 
                    />
                  </div>
                  
                  <div className="pt-4">
                    <button type="submit" className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary">
                      生成密钥
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 编辑API权限弹窗 */}
      {showEditPermissionModal && (
        <div className="fixed inset-0 z-50">
          <div 
            className={styles.modalOverlay}
            onClick={(e) => handleModalOverlayClick(e, () => setShowEditPermissionModal(false))}
          ></div>
          <div className="relative flex items-center justify-center min-h-screen p-4">
            <div className={`bg-white rounded-lg shadow-xl max-w-lg w-full ${styles.modalEnter} ${styles.modalEnterActive}`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-primary">编辑API权限</h3>
                  <button 
                    onClick={() => setShowEditPermissionModal(false)}
                    className="text-text-secondary hover:text-text-primary"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                
                <form onSubmit={handleEditPermission} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">API密钥</label>
                    <div className="bg-gray-50 px-3 py-2 rounded-lg text-sm font-mono text-text-secondary">
                      sk_water_xxxx...
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="edit-description" className="block text-sm font-medium text-text-primary mb-2">描述</label>
                    <input 
                      type="text" 
                      id="edit-description" 
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className={`w-full px-3 py-2 border border-border-light rounded-lg ${styles.searchInputFocus}`}
                      placeholder="请输入API密钥描述" 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">访问权限</label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          checked={selectedPermissions.includes('read_news')}
                          onChange={(e) => handlePermissionChange('read_news', e.target.checked)}
                          className="rounded" 
                        />
                        <span className="text-sm">读取资讯</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          checked={selectedPermissions.includes('read_categories')}
                          onChange={(e) => handlePermissionChange('read_categories', e.target.checked)}
                          className="rounded" 
                        />
                        <span className="text-sm">读取分类</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          checked={selectedPermissions.includes('read_sources')}
                          onChange={(e) => handlePermissionChange('read_sources', e.target.checked)}
                          className="rounded" 
                        />
                        <span className="text-sm">读取数据源</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          checked={selectedPermissions.includes('api_logs')}
                          onChange={(e) => handlePermissionChange('api_logs', e.target.checked)}
                          className="rounded" 
                        />
                        <span className="text-sm">查看调用日志</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <button type="submit" className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary">
                      保存更改
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API调用日志弹窗 */}
      {showApiLogsModal && (
        <div className="fixed inset-0 z-50">
          <div 
            className={styles.modalOverlay}
            onClick={(e) => handleModalOverlayClick(e, () => setShowApiLogsModal(false))}
          ></div>
          <div className="relative flex items-center justify-center min-h-screen p-4">
            <div className={`bg-white rounded-lg shadow-xl max-w-4xl w-full ${styles.modalEnter} ${styles.modalEnterActive}`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-primary">API调用日志</h3>
                  <button 
                    onClick={() => setShowApiLogsModal(false)}
                    className="text-text-secondary hover:text-text-primary"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-border-light">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">时间</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">方法</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">路径</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">状态</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">耗时(ms)</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">IP地址</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-border-light">
                      {apiLogs.map((log, index) => (
                        <tr key={index} className={styles.tableRowHover}>
                          <td className="px-4 py-3 text-sm text-text-secondary">{log.time}</td>
                          <td className="px-4 py-3 text-sm text-text-secondary">{log.method}</td>
                          <td className="px-4 py-3 text-sm text-text-secondary">{log.path}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                              log.status === 200 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-text-secondary">{log.duration}</td>
                          <td className="px-4 py-3 text-sm text-text-secondary">{log.ip}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 确认删除弹窗 */}
      {showConfirmDeleteModal && (
        <div className="fixed inset-0 z-50">
          <div 
            className={styles.modalOverlay}
            onClick={(e) => handleModalOverlayClick(e, () => setShowConfirmDeleteModal(false))}
          ></div>
          <div className="relative flex items-center justify-center min-h-screen p-4">
            <div className={`bg-white rounded-lg shadow-xl max-w-md w-full ${styles.modalEnter} ${styles.modalEnterActive}`}>
              <div className="p-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-exclamation-triangle text-danger text-xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">确认删除</h3>
                  <p className="text-text-secondary mb-6">确定要删除这个API密钥吗？删除后将无法恢复，且使用该密钥的应用将无法正常调用API。</p>
                  
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => setShowConfirmDeleteModal(false)}
                      className="flex-1 px-4 py-2 border border-border-light rounded-lg hover:bg-gray-50"
                    >
                      取消
                    </button>
                    <button 
                      onClick={handleDeleteApiKey}
                      className="flex-1 px-4 py-2 bg-danger text-white rounded-lg hover:bg-red-600"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApiManagePage;

