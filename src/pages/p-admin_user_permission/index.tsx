

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  createdAt: string;
  updatedAt: string;
}

const AdminUserPermission: React.FC = () => {
  const navigate = useNavigate();
  
  // 状态管理
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('all');
  const [sortBy, setSortBy] = useState('created-desc');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentEditingUser, setCurrentEditingUser] = useState<User | null>(null);
  const [currentResetUser, setCurrentResetUser] = useState<User | null>(null);
  const [currentDeleteUser, setCurrentDeleteUser] = useState<User | null>(null);
  const [keywordSearch, setKeywordSearch] = useState('');
  const [globalSearch, setGlobalSearch] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: '',
    password: ''
  });

  // 模拟用户数据
  const [users] = useState<User[]>([
    {
      id: 'user1',
      username: 'admin',
      email: 'admin@shuimaitong.com',
      role: 'admin',
      createdAt: '2024-01-01 09:00',
      updatedAt: '2024-01-15 14:30'
    },
    {
      id: 'user2',
      username: 'editor_zhang',
      email: 'zhang@shuimaitong.com',
      role: 'editor',
      createdAt: '2024-01-05 10:15',
      updatedAt: '2024-01-14 16:45'
    },
    {
      id: 'user3',
      username: 'editor_li',
      email: 'li@shuimaitong.com',
      role: 'editor',
      createdAt: '2024-01-08 11:20',
      updatedAt: '2024-01-13 11:20'
    },
    {
      id: 'user4',
      username: 'viewer_wang',
      email: 'wang@shuimaitong.com',
      role: 'viewer',
      createdAt: '2024-01-10 14:30',
      updatedAt: '2024-01-12 09:15'
    },
    {
      id: 'user5',
      username: 'viewer_chen',
      email: 'chen@shuimaitong.com',
      role: 'viewer',
      createdAt: '2024-01-12 16:45',
      updatedAt: '2024-01-12 16:45'
    }
  ]);

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '用户权限管理 - 水脉通';
    return () => { document.title = originalTitle; };
  }, []);

  // 处理筛选下拉菜单
  const handleFilterToggle = (type: string) => {
    if (type === 'role') {
      setIsRoleDropdownOpen(!isRoleDropdownOpen);
    }
  };

  // 关闭所有下拉菜单
  const closeAllDropdowns = () => {
    setIsRoleDropdownOpen(false);
  };

  // 处理点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-filter-button]')) {
        closeAllDropdowns();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // 处理全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(users.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  // 处理单个用户选择
  const handleUserSelect = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  // 处理搜索
  const handleKeywordSearchKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      console.log('搜索关键词:', keywordSearch);
    }
  };

  const handleGlobalSearchKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      console.log('全局搜索:', globalSearch);
    }
  };

  // 处理排序
  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(event.target.value);
    console.log('排序方式:', event.target.value);
  };

  // 处理页面大小改变
  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    console.log('每页显示:', event.target.value);
  };

  // 处理新增用户
  const handleAddUser = () => {
    setCurrentEditingUser(null);
    setFormData({
      username: '',
      email: '',
      role: '',
      password: ''
    });
    setIsUserModalOpen(true);
  };

  // 处理编辑用户
  const handleEditUser = (user: User) => {
    setCurrentEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      role: user.role,
      password: ''
    });
    setIsUserModalOpen(true);
  };

  // 处理重置密码
  const handleResetPassword = (user: User) => {
    setCurrentResetUser(user);
    setIsResetPasswordModalOpen(true);
  };

  // 处理删除用户
  const handleDeleteUser = (user: User) => {
    setCurrentDeleteUser(user);
    setIsDeleteModalOpen(true);
  };

  // 处理表单提交
  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (currentEditingUser) {
      // 编辑用户
      console.log('编辑用户:', currentEditingUser.id, formData);
      alert('用户编辑成功！');
    } else {
      // 新增用户
      console.log('新增用户:', formData);
      alert('用户新增成功！');
    }
    
    setIsUserModalOpen(false);
  };

  // 处理确认重置密码
  const handleConfirmResetPassword = () => {
    if (currentResetUser) {
      console.log('重置密码:', currentResetUser.id);
      alert('密码重置成功！');
    }
    setIsResetPasswordModalOpen(false);
  };

  // 处理确认删除用户
  const handleConfirmDeleteUser = () => {
    if (currentDeleteUser) {
      console.log('删除用户:', currentDeleteUser.id);
      alert('用户删除成功！');
    }
    setIsDeleteModalOpen(false);
  };

  // 处理批量删除
  const handleBatchDelete = () => {
    if (selectedUsers.length > 0) {
      if (confirm(`确定要删除选中的 ${selectedUsers.length} 个用户吗？`)) {
        console.log('批量删除用户:', selectedUsers);
        alert('用户删除成功！');
      }
    }
  };

  // 处理退出登录
  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      navigate('/admin-login');
    }
  };

  // 获取角色样式
  const getRoleStyle = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'editor':
        return 'bg-blue-100 text-blue-800';
      case 'viewer':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 获取角色名称
  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin':
        return '管理员';
      case 'editor':
        return '编辑';
      case 'viewer':
        return '查看者';
      default:
        return role;
    }
  };

  // 获取头像背景色
  const getAvatarBgColor = (index: number) => {
    const colors = ['bg-primary', 'bg-secondary', 'bg-tertiary', 'bg-success', 'bg-info'];
    return colors[index % colors.length];
  };

  return (
    <div className={styles.pageWrapper}>
      {/* 顶部导航栏 */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-border-light h-16 z-50">
        <div className="flex items-center justify-between h-full px-6">
          {/* 左侧：Logo和网站名称 */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
            >
              <i className="fas fa-bars text-gray-600"></i>
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-tint text-white text-sm"></i>
              </div>
              <h1 className="text-xl font-semibold text-text-primary hidden sm:block">水脉通</h1>
            </div>
          </div>
          
          {/* 中间：全局搜索框 */}
          <div className="flex-1 max-w-md mx-8 hidden md:block">
            <div className="relative">
              <input 
                type="text" 
                placeholder="搜索水务资讯..." 
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                onKeyPress={handleGlobalSearchKeyPress}
                className={`w-full pl-10 pr-4 py-2 border border-border-light rounded-lg ${styles.searchInputFocus}`}
              />
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"></i>
            </div>
          </div>
          
          {/* 右侧：用户操作区 */}
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-lg hover:bg-gray-100 relative">
              <i className="fas fa-bell text-gray-600"></i>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-danger rounded-full"></span>
            </button>
            <div className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 rounded-lg p-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <i className="fas fa-user text-white text-sm"></i>
              </div>
              <span className="text-sm text-text-primary hidden sm:block">管理员</span>
              <i className="fas fa-chevron-down text-xs text-text-secondary"></i>
            </div>
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-gray-100 text-text-secondary">
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </header>

      {/* 左侧菜单 */}
      <aside className={`fixed left-0 top-16 bottom-0 bg-white border-r border-border-light transition-all duration-300 z-40 ${
        isSidebarCollapsed ? styles.sidebarCollapsed : styles.sidebarExpanded
      }`}>
        <nav className="p-4 space-y-2">
          <Link to="/admin-dashboard" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-text-secondary hover:bg-gray-100">
            <i className="fas fa-home w-5"></i>
            <span className={isSidebarCollapsed ? 'hidden' : 'block'}>后台首页</span>
          </Link>
          <Link to="/admin-category" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-text-secondary hover:bg-gray-100">
            <i className="fas fa-folder w-5"></i>
            <span className={isSidebarCollapsed ? 'hidden' : 'block'}>资讯类别管理</span>
          </Link>
          <Link to="/admin-update-time" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-text-secondary hover:bg-gray-100">
            <i className="fas fa-clock w-5"></i>
            <span className={isSidebarCollapsed ? 'hidden' : 'block'}>更新时间设置</span>
          </Link>
          <Link to="/admin-data-source" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-text-secondary hover:bg-gray-100">
            <i className="fas fa-rss w-5"></i>
            <span className={isSidebarCollapsed ? 'hidden' : 'block'}>数据源配置</span>
          </Link>
          <Link to="/admin-ai-rules" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-text-secondary hover:bg-gray-100">
            <i className="fas fa-brain w-5"></i>
            <span className={isSidebarCollapsed ? 'hidden' : 'block'}>AI筛选规则设置</span>
          </Link>
          <Link to="/admin-user-permission" className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${styles.navItemActive}`}>
            <i className="fas fa-users w-5"></i>
            <span className={isSidebarCollapsed ? 'hidden' : 'block'}>用户权限管理</span>
          </Link>
          <Link to="/admin-api-manage" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-text-secondary hover:bg-gray-100">
            <i className="fas fa-code w-5"></i>
            <span className={isSidebarCollapsed ? 'hidden' : 'block'}>API生成与管理</span>
          </Link>
        </nav>
      </aside>

      {/* 主内容区 */}
      <main className={`${isSidebarCollapsed ? 'ml-12' : 'ml-52'} mt-16 p-6 transition-all duration-300`}>
        {/* 页面头部 */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-text-primary">用户权限管理</h2>
              <nav className="mt-1">
                <ol className="flex items-center space-x-2 text-sm text-text-secondary">
                  <li><Link to="/admin-dashboard" className="hover:text-primary">后台首页</Link></li>
                  <li><i className="fas fa-chevron-right text-xs"></i></li>
                  <li className="text-text-primary">用户权限管理</li>
                </ol>
              </nav>
            </div>
            <div className="flex items-center space-x-3">
              <button onClick={handleAddUser} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary flex items-center space-x-2">
                <i className="fas fa-plus text-sm"></i>
                <span>新增用户</span>
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
                  placeholder="搜索用户名、邮箱..." 
                  value={keywordSearch}
                  onChange={(e) => setKeywordSearch(e.target.value)}
                  onKeyPress={handleKeywordSearchKeyPress}
                  className={`w-full pl-10 pr-4 py-2 border border-border-light rounded-lg ${styles.searchInputFocus}`}
                />
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"></i>
              </div>
            </div>
            
            {/* 筛选条件 */}
            <div className="flex flex-wrap items-center gap-3">
              {/* 角色筛选 */}
              <div className="relative">
                <button 
                  onClick={() => handleFilterToggle('role')}
                  data-filter-button
                  className="px-4 py-2 border border-border-light rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                >
                  <span>角色</span>
                  <i className="fas fa-chevron-down text-xs"></i>
                </button>
                <div className={`absolute top-full left-0 mt-1 w-48 bg-white border border-border-light rounded-lg shadow-lg ${styles.filterDropdown} ${isRoleDropdownOpen ? styles.show : ''}`}>
                  <div className="p-2">
                    {[
                      { value: 'all', label: '全部角色' },
                      { value: 'admin', label: '管理员' },
                      { value: 'editor', label: '编辑' },
                      { value: 'viewer', label: '查看者' }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input 
                          type="radio" 
                          name="role" 
                          value={option.value} 
                          checked={selectedRole === option.value}
                          onChange={(e) => setSelectedRole(e.target.value)}
                          className="text-primary" 
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* 排序选项 */}
              <select value={sortBy} onChange={handleSortChange} className="px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:border-primary">
                <option value="created-desc">创建时间 ↓</option>
                <option value="created-asc">创建时间 ↑</option>
                <option value="username-asc">用户名 A-Z</option>
                <option value="username-desc">用户名 Z-A</option>
                <option value="role-asc">角色 ↑</option>
                <option value="role-desc">角色 ↓</option>
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
                    checked={selectedUsers.length === users.length && users.length > 0}
                    ref={(input) => {
                      if (input) input.indeterminate = selectedUsers.length > 0 && selectedUsers.length < users.length;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-text-secondary">全选</span>
                </label>
                <span className="text-sm text-text-secondary">共 <span className="font-medium text-text-primary">{users.length}</span> 个用户</span>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleBatchDelete}
                  disabled={selectedUsers.length === 0}
                  className="px-3 py-1 text-sm text-danger hover:bg-red-50 rounded disabled:opacity-50"
                >
                  <i className="fas fa-trash mr-1"></i>删除
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
                  <th className="w-40 px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary">
                    用户名 <i className="fas fa-sort ml-1"></i>
                  </th>
                  <th className="w-52 px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary">
                    邮箱 <i className="fas fa-sort ml-1"></i>
                  </th>
                  <th className="w-28 px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary">
                    角色 <i className="fas fa-sort ml-1"></i>
                  </th>
                  <th className="w-40 px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary">
                    创建时间 <i className="fas fa-sort ml-1"></i>
                  </th>
                  <th className="w-40 px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary">
                    更新时间 <i className="fas fa-sort ml-1"></i>
                  </th>
                  <th className="w-48 px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border-light">
                {users.map((user, index) => (
                  <tr key={user.id} className={styles.tableRowHover}>
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => handleUserSelect(user.id, e.target.checked)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 ${getAvatarBgColor(index)} rounded-full flex items-center justify-center`}>
                          <i className="fas fa-user text-white text-sm"></i>
                        </div>
                        <span className="text-sm font-medium text-text-primary">{user.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getRoleStyle(user.role)}`}>
                        {getRoleName(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {user.createdAt}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {user.updatedAt}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleEditUser(user)}
                          className="text-text-secondary hover:text-primary" 
                          title="编辑"
                        >
                          <i className="fas fa-edit text-sm"></i>
                        </button>
                        <button 
                          onClick={() => handleResetPassword(user)}
                          className="text-text-secondary hover:text-warning" 
                          title="重置密码"
                        >
                          <i className="fas fa-key text-sm"></i>
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user)}
                          className="text-text-secondary hover:text-danger" 
                          title="删除"
                        >
                          <i className="fas fa-trash text-sm"></i>
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
              显示第 <span className="font-medium">1-5</span> 条，共 <span className="font-medium">{users.length}</span> 个用户
            </span>
            <select onChange={handlePageSizeChange} className="px-3 py-1 border border-border-light rounded text-sm focus:outline-none focus:border-primary">
              <option value="5">5条/页</option>
              <option value="10">10条/页</option>
              <option value="20">20条/页</option>
              <option value="50">50条/页</option>
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

      {/* 新增/编辑用户弹窗 */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50">
          <div className={styles.modalOverlay} onClick={() => setIsUserModalOpen(false)}></div>
          <div className="relative flex items-center justify-center min-h-screen p-4">
            <div className={`bg-white rounded-lg shadow-xl w-full max-w-md ${styles.modalEnter}`}>
              <div className="flex items-center justify-between p-6 border-b border-border-light">
                <h3 className="text-lg font-semibold text-text-primary">
                  {currentEditingUser ? '编辑用户' : '新增用户'}
                </h3>
                <button onClick={() => setIsUserModalOpen(false)} className="text-text-secondary hover:text-text-primary">
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-text-primary mb-2">用户名 *</label>
                  <input 
                    type="text" 
                    id="username" 
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className={`w-full px-3 py-2 border border-border-light rounded-lg ${styles.searchInputFocus}`}
                    required 
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">邮箱 *</label>
                  <input 
                    type="email" 
                    id="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={`w-full px-3 py-2 border border-border-light rounded-lg ${styles.searchInputFocus}`}
                    required 
                  />
                </div>
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-text-primary mb-2">角色 *</label>
                  <select 
                    id="role" 
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:border-primary" 
                    required
                  >
                    <option value="">请选择角色</option>
                    <option value="admin">管理员</option>
                    <option value="editor">编辑</option>
                    <option value="viewer">查看者</option>
                  </select>
                </div>
                {!currentEditingUser && (
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">密码 *</label>
                    <input 
                      type="password" 
                      id="password" 
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className={`w-full px-3 py-2 border border-border-light rounded-lg ${styles.searchInputFocus}`}
                      required 
                    />
                  </div>
                )}
                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsUserModalOpen(false)}
                    className="px-4 py-2 border border-border-light rounded-lg hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary">
                    保存
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 重置密码弹窗 */}
      {isResetPasswordModalOpen && (
        <div className="fixed inset-0 z-50">
          <div className={styles.modalOverlay} onClick={() => setIsResetPasswordModalOpen(false)}></div>
          <div className="relative flex items-center justify-center min-h-screen p-4">
            <div className={`bg-white rounded-lg shadow-xl w-full max-w-md ${styles.modalEnter}`}>
              <div className="flex items-center justify-between p-6 border-b border-border-light">
                <h3 className="text-lg font-semibold text-text-primary">重置密码</h3>
                <button onClick={() => setIsResetPasswordModalOpen(false)} className="text-text-secondary hover:text-text-primary">
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="p-6">
                <p className="text-sm text-text-secondary mb-4">
                  确定要重置用户 "<span className="font-medium text-text-primary">{currentResetUser?.username}</span>" 的密码吗？
                </p>
                <p className="text-sm text-text-secondary mb-6">
                  重置后密码将变为默认密码：<span className="font-mono text-primary">123456</span>
                </p>
                <div className="flex items-center justify-end space-x-3">
                  <button 
                    onClick={() => setIsResetPasswordModalOpen(false)}
                    className="px-4 py-2 border border-border-light rounded-lg hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button onClick={handleConfirmResetPassword} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary">
                    确认重置
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 删除确认弹窗 */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50">
          <div className={styles.modalOverlay} onClick={() => setIsDeleteModalOpen(false)}></div>
          <div className="relative flex items-center justify-center min-h-screen p-4">
            <div className={`bg-white rounded-lg shadow-xl w-full max-w-md ${styles.modalEnter}`}>
              <div className="flex items-center justify-between p-6 border-b border-border-light">
                <h3 className="text-lg font-semibold text-text-primary">删除用户</h3>
                <button onClick={() => setIsDeleteModalOpen(false)} className="text-text-secondary hover:text-text-primary">
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-exclamation-triangle text-red-600"></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">确认删除</p>
                    <p className="text-sm text-text-secondary">此操作不可撤销</p>
                  </div>
                </div>
                <p className="text-sm text-text-secondary mb-6">
                  确定要删除用户 "<span className="font-medium text-text-primary">{currentDeleteUser?.username}</span>" 吗？
                </p>
                <div className="flex items-center justify-end space-x-3">
                  <button 
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="px-4 py-2 border border-border-light rounded-lg hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button onClick={handleConfirmDeleteUser} className="px-4 py-2 bg-danger text-white rounded-lg hover:bg-red-600">
                    确认删除
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

export default AdminUserPermission;

