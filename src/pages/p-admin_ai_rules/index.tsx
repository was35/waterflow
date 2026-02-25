

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';

interface AIRule {
  id: string;
  name: string;
  type: 'keyword' | 'correlation' | 'quality' | 'topic';
  description: string;
  createTime: string;
  updateTime: string;
}

interface RuleFormData {
  name: string;
  type: string;
  description: string;
}

const AdminAiRulesPage: React.FC = () => {
  const navigate = useNavigate();
  
  // 状态管理
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isRuleModalVisible, setIsRuleModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [currentEditingRuleId, setCurrentEditingRuleId] = useState<string | null>(null);
  const [currentDeletingRuleId, setCurrentDeletingRuleId] = useState<string | null>(null);
  const [selectedRules, setSelectedRules] = useState<Set<string>>(new Set());
  const [searchKeyword, setSearchKeyword] = useState('');
  const [ruleTypeFilter, setRuleTypeFilter] = useState('');
  const [ruleFormData, setRuleFormData] = useState<RuleFormData>({
    name: '',
    type: '',
    description: ''
  });

  // 模拟AI规则数据
  const [aiRules] = useState<AIRule[]>([
    {
      id: 'rule-001',
      name: '水务政策关键词匹配',
      type: 'keyword',
      description: '包含"水务政策"、"水资源管理"、"水利法规"等关键词',
      createTime: '2024-01-10 14:30',
      updateTime: '2024-01-15 09:15'
    },
    {
      id: 'rule-002',
      name: '技术创新相关性排序',
      type: 'correlation',
      description: '基于技术创新相关度进行智能排序',
      createTime: '2024-01-08 16:45',
      updateTime: '2024-01-14 11:20'
    },
    {
      id: 'rule-003',
      name: '内容质量评分标准',
      type: 'quality',
      description: '基于内容完整性、专业性、时效性评分',
      createTime: '2024-01-05 10:20',
      updateTime: '2024-01-13 15:30'
    },
    {
      id: 'rule-004',
      name: '主题自动分类规则',
      type: 'topic',
      description: '自动识别并分类为政策、技术、市场、案例等主题',
      createTime: '2024-01-03 09:15',
      updateTime: '2024-01-12 16:45'
    },
    {
      id: 'rule-005',
      name: '市场动态关键词匹配',
      type: 'keyword',
      description: '包含"市场动态"、"行业趋势"、"投资分析"等关键词',
      createTime: '2024-01-01 11:30',
      updateTime: '2024-01-11 10:15'
    }
  ]);

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = 'AI筛选规则设置 - 水脉通';
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

  // 搜索功能
  const handleSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      console.log('搜索AI规则:', searchKeyword);
    }
  };

  // 规则类型筛选
  const handleRuleTypeFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRuleTypeFilter(event.target.value);
    console.log('筛选规则类型:', event.target.value);
  };

  // 全选/取消全选
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedRules(new Set(aiRules.map(rule => rule.id)));
    } else {
      setSelectedRules(new Set());
    }
  };

  // 单个规则选择
  const handleRuleSelect = (ruleId: string, checked: boolean) => {
    const newSelectedRules = new Set(selectedRules);
    if (checked) {
      newSelectedRules.add(ruleId);
    } else {
      newSelectedRules.delete(ruleId);
    }
    setSelectedRules(newSelectedRules);
  };

  // 批量删除
  const handleBatchDelete = () => {
    if (selectedRules.size > 0) {
      if (confirm(`确定要删除选中的 ${selectedRules.size} 个规则吗？`)) {
        console.log('批量删除规则');
      }
    }
  };

  // 新增规则
  const handleAddRule = () => {
    setCurrentEditingRuleId(null);
    setRuleFormData({ name: '', type: '', description: '' });
    setIsRuleModalVisible(true);
  };

  // 编辑规则
  const handleEditRule = (ruleId: string) => {
    const rule = aiRules.find(r => r.id === ruleId);
    if (rule) {
      setCurrentEditingRuleId(ruleId);
      setRuleFormData({
        name: rule.name,
        type: rule.type,
        description: rule.description
      });
      setIsRuleModalVisible(true);
    }
  };

  // 删除规则
  const handleDeleteRule = (ruleId: string) => {
    setCurrentDeletingRuleId(ruleId);
    setIsDeleteModalVisible(true);
  };

  // 保存规则
  const handleSaveRule = () => {
    if (currentEditingRuleId) {
      console.log('更新规则:', { id: currentEditingRuleId, ...ruleFormData });
      alert('规则更新成功！');
    } else {
      console.log('新增规则:', ruleFormData);
      alert('规则新增成功！');
    }
    setIsRuleModalVisible(false);
  };

  // 确认删除
  const handleConfirmDelete = () => {
    console.log('删除规则:', currentDeletingRuleId);
    setIsDeleteModalVisible(false);
    alert('规则删除成功！');
  };

  // 关闭规则弹窗
  const handleCloseRuleModal = () => {
    setIsRuleModalVisible(false);
    setCurrentEditingRuleId(null);
  };

  // 关闭删除弹窗
  const handleCloseDeleteModal = () => {
    setIsDeleteModalVisible(false);
    setCurrentDeletingRuleId(null);
  };

  // 表单输入处理
  const handleFormInputChange = (field: keyof RuleFormData, value: string) => {
    setRuleFormData(prev => ({ ...prev, [field]: value }));
  };

  // 获取规则类型显示名称
  const getRuleTypeDisplayName = (type: string) => {
    const typeMap: Record<string, string> = {
      keyword: '关键词匹配',
      correlation: '相关性排序',
      quality: '内容质量评分',
      topic: '主题分类'
    };
    return typeMap[type] || type;
  };

  // 获取规则类型样式类
  const getRuleTypeClass = (type: string) => {
    const typeClassMap: Record<string, string> = {
      keyword: styles.ruleTypeKeyword,
      correlation: styles.ruleTypeCorrelation,
      quality: styles.ruleTypeQuality,
      topic: styles.ruleTypeTopic
    };
    return typeClassMap[type] || '';
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
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-text-secondary hover:bg-gray-100"
          >
            <i className="fas fa-rss w-5"></i>
            {!isSidebarCollapsed && <span>数据源配置</span>}
          </Link>
          <Link 
            to="/admin-ai-rules" 
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${styles.navItemActive}`}
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
              <h2 className="text-2xl font-semibold text-text-primary">AI筛选规则设置</h2>
              <nav className="mt-1">
                <ol className="flex items-center space-x-2 text-sm text-text-secondary">
                  <li>
                    <Link to="/admin-dashboard" className="hover:text-primary">后台首页</Link>
                  </li>
                  <li><i className="fas fa-chevron-right text-xs"></i></li>
                  <li className="text-text-primary">AI筛选规则设置</li>
                </ol>
              </nav>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleAddRule}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary flex items-center space-x-2"
              >
                <i className="fas fa-plus text-sm"></i>
                <span>新增规则</span>
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
                  placeholder="搜索规则名称..." 
                  className={`w-full pl-10 pr-4 py-2 border border-border-light rounded-lg ${styles.searchInputFocus}`}
                />
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"></i>
              </div>
            </div>
            
            {/* 筛选条件 */}
            <div className="flex items-center space-x-3">
              <select 
                value={ruleTypeFilter}
                onChange={handleRuleTypeFilterChange}
                className="px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:border-primary"
              >
                <option value="">全部类型</option>
                <option value="keyword">关键词匹配</option>
                <option value="correlation">相关性排序</option>
                <option value="quality">内容质量评分</option>
                <option value="topic">主题分类</option>
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
                    checked={selectedRules.size === aiRules.length && aiRules.length > 0}
                    ref={(input) => {
                      if (input) input.indeterminate = selectedRules.size > 0 && selectedRules.size < aiRules.length;
                    }}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                  <span className="text-sm text-text-secondary">全选</span>
                </label>
                <span className="text-sm text-text-secondary">
                  共 <span className="font-medium text-text-primary">{aiRules.length}</span> 条规则
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleBatchDelete}
                  disabled={selectedRules.size === 0}
                  className="px-3 py-1 text-sm text-danger hover:bg-red-50 rounded disabled:opacity-50"
                >
                  <i className="fas fa-trash mr-1"></i>批量删除
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary">
                    规则名称 <i className="fas fa-sort ml-1"></i>
                  </th>
                  <th className="w-32 px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary">
                    规则类型 <i className="fas fa-sort ml-1"></i>
                  </th>
                  <th className="w-40 px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary">
                    创建时间 <i className="fas fa-sort ml-1"></i>
                  </th>
                  <th className="w-40 px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary">
                    更新时间 <i className="fas fa-sort ml-1"></i>
                  </th>
                  <th className="w-32 px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border-light">
                {aiRules.map((rule) => (
                  <tr key={rule.id} className={styles.tableRowHover}>
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        checked={selectedRules.has(rule.id)}
                        onChange={(e) => handleRuleSelect(rule.id, e.target.checked)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-text-primary">{rule.name}</h3>
                          <p className="text-xs text-text-secondary mt-1">{rule.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`${styles.ruleTypeBadge} ${getRuleTypeClass(rule.type)}`}>
                        {getRuleTypeDisplayName(rule.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {rule.createTime}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {rule.updateTime}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleEditRule(rule.id)}
                          className="text-primary hover:text-secondary text-sm" 
                          title="编辑"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          onClick={() => handleDeleteRule(rule.id)}
                          className="text-danger hover:text-red-700 text-sm" 
                          title="删除"
                        >
                          <i className="fas fa-trash"></i>
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
              显示第 <span className="font-medium">1-10</span> 条，共 <span className="font-medium">24</span> 条
            </span>
            <select className="px-3 py-1 border border-border-light rounded text-sm focus:outline-none focus:border-primary">
              <option value="10">10条/页</option>
              <option value="20">20条/页</option>
              <option value="50">50条/页</option>
              <option value="100">100条/页</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <button disabled className="px-3 py-1 border border-border-light rounded text-sm hover:bg-gray-50 disabled:opacity-50">
              <i className="fas fa-chevron-left mr-1"></i>上一页
            </button>
            
            <div className="flex items-center space-x-1">
              <button className="px-3 py-1 bg-primary text-white rounded text-sm">1</button>
              <button className="px-3 py-1 border border-border-light rounded text-sm hover:bg-gray-50">2</button>
              <button className="px-3 py-1 border border-border-light rounded text-sm hover:bg-gray-50">3</button>
            </div>
            
            <button className="px-3 py-1 border border-border-light rounded text-sm hover:bg-gray-50">
              下一页<i className="fas fa-chevron-right ml-1"></i>
            </button>
            
            <div className="flex items-center space-x-2 ml-4">
              <span className="text-sm text-text-secondary">跳转到</span>
              <input type="number" min="1" max="3" className="w-16 px-2 py-1 border border-border-light rounded text-sm text-center focus:outline-none focus:border-primary" />
              <span className="text-sm text-text-secondary">页</span>
              <button className="px-3 py-1 bg-primary text-white rounded text-sm hover:bg-secondary">
                跳转
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* 新增/编辑AI规则弹窗 */}
      {isRuleModalVisible && (
        <div className="fixed inset-0 z-50">
          <div className={styles.modalOverlay} onClick={handleCloseRuleModal}></div>
          <div className="relative flex items-center justify-center min-h-screen p-4">
            <div className={`bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${styles.modalEnter} ${styles.modalEnterActive}`}>
              <div className="flex items-center justify-between p-6 border-b border-border-light">
                <h3 className="text-lg font-semibold text-text-primary">
                  {currentEditingRuleId ? '编辑AI规则' : '新增AI规则'}
                </h3>
                <button onClick={handleCloseRuleModal} className="text-text-secondary hover:text-text-primary">
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <form className="p-6 space-y-6">
                <div className="space-y-2">
                  <label htmlFor="rule-name" className="block text-sm font-medium text-text-primary">规则名称 *</label>
                  <input 
                    type="text" 
                    id="rule-name" 
                    value={ruleFormData.name}
                    onChange={(e) => handleFormInputChange('name', e.target.value)}
                    className={`w-full px-4 py-2 border border-border-light rounded-lg ${styles.searchInputFocus}`}
                    placeholder="请输入规则名称" 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="rule-type" className="block text-sm font-medium text-text-primary">规则类型 *</label>
                  <select 
                    id="rule-type" 
                    value={ruleFormData.type}
                    onChange={(e) => handleFormInputChange('type', e.target.value)}
                    className="w-full px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:border-primary" 
                    required
                  >
                    <option value="">请选择规则类型</option>
                    <option value="keyword">关键词匹配</option>
                    <option value="correlation">相关性排序</option>
                    <option value="quality">内容质量评分</option>
                    <option value="topic">主题分类</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="rule-description" className="block text-sm font-medium text-text-primary">规则描述</label>
                  <textarea 
                    id="rule-description" 
                    rows={3}
                    value={ruleFormData.description}
                    onChange={(e) => handleFormInputChange('description', e.target.value)}
                    className={`w-full px-4 py-2 border border-border-light rounded-lg ${styles.searchInputFocus}`}
                    placeholder="请输入规则描述"
                  ></textarea>
                </div>
                
                {/* 关键词匹配配置 */}
                {ruleFormData.type === 'keyword' && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-text-primary">关键词配置</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <input type="text" className={`flex-1 px-4 py-2 border border-border-light rounded-lg ${styles.searchInputFocus}`} placeholder="关键词1" />
                        <button type="button" className="px-3 py-2 text-danger hover:bg-red-50 rounded border border-red-200">
                          <i className="fas fa-minus"></i>
                        </button>
                      </div>
                    </div>
                    <button type="button" className="px-4 py-2 text-primary hover:bg-blue-50 rounded border border-blue-200">
                      <i className="fas fa-plus mr-1"></i>添加关键词
                    </button>
                  </div>
                )}
                
                {/* 相关性排序配置 */}
                {ruleFormData.type === 'correlation' && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-text-primary">相关性配置</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <label className="text-sm text-text-primary w-24">相关度权重:</label>
                        <input type="range" min="1" max="10" value="7" className="flex-1" />
                        <span className="text-sm text-text-secondary w-8">7</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* 质量评分配置 */}
                {ruleFormData.type === 'quality' && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-text-primary">质量评分配置</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <label className="text-sm text-text-primary w-24">最低分数:</label>
                        <input type="number" min="0" max="100" value="60" className="w-20 px-3 py-2 border border-border-light rounded text-center" />
                      </div>
                      <div className="flex items-center space-x-3">
                        <label className="text-sm text-text-primary w-24">权重设置:</label>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-text-secondary">内容完整性</span>
                            <input type="range" min="1" max="10" value="8" className="w-32" />
                            <span className="text-sm text-text-secondary w-6">8</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-text-secondary">专业性</span>
                            <input type="range" min="1" max="10" value="9" className="w-32" />
                            <span className="text-sm text-text-secondary w-6">9</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-text-secondary">时效性</span>
                            <input type="range" min="1" max="10" value="7" className="w-32" />
                            <span className="text-sm text-text-secondary w-6">7</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* 主题分类配置 */}
                {ruleFormData.type === 'topic' && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-text-primary">主题分类配置</h4>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label className="text-sm text-text-primary">预设主题:</label>
                        <div className="space-y-2">
                          <label className="flex items-center space-x-2">
                            <input type="checkbox" value="水务政策" defaultChecked />
                            <span className="text-sm text-text-secondary">水务政策</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input type="checkbox" value="技术创新" defaultChecked />
                            <span className="text-sm text-text-secondary">技术创新</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input type="checkbox" value="市场动态" defaultChecked />
                            <span className="text-sm text-text-secondary">市场动态</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input type="checkbox" value="案例研究" defaultChecked />
                            <span className="text-sm text-text-secondary">案例研究</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </form>
              
              <div className="flex items-center justify-end space-x-3 p-6 border-t border-border-light bg-gray-50">
                <button onClick={handleCloseRuleModal} className="px-4 py-2 border border-border-light rounded-lg hover:bg-gray-50">
                  取消
                </button>
                <button onClick={handleSaveRule} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary">
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 删除确认弹窗 */}
      {isDeleteModalVisible && (
        <div className="fixed inset-0 z-50">
          <div className={styles.modalOverlay} onClick={handleCloseDeleteModal}></div>
          <div className="relative flex items-center justify-center min-h-screen p-4">
            <div className={`bg-white rounded-lg shadow-xl max-w-md w-full ${styles.modalEnter} ${styles.modalEnterActive}`}>
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-exclamation-triangle text-danger text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">确认删除</h3>
                <p className="text-text-secondary mb-6">确定要删除这个AI规则吗？删除后无法恢复。</p>
                <div className="flex items-center justify-center space-x-3">
                  <button onClick={handleCloseDeleteModal} className="px-4 py-2 border border-border-light rounded-lg hover:bg-gray-50">
                    取消
                  </button>
                  <button onClick={handleConfirmDelete} className="px-4 py-2 bg-danger text-white rounded-lg hover:bg-red-700">
                    删除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAiRulesPage;

