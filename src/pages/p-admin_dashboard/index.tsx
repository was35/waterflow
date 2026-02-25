import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';
import { articles, apiManage, users } from '../../services/api';

const AdminDashboard: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  const [totalArticles, setTotalArticles] = useState(0);
  const [todayArticles, setTodayArticles] = useState(0);
  const [apiCalls, setApiCalls] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const originalTitle = document.title;
    document.title = '水脉通 - 后台管理首页';
    return () => { document.title = originalTitle; };
  }, []);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // 获取资讯总数
      const articlesResponse = await articles.getArticles({ pageSize: 1 });
      setTotalArticles(articlesResponse.total);

      // 获取今日更新数
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayArticlesResponse = await articles.getArticles({
        timeRange: 'day',
        pageSize: 1
      });
      setTodayArticles(todayArticlesResponse.total);

      // 获取API调用次数
      const apiLogsResponse = await apiManage.getApiLogs();
      setApiCalls(apiLogsResponse.length);

      // 获取活跃用户数 (这里简单地获取用户总数)
      const usersResponse = await users.getUsers();
      setActiveUsers(usersResponse.length);

    } catch (error) {
      console.error('获取仪表盘数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      localStorage.removeItem('user');
      navigate('/admin-login');
    }
  };

  const handleSystemInfo = () => {
    alert('水脉通管理系统 v1.0.0\n\n系统状态：正常运行\n最后更新：2024-01-15\n服务器时间：' + new Date().toLocaleString());
  };

  const getCurrentDate = () => {
    const today = new Date();
    return today.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
              <div className="hidden sm:block">
                <div className="text-sm font-medium text-text-primary">管理员</div>
                <div className="text-xs text-text-secondary">admin@shuimaitong.com</div>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-text-secondary hover:text-danger border border-border-light rounded-lg hover:bg-red-50 flex items-center space-x-2"
            >
              <i className="fas fa-sign-out-alt text-sm"></i>
              <span>退出登录</span>
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
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${styles.navItemActive}`}
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
      <main className={`mt-16 p-6 transition-all duration-300 ${
        isSidebarCollapsed ? 'ml-12' : 'ml-52'
      }`}>
        {/* 页面头部 */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-text-primary">后台管理首页</h2>
              <p className="mt-1 text-text-secondary">
                欢迎回来，管理员！今天是 {getCurrentDate()}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleSystemInfo}
                className="px-4 py-2 border border-border-light rounded-lg hover:bg-gray-50 flex items-center space-x-2"
              >
                <i className="fas fa-info-circle text-sm"></i>
                <span>系统信息</span>
              </button>
            </div>
          </div>
        </div>

        {/* 概览统计区 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* 资讯总数卡片 */}
          <div className={`bg-white rounded-lg shadow-card p-6 ${styles.cardHover}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">资讯总数</p>
                {loading ? (
                  <p className="text-3xl font-bold text-text-primary mt-2">...</p>
                ) : (
                  <p className="text-3xl font-bold text-text-primary mt-2">{totalArticles.toLocaleString()}</p>
                )}
                <p className="text-sm text-success mt-1">
                  <i className="fas fa-arrow-up text-xs"></i> +12% 较上月
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-newspaper text-primary text-xl"></i>
              </div>
            </div>
          </div>

          {/* 今日更新数卡片 */}
          <div className={`bg-white rounded-lg shadow-card p-6 ${styles.cardHover}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">今日更新</p>
                {loading ? (
                  <p className="text-3xl font-bold text-text-primary mt-2">...</p>
                ) : (
                  <p className="text-3xl font-bold text-text-primary mt-2">{todayArticles.toLocaleString()}</p>
                )}
                <p className="text-sm text-success mt-1">
                  <i className="fas fa-arrow-up text-xs"></i> +5 较昨日
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-sync-alt text-success text-xl"></i>
              </div>
            </div>
          </div>

          {/* API调用次数卡片 */}
          <div className={`bg-white rounded-lg shadow-card p-6 ${styles.cardHover}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">API调用次数</p>
                {loading ? (
                  <p className="text-3xl font-bold text-text-primary mt-2">...</p>
                ) : (
                  <p className="text-3xl font-bold text-text-primary mt-2">{apiCalls.toLocaleString()}</p>
                )}
                <p className="text-sm text-warning mt-1">
                  <i className="fas fa-arrow-up text-xs"></i> +8% 较上月
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-code text-purple-600 text-xl"></i>
              </div>
            </div>
          </div>

          {/* 活跃用户数卡片 */}
          <div className={`bg-white rounded-lg shadow-card p-6 ${styles.cardHover}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">活跃用户</p>
                {loading ? (
                  <p className="text-3xl font-bold text-text-primary mt-2">...</p>
                ) : (
                  <p className="text-3xl font-bold text-text-primary mt-2">{activeUsers.toLocaleString()}</p>
                )}
                <p className="text-sm text-success mt-1">
                  <i className="fas fa-arrow-up text-xs"></i> +3 较昨日
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-users text-warning text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* 快捷入口区 */}
        <div className="bg-white rounded-lg shadow-card p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-6">快捷操作</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 资讯类别管理 */}
            <Link 
              to="/admin-category"
              className={`w-full p-4 border border-border-light rounded-lg hover:bg-gray-50 ${styles.quickActionBtn} text-left block`}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-folder text-primary text-xl"></i>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-text-primary">资讯类别管理</h4>
                  <p className="text-sm text-text-secondary mt-1">管理资讯分类和标签</p>
                </div>
                <i className="fas fa-chevron-right text-text-secondary"></i>
              </div>
            </Link>

            {/* 数据源配置 */}
            <Link 
              to="/admin-data-source"
              className={`w-full p-4 border border-border-light rounded-lg hover:bg-gray-50 ${styles.quickActionBtn} text-left block`}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-rss text-success text-xl"></i>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-text-primary">数据源配置</h4>
                  <p className="text-sm text-text-secondary mt-1">管理资讯数据源</p>
                </div>
                <i className="fas fa-chevron-right text-text-secondary"></i>
              </div>
            </Link>

            {/* AI筛选规则设置 */}
            <Link 
              to="/admin-ai-rules"
              className={`w-full p-4 border border-border-light rounded-lg hover:bg-gray-50 ${styles.quickActionBtn} text-left block`}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-brain text-purple-600 text-xl"></i>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-text-primary">AI筛选规则设置</h4>
                  <p className="text-sm text-text-secondary mt-1">配置AI筛选参数</p>
                </div>
                <i className="fas fa-chevron-right text-text-secondary"></i>
              </div>
            </Link>

            {/* 用户权限管理 */}
            <Link 
              to="/admin-user-permission"
              className={`w-full p-4 border border-border-light rounded-lg hover:bg-gray-50 ${styles.quickActionBtn} text-left block`}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-users text-warning text-xl"></i>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-text-primary">用户权限管理</h4>
                  <p className="text-sm text-text-secondary mt-1">管理后台用户账户</p>
                </div>
                <i className="fas fa-chevron-right text-text-secondary"></i>
              </div>
            </Link>

            {/* API生成与管理 */}
            <Link 
              to="/admin-api-manage"
              className={`w-full p-4 border border-border-light rounded-lg hover:bg-gray-50 ${styles.quickActionBtn} text-left block`}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-code text-danger text-xl"></i>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-text-primary">API生成与管理</h4>
                  <p className="text-sm text-text-secondary mt-1">管理API密钥和权限</p>
                </div>
                <i className="fas fa-chevron-right text-text-secondary"></i>
              </div>
            </Link>

            {/* 更新时间设置 */}
            <Link 
              to="/admin-update-time"
              className={`w-full p-4 border border-border-light rounded-lg hover:bg-gray-50 ${styles.quickActionBtn} text-left block`}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-clock text-info text-xl"></i>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-text-primary">更新时间设置</h4>
                  <p className="text-sm text-text-secondary mt-1">设置资讯更新时间</p>
                </div>
                <i className="fas fa-chevron-right text-text-secondary"></i>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
