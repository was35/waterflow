import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';
import { categories as categoriesApi } from '../../services/api';

interface Category {
  category_id: string;
  category_name: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface SortConfig {
  field: string;
  direction: 'asc' | 'desc' | null;
}

const AdminCategoryPage: React.FC = () => {
  const navigate = useNavigate();
  
  // 状态管理
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [currentEditingCategory, setCurrentEditingCategory] = useState<Category | null>(null);
  const [currentDeletingCategory, setCurrentDeletingCategory] = useState<Category | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: '', direction: null });
  const [categoryForm, setCategoryForm] = useState({
    category_name: '',
    sort_order: 1
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '资讯类别管理 - 水脉通';
    return () => { document.title = originalTitle; };
  }, []);

  // 获取分类列表
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await categoriesApi.getCategories();
      setCategories(response);
    } catch (error) {
      console.error('获取分类失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // 筛选后的类别
  const filteredCategories = categories.filter(category =>
    category.category_name.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    if (sortConfig.direction === 'asc') {
      return (a as any)[sortConfig.field] > (b as any)[sortConfig.field] ? 1 : -1;
    } else if (sortConfig.direction === 'desc') {
      return (a as any)[sortConfig.field] < (b as any)[sortConfig.field] ? 1 : -1;
    } else {
      return 0;
    }
  });

  // 全选状态
  const isAllSelected = filteredCategories.length > 0 && selectedCategories.size === filteredCategories.length;
  const isIndeterminate = selectedCategories.size > 0 && selectedCategories.size < filteredCategories.length;

  // 处理侧边栏切换
  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // 处理搜索
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // 处理全选
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedCategories(new Set(filteredCategories.map(cat => cat.category_id)));
    } else {
      setSelectedCategories(new Set());
    }
  };

  // 处理单个选择
  const handleSelectCategory = (categoryId: string, checked: boolean) => {
    const newSelected = new Set(selectedCategories);
    if (checked) {
      newSelected.add(categoryId);
    } else {
      newSelected.delete(categoryId);
    }
    setSelectedCategories(newSelected);
  };

  // 处理排序
  const handleSort = (field: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    if (sortConfig.field === field) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        direction = null;
      }
    }
    setSortConfig({ field, direction });
  };

  // 获取排序图标
  const getSortIcon = (field: string) => {
    if (sortConfig.field !== field) return 'fas fa-sort ml-1';
    if (sortConfig.direction === 'asc') return 'fas fa-sort-up ml-1';
    if (sortConfig.direction === 'desc') return 'fas fa-sort-down ml-1';
    return 'fas fa-sort ml-1';
  };

  // 处理排序上下移动
  const handleSortUp = async (categoryId: string) => {
    const index = categories.findIndex(cat => cat.category_id === categoryId);
    if (index > 0) {
      const newCategories = [...categories];
      const currentCategory = newCategories[index];
      const prevCategory = newCategories[index - 1];

      // 交换 sort_order
      const tempSortOrder = currentCategory.sort_order;
      currentCategory.sort_order = prevCategory.sort_order;
      prevCategory.sort_order = tempSortOrder;

      try {
        await categoriesApi.updateCategory(currentCategory.category_id, { sort_order: currentCategory.sort_order });
        await categoriesApi.updateCategory(prevCategory.category_id, { sort_order: prevCategory.sort_order });
        fetchCategories(); // 重新获取数据以更新UI
      } catch (error) {
        console.error('更新排序失败:', error);
        alert('更新排序失败！');
      }
    }
  };

  const handleSortDown = async (categoryId: string) => {
    const index = categories.findIndex(cat => cat.category_id === categoryId);
    if (index < categories.length - 1) {
      const newCategories = [...categories];
      const currentCategory = newCategories[index];
      const nextCategory = newCategories[index + 1];

      // 交换 sort_order
      const tempSortOrder = currentCategory.sort_order;
      currentCategory.sort_order = nextCategory.sort_order;
      nextCategory.sort_order = tempSortOrder;

      try {
        await categoriesApi.updateCategory(currentCategory.category_id, { sort_order: currentCategory.sort_order });
        await categoriesApi.updateCategory(nextCategory.category_id, { sort_order: nextCategory.sort_order });
        fetchCategories(); // 重新获取数据以更新UI
      } catch (error) {
        console.error('更新排序失败:', error);
        alert('更新排序失败！');
      }
    }
  };

  // 处理新增类别
  const handleAddCategory = () => {
    setCurrentEditingCategory(null);
    setCategoryForm({
      category_name: '',
      sort_order: categories.length > 0 ? Math.max(...categories.map(c => c.sort_order)) + 1 : 1
    });
    setIsCategoryModalVisible(true);
  };

  // 处理编辑类别
  const handleEditCategory = (category: Category) => {
    setCurrentEditingCategory(category);
    setCategoryForm({
      category_name: category.category_name,
      sort_order: category.sort_order
    });
    setIsCategoryModalVisible(true);
  };

  // 处理删除类别
  const handleDeleteCategory = (category: Category) => {
    setCurrentDeletingCategory(category);
    setIsDeleteModalVisible(true);
  };

  // 处理批量删除
  const handleBatchDelete = async () => {
    if (selectedCategories.size === 0) return;
    if (confirm(`确定要删除选中的 ${selectedCategories.size} 个类别吗？此操作不可撤销。`)) {
      try {
        for (const categoryId of selectedCategories) {
          await categoriesApi.deleteCategory(categoryId);
        }
        setSelectedCategories(new Set());
        fetchCategories();
        alert('批量删除成功！');
      } catch (error) {
        console.error('批量删除失败:', error);
        alert('批量删除失败！');
      }
    }
  };

  // 处理表单提交
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryForm.category_name.trim()) {
      alert('请输入类别名称');
      return;
    }

    try {
      if (currentEditingCategory) {
        // 编辑模式
        await categoriesApi.updateCategory(currentEditingCategory.category_id, categoryForm);
        alert('更新成功！');
      } else {
        // 新增模式
        await categoriesApi.createCategory(categoryForm);
        alert('新增成功！');
      }
      setIsCategoryModalVisible(false);
      fetchCategories(); // 刷新列表
    } catch (error) {
      console.error('保存类别失败:', error);
      alert('保存类别失败！');
    }
  };

  // 处理确认删除
  const handleConfirmDelete = async () => {
    if (currentDeletingCategory) {
      try {
        await categoriesApi.deleteCategory(currentDeletingCategory.category_id);
        setIsDeleteModalVisible(false);
        fetchCategories();
        alert('删除成功！');
      } catch (error) {
        console.error('删除类别失败:', error);
        alert('删除类别失败！');
      }
    }
  };

  // 处理退出登录
  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      localStorage.removeItem('user');
      navigate('/admin-login');
    }
  };

  // 处理模态框关闭
  const handleCloseModal = () => {
    setIsCategoryModalVisible(false);
    setIsDeleteModalVisible(false);
    setCurrentEditingCategory(null);
    setCurrentDeletingCategory(null);
  };

  return (
    <div className={styles.pageWrapper}>
      {/* 顶部导航栏 */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-border-light h-16 z-50">
        <div className="flex items-center justify-between h-full px-6">
          {/* 左侧：Logo和网站名称 */}
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
              <h1 className="text-xl font-semibold text-text-primary hidden sm:block">水脉通</h1>
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
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${styles.navItemActive}`}
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
              <h2 className="text-2xl font-semibold text-text-primary">资讯类别管理</h2>
              <nav className="mt-1">
                <ol className="flex items-center space-x-2 text-sm text-text-secondary">
                  <li>
                    <Link to="/admin-dashboard" className="hover:text-primary">后台首页</Link>
                  </li>
                  <li><i className="fas fa-chevron-right text-xs"></i></li>
                  <li className="text-text-primary">资讯类别管理</li>
                </ol>
              </nav>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleAddCategory}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary flex items-center space-x-2"
              >
                <i className="fas fa-plus text-sm"></i>
                <span>新增类别</span>
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
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="搜索类别名称..." 
                  className={`w-full pl-10 pr-4 py-2 border border-border-light rounded-lg ${styles.searchInputFocus}`}
                />
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"></i>
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
                  共 <span className="font-medium text-text-primary">{filteredCategories.length}</span> 个类别
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleBatchDelete}
                  disabled={selectedCategories.size === 0}
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
                  <th 
                    className={`px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider ${styles.sortableHeader}`}
                    onClick={() => handleSort('category_name')}
                  >
                    类别名称 <i className={getSortIcon('category_name')}></i>
                  </th>
                  <th 
                    className={`w-20 px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider ${styles.sortableHeader}`}
                    onClick={() => handleSort('sort_order')}
                  >
                    排序 <i className={getSortIcon('sort_order')}></i>
                  </th>
                  <th 
                    className={`w-40 px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider ${styles.sortableHeader}`}
                    onClick={() => handleSort('created_at')}
                  >
                    创建时间 <i className={getSortIcon('created_at')}></i>
                  </th>
                  <th 
                    className={`w-40 px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider ${styles.sortableHeader}`}
                    onClick={() => handleSort('updated_at')}
                  >
                    更新时间 <i className={getSortIcon('updated_at')}></i>
                  </th>
                  <th className="w-32 px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border-light">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-text-secondary">加载中...</td>
                  </tr>
                ) : filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-text-secondary">暂无类别</td>
                  </tr>
                ) : (
                  filteredCategories.map(category => (
                    <tr key={category.category_id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input 
                          type="checkbox" 
                          checked={selectedCategories.has(category.category_id)}
                          onChange={(e) => handleSelectCategory(category.category_id, e.target.checked)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">
                        <div className="flex items-center">
                          <i className="fas fa-folder text-primary mr-2"></i>
                          {category.category_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                        <div className="flex items-center space-x-2">
                          <span>{category.sort_order}</span>
                          <div className="flex flex-col">
                            <button 
                              onClick={() => handleSortUp(category.category_id)}
                              className="text-gray-400 hover:text-primary text-xs"
                            >
                              <i className="fas fa-chevron-up"></i>
                            </button>
                            <button 
                              onClick={() => handleSortDown(category.category_id)}
                              className="text-gray-400 hover:text-primary text-xs"
                            >
                              <i className="fas fa-chevron-down"></i>
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{new Date(category.created_at).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{new Date(category.updated_at).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => handleEditCategory(category)}
                          className="text-primary hover:text-secondary mr-3"
                        >
                          编辑
                        </button>
                        <button 
                          onClick={() => handleDeleteCategory(category)}
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
        </div>
      </main>

      {/* 类别编辑/新增模态框 */}
      {isCategoryModalVisible && (
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
              {currentEditingCategory ? '编辑类别' : '新增类别'}
            </h3>
            <form onSubmit={handleFormSubmit}>
              <div className="mb-4">
                <label htmlFor="category_name" className="block text-sm font-medium text-text-secondary mb-1">
                  类别名称
                </label>
                <input 
                  type="text" 
                  id="category_name" 
                  value={categoryForm.category_name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, category_name: e.target.value })}
                  className="w-full px-3 py-2 border border-border-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="sort_order" className="block text-sm font-medium text-text-secondary mb-1">
                  排序
                </label>
                <input 
                  type="number" 
                  id="sort_order" 
                  value={categoryForm.sort_order}
                  onChange={(e) => setCategoryForm({ ...categoryForm, sort_order: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-border-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
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

      {/* 删除确认模态框 */}
      {isDeleteModalVisible && (
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
              您确定要删除类别 “{currentDeletingCategory?.category_name}” 吗？此操作不可撤销。
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

export default AdminCategoryPage;
