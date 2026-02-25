import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';
import { articles, categories as categoriesApi, dataSources as dataSourcesApi } from '../../services/api';

interface NewsArticle {
  article_id: string;
  title: string;
  category_id: string;
  category_name: string;
  ai_score: number;
  source: string;
  publish_time: string;
  summary: string;
  image_url: string;
  views: number;
}

interface Category {
  category_id: string;
  category_name: string;
}

interface DataSource {
  source_id: string;
  source_name: string;
}

const InfoListPage: React.FC = () => {
  const navigate = useNavigate();
  
  // 状态管理
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [totalArticles, setTotalArticles] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [dataSourcesList, setDataSourcesList] = useState<DataSource[]>([]);

  const [globalSearchKeyword, setGlobalSearchKeyword] = useState('');
  const [keywordSearchValue, setKeywordSearchValue] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('month');
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [selectedAIScore, setSelectedAIScore] = useState('70-80');
  const [sortBy, setSortBy] = useState('time-desc');
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [gotoPageValue, setGotoPageValue] = useState('');
  
  // 筛选下拉菜单状态
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showAIScoreDropdown, setShowAIScoreDropdown] = useState(false);

  // 获取文章列表
  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        pageSize: pageSize,
        keyword: keywordSearchValue,
        sortBy: sortBy,
      };
      if (selectedCategories.length > 0) params.category = selectedCategories.join(',');
      if (selectedSources.length > 0) params.source = selectedSources.join(',');
      if (selectedTimeRange) params.timeRange = selectedTimeRange;
      if (selectedAIScore) {
        const [min, max] = selectedAIScore.split('-');
        params.aiScoreMin = min;
        params.aiScoreMax = max;
      }

      const response = await articles.getArticles(params);
      setNewsArticles(response.data);
      setTotalArticles(response.total);
    } catch (error) {
      console.error('获取文章失败:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, keywordSearchValue, selectedCategories, selectedSources, selectedTimeRange, selectedAIScore, sortBy]);

  // 获取分类列表
  const fetchCategories = useCallback(async () => {
    try {
      const response = await categoriesApi.getCategories();
      setCategoriesList(response);
    } catch (error) {
      console.error('获取分类失败:', error);
    }
  }, []);

  // 获取数据源列表
  const fetchDataSources = useCallback(async () => {
    try {
      const response = await dataSourcesApi.getDataSources({ enabled: 1 });
      setDataSourcesList(response);
    } catch (error) {
      console.error('获取数据源失败:', error);
    }
  }, []);

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '水脉通 - 水务资讯';
    return () => { document.title = originalTitle; };
  }, []);

  // 初始加载数据
  useEffect(() => {
    fetchCategories();
    fetchDataSources();
  }, [fetchCategories, fetchDataSources]);

  // 依赖项变化时重新获取文章
  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // 处理侧边栏切换
  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // 处理筛选下拉菜单切换
  const handleFilterToggle = (type: string) => {
    // 关闭其他下拉菜单
    setShowCategoryDropdown(type === 'category' ? !showCategoryDropdown : false);
    setShowTimeDropdown(type === 'time' ? !showTimeDropdown : false);
    setShowSourceDropdown(type === 'source' ? !showSourceDropdown : false);
    setShowAIScoreDropdown(type === 'ai-score' ? !showAIScoreDropdown : false);
  };

  // 处理点击外部关闭下拉菜单
  const handleDocumentClick = (event: MouseEvent) => {
    const target = event.target as Element;
    const dropdowns = ['category', 'time', 'source', 'ai-score'];
    
    dropdowns.forEach(type => {
      const button = document.querySelector(`#${type}-filter-btn`);
      const dropdown = document.querySelector(`#${type}-dropdown`);
      
      if (button && dropdown && !button.contains(target) && !dropdown.contains(target)) {
        switch (type) {
          case 'category':
            setShowCategoryDropdown(false);
            break;
          case 'time':
            setShowTimeDropdown(false);
            break;
          case 'source':
            setShowSourceDropdown(false);
            break;
          case 'ai-score':
            setShowAIScoreDropdown(false);
            break;
        }
      }
    });
  };

  useEffect(() => {
    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);

  // 处理全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedArticles(newsArticles.map(article => article.article_id));
    } else {
      setSelectedArticles([]);
    }
  };

  // 处理单个选择
  const handleRowSelect = (articleId: string, checked: boolean) => {
    if (checked) {
      setSelectedArticles([...selectedArticles, articleId]);
    } else {
      setSelectedArticles(selectedArticles.filter(id => id !== articleId));
    }
  };

  // 处理搜索
  const handleKeywordSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      setCurrentPage(1);
      fetchArticles();
    }
  };

  const handleGlobalSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      setKeywordSearchValue(globalSearchKeyword);
      setCurrentPage(1);
      fetchArticles();
    }
  };

  // 处理筛选条件变化
  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, categoryId]);
    } else {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    }
  };

  const handleSourceChange = (sourceName: string, checked: boolean) => {
    if (checked) {
      setSelectedSources([...selectedSources, sourceName]);
    } else {
      setSelectedSources(selectedSources.filter(name => name !== sourceName));
    }
  };

  // 应用筛选
  const applyFilters = () => {
    setCurrentPage(1);
    fetchArticles();
  };

  // 处理排序
  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(event.target.value);
    setCurrentPage(1);
    fetchArticles();
  };

  // 处理文章标题点击
  const handleArticleTitleClick = (articleId: string) => {
    navigate(`/info-detail?articleId=${articleId}`);
  };

  // 处理收藏
  const handleFavorite = (articleId: string) => {
    console.log('收藏资讯:', articleId);
    // 这里应该调用收藏API
  };

  // 处理分享
  const handleShare = (articleId: string) => {
    console.log('分享资讯:', articleId);
    // 这里应该调用分享API或打开分享弹窗
  };

  // 批量操作
  const handleBatchDelete = async () => {
    if (selectedArticles.length > 0) {
      if (confirm(`确定要删除选中的 ${selectedArticles.length} 条资讯吗？`)) {
        try {
          for (const articleId of selectedArticles) {
            await articles.deleteArticle(articleId);
          }
          setSelectedArticles([]);
          fetchArticles();
          alert('批量删除成功！');
        } catch (error) {
          console.error('批量删除失败:', error);
          alert('批量删除失败！');
        }
      }
    }
  };

  const handleBatchMark = () => {
    if (selectedArticles.length > 0) {
      console.log('批量收藏:', selectedArticles);
      // 这里应该调用批量收藏API
    }
  };

  // 分页功能
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const handleGotoPage = () => {
    const pageNumber = parseInt(gotoPageValue);
    const maxPage = Math.ceil(totalArticles / pageSize);
    if (pageNumber && pageNumber >= 1 && pageNumber <= maxPage) {
      setCurrentPage(pageNumber);
    } else {
      alert(`请输入1到${maxPage}之间的页码`);
    }
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = parseInt(event.target.value);
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  // 其他操作
  const handleRefresh = () => {
    fetchArticles();
  };

  const handleExport = () => {
    console.log('导出资讯');
    // 这里应该调用导出API
  };

  // 工具函数
  const getCategoryColor = (categoryName: string) => {
    const colorMap: { [key: string]: string } = {
      '水务政策': 'bg-blue-100 text-blue-800',
      '技术创新': 'bg-purple-100 text-purple-800',
      '市场动态': 'bg-orange-100 text-orange-800',
      '案例研究': 'bg-teal-100 text-teal-800'
    };
    return colorMap[categoryName] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryName = (categoryId: string) => {
    const category = categoriesList.find(cat => cat.category_id === categoryId);
    return category ? category.category_name : '未知分类';
  };

  const getAIScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const totalPages = Math.ceil(totalArticles / pageSize);
  const displayPages = [];
  for (let i = 1; i <= totalPages; i++) {
    displayPages.push(i);
  }

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
          
          {/* 中间：全局搜索框 */}
          <div className="flex-1 max-w-md mx-8 hidden md:block">
            <div className="relative">
              <input 
                type="text" 
                value={globalSearchKeyword}
                onChange={(e) => setGlobalSearchKeyword(e.target.value)}
                onKeyPress={handleGlobalSearch}
                placeholder="搜索水务资讯..." 
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
          </div>
        </div>
      </header>

      {/* 左侧菜单 */}
      <aside className={`fixed left-0 top-16 bottom-0 bg-white border-r border-border-light transition-all duration-300 z-40 ${isSidebarCollapsed ? styles.sidebarCollapsed : styles.sidebarExpanded}`}>
        <nav className="p-4 space-y-2">
          <Link to="/info-list" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-text-secondary hover:bg-gray-100">
            <i className="fas fa-home w-5"></i>
            {!isSidebarCollapsed && <span>首页</span>}
          </Link>
          <Link to="/info-list" className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${styles.navItemActive}`}>
            <i className="fas fa-newspaper w-5"></i>
            {!isSidebarCollapsed && <span>资讯列表</span>}
          </Link>
          <Link to="/admin-category" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-text-secondary hover:bg-gray-100">
            <i className="fas fa-folder w-5"></i>
            {!isSidebarCollapsed && <span>分类管理</span>}
          </Link>
          <Link to="/admin-data-source" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-text-secondary hover:bg-gray-100">
            <i className="fas fa-rss w-5"></i>
            {!isSidebarCollapsed && <span>数据源</span>}
          </Link>
          <Link to="/admin-ai-rules" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-text-secondary hover:bg-gray-100">
            <i className="fas fa-brain w-5"></i>
            {!isSidebarCollapsed && <span>AI规则</span>}
          </Link>
          <Link to="/admin-user-permission" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-text-secondary hover:bg-gray-100">
            <i className="fas fa-users w-5"></i>
            {!isSidebarCollapsed && <span>用户管理</span>}
          </Link>
          <Link to="/admin-api-manage" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-text-secondary hover:bg-gray-100">
            <i className="fas fa-code w-5"></i>
            {!isSidebarCollapsed && <span>API管理</span>}
          </Link>
        </nav>
      </aside>

      {/* 主内容区 */}
      <main className={`${isSidebarCollapsed ? 'ml-12' : 'ml-52'} mt-16 p-6 transition-all duration-300`}>
        {/* 页面头部 */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-text-primary">水务资讯</h2>
              <nav className="mt-1">
                <ol className="flex items-center space-x-2 text-sm text-text-secondary">
                  <li><Link to="/info-list" className="hover:text-primary">首页</Link></li>
                  <li><i className="fas fa-chevron-right text-xs"></i></li>
                  <li className="text-text-primary">资讯列表</li>
                </ol>
              </nav>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleRefresh}
                className="px-4 py-2 border border-border-light rounded-lg hover:bg-gray-50 flex items-center space-x-2"
              >
                <i className="fas fa-sync-alt text-sm"></i>
                <span>刷新</span>
              </button>
              <button 
                onClick={handleExport}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary flex items-center space-x-2"
              >
                <i className="fas fa-download text-sm"></i>
                <span>导出</span>
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
                  value={keywordSearchValue}
                  onChange={(e) => setKeywordSearchValue(e.target.value)}
                  onKeyPress={handleKeywordSearch}
                  placeholder="搜索资讯标题、摘要..." 
                  className={`w-full pl-10 pr-4 py-2 border border-border-light rounded-lg ${styles.searchInputFocus}`}
                />
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"></i>
              </div>
            </div>
            
            {/* 筛选条件 */}
            <div className="flex flex-wrap items-center gap-3">
              {/* 分类筛选 */}
              <div className="relative">
                <button 
                  id="category-filter-btn"
                  onClick={() => handleFilterToggle('category')}
                  className="px-4 py-2 border border-border-light rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                >
                  <span>分类</span>
                  <i className="fas fa-chevron-down text-xs"></i>
                </button>
                <div 
                  id="category-dropdown"
                  className={`absolute top-full left-0 mt-1 w-48 bg-white border border-border-light rounded-lg shadow-lg ${styles.filterDropdown} ${showCategoryDropdown ? 'show' : ''}`}
                >
                  <div className="p-2">
                    {categoriesList.map(category => (
                      <label key={category.category_id} className="flex items-center space-x-2 py-1 px-2 rounded-md hover:bg-gray-50 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="form-checkbox text-primary rounded"
                          checked={selectedCategories.includes(category.category_id)}
                          onChange={(e) => handleCategoryChange(category.category_id, e.target.checked)}
                        />
                        <span>{category.category_name}</span>
                      </label>
                    ))}
                  </div>
                  <div className="border-t border-border-light p-2 flex justify-end space-x-2">
                    <button 
                      onClick={() => setShowCategoryDropdown(false)}
                      className="px-3 py-1 text-sm text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                      取消
                    </button>
                    <button 
                      onClick={applyFilters}
                      className="px-3 py-1 text-sm bg-primary text-white rounded-lg hover:bg-secondary"
                    >
                      确定
                    </button>
                  </div>
                </div>
              </div>

              {/* 时间范围筛选 */}
              <div className="relative">
                <button 
                  id="time-filter-btn"
                  onClick={() => handleFilterToggle('time')}
                  className="px-4 py-2 border border-border-light rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                >
                  <span>时间</span>
                  <i className="fas fa-chevron-down text-xs"></i>
                </button>
                <div 
                  id="time-dropdown"
                  className={`absolute top-full left-0 mt-1 w-32 bg-white border border-border-light rounded-lg shadow-lg ${styles.filterDropdown} ${showTimeDropdown ? 'show' : ''}`}
                >
                  <div className="p-2">
                    {[ { value: 'day', label: '近一天' }, { value: 'week', label: '近一周' }, { value: 'month', label: '近一月' }, { value: 'all', label: '全部' } ].map(option => (
                      <label key={option.value} className="flex items-center space-x-2 py-1 px-2 rounded-md hover:bg-gray-50 cursor-pointer">
                        <input 
                          type="radio" 
                          name="time-range" 
                          className="form-radio text-primary"
                          value={option.value}
                          checked={selectedTimeRange === option.value}
                          onChange={(e) => setSelectedTimeRange(e.target.value)}
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                  <div className="border-t border-border-light p-2 flex justify-end space-x-2">
                    <button 
                      onClick={() => setShowTimeDropdown(false)}
                      className="px-3 py-1 text-sm text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                      取消
                    </button>
                    <button 
                      onClick={applyFilters}
                      className="px-3 py-1 text-sm bg-primary text-white rounded-lg hover:bg-secondary"
                    >
                      确定
                    </button>
                  </div>
                </div>
              </div>

              {/* 来源筛选 */}
              <div className="relative">
                <button 
                  id="source-filter-btn"
                  onClick={() => handleFilterToggle('source')}
                  className="px-4 py-2 border border-border-light rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                >
                  <span>来源</span>
                  <i className="fas fa-chevron-down text-xs"></i>
                </button>
                <div 
                  id="source-dropdown"
                  className={`absolute top-full left-0 mt-1 w-48 bg-white border border-border-light rounded-lg shadow-lg ${styles.filterDropdown} ${showSourceDropdown ? 'show' : ''}`}
                >
                  <div className="p-2">
                    {dataSourcesList.map(source => (
                      <label key={source.source_id} className="flex items-center space-x-2 py-1 px-2 rounded-md hover:bg-gray-50 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="form-checkbox text-primary rounded"
                          checked={selectedSources.includes(source.source_name)}
                          onChange={(e) => handleSourceChange(source.source_name, e.target.checked)}
                        />
                        <span>{source.source_name}</span>
                      </label>
                    ))}
                  </div>
                  <div className="border-t border-border-light p-2 flex justify-end space-x-2">
                    <button 
                      onClick={() => setShowSourceDropdown(false)}
                      className="px-3 py-1 text-sm text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                      取消
                    </button>
                    <button 
                      onClick={applyFilters}
                      className="px-3 py-1 text-sm bg-primary text-white rounded-lg hover:bg-secondary"
                    >
                      确定
                    </button>
                  </div>
                </div>
              </div>

              {/* AI评分筛选 */}
              <div className="relative">
                <button 
                  id="ai-score-filter-btn"
                  onClick={() => handleFilterToggle('ai-score')}
                  className="px-4 py-2 border border-border-light rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                >
                  <span>AI评分</span>
                  <i className="fas fa-chevron-down text-xs"></i>
                </button>
                <div 
                  id="ai-score-dropdown"
                  className={`absolute top-full left-0 mt-1 w-32 bg-white border border-border-light rounded-lg shadow-lg ${styles.filterDropdown} ${showAIScoreDropdown ? 'show' : ''}`}
                >
                  <div className="p-2">
                    {[ { value: '90-100', label: '90-100' }, { value: '80-89', label: '80-89' }, { value: '70-79', label: '70-79' }, { value: '0-69', label: '0-69' } ].map(option => (
                      <label key={option.value} className="flex items-center space-x-2 py-1 px-2 rounded-md hover:bg-gray-50 cursor-pointer">
                        <input 
                          type="radio" 
                          name="ai-score-range" 
                          className="form-radio text-primary"
                          value={option.value}
                          checked={selectedAIScore === option.value}
                          onChange={(e) => setSelectedAIScore(e.target.value)}
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                  <div className="border-t border-border-light p-2 flex justify-end space-x-2">
                    <button 
                      onClick={() => setShowAIScoreDropdown(false)}
                      className="px-3 py-1 text-sm text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                      取消
                    </button>
                    <button 
                      onClick={applyFilters}
                      className="px-3 py-1 text-sm bg-primary text-white rounded-lg hover:bg-secondary"
                    >
                      确定
                    </button>
                  </div>
                </div>
              </div>

              {/* 排序 */}
              <div className="relative">
                <select 
                  value={sortBy}
                  onChange={handleSortChange}
                  className="px-4 py-2 border border-border-light rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="time-desc">最新发布</option>
                  <option value="views-desc">最多阅读</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 资讯列表 */}
        <div className="bg-white rounded-lg shadow-card p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                className="form-checkbox text-primary rounded"
                checked={selectedArticles.length === newsArticles.length && newsArticles.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
              <span className="text-sm text-text-secondary">已选择 {selectedArticles.length} 条</span>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleBatchDelete}
                disabled={selectedArticles.length === 0}
                className="px-3 py-1 text-sm text-danger border border-danger rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                批量删除
              </button>
              <button 
                onClick={handleBatchMark}
                disabled={selectedArticles.length === 0}
                className="px-3 py-1 text-sm text-primary border border-primary rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                批量收藏
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-text-secondary">加载中...</div>
          ) : newsArticles.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">暂无资讯</div>
          ) : (
            <div className="space-y-4">
              {newsArticles.map(article => (
                <div key={article.article_id} className="flex items-start space-x-4 p-4 border border-border-light rounded-lg hover:shadow-md transition-shadow duration-200">
                  <input 
                    type="checkbox" 
                    className="form-checkbox text-primary rounded mt-1"
                    checked={selectedArticles.includes(article.article_id)}
                    onChange={(e) => handleRowSelect(article.article_id, e.target.checked)}
                  />
                  <div className="flex-1">
                    <h3 
                      className="text-lg font-semibold text-text-primary cursor-pointer hover:text-primary transition-colors duration-200"
                      onClick={() => handleArticleTitleClick(article.article_id)}
                    >
                      {article.title}
                    </h3>
                    <div className="flex items-center space-x-3 text-sm text-text-secondary mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getCategoryColor(article.category_name)}`}>
                        {article.category_name}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getAIScoreColor(article.ai_score)}`}>
                        AI评分: {article.ai_score}
                      </span>
                      <span>来源: {article.source}</span>
                      <span>发布时间: {new Date(article.publish_time).toLocaleString()}</span>
                      <span>阅读量: {article.views}</span>
                    </div>
                    <p className="text-text-secondary mt-2 line-clamp-2">
                      {article.summary}
                    </p>
                    <div className="flex items-center space-x-4 mt-3">
                      <button 
                        onClick={() => handleFavorite(article.article_id)}
                        className="flex items-center space-x-1 text-text-secondary hover:text-primary transition-colors duration-200"
                      >
                        <i className="fas fa-star"></i>
                        <span>收藏</span>
                      </button>
                      <button 
                        onClick={() => handleShare(article.article_id)}
                        className="flex items-center space-x-1 text-text-secondary hover:text-primary transition-colors duration-200"
                      >
                        <i className="fas fa-share-alt"></i>
                        <span>分享</span>
                      </button>
                    </div>
                  </div>
                  {article.image_url && (
                    <div className="w-32 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                      <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 分页 */}
          {newsArticles.length > 0 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-text-secondary">
                共 {totalArticles} 条记录
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-border-light rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                {displayPages.map(page => (
                  <button 
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 border rounded-lg ${currentPage === page ? 'bg-primary text-white border-primary' : 'border-border-light hover:bg-gray-50'}`}
                  >
                    {page}
                  </button>
                ))}
                <button 
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-border-light rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
                <span className="text-text-secondary">前往</span>
                <input 
                  type="number" 
                  value={gotoPageValue}
                  onChange={(e) => setGotoPageValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleGotoPage()}
                  className="w-16 px-2 py-1 border border-border-light rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <span className="text-text-secondary">页</span>
                <select 
                  value={pageSize}
                  onChange={handlePageSizeChange}
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
    </div>
  );
};

export default InfoListPage;
