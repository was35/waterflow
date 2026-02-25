import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import styles from './styles.module.css';
import { articles, categories as categoriesApi } from '../../services/api';

interface NewsArticle {
  article_id: string;
  title: string;
  content: string;
  category_id: string;
  category_name: string;
  ai_score: number;
  source: string;
  source_url: string;
  author: string;
  publish_time: string;
  summary: string;
  image_url: string;
  views: number;
}

const InfoDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState('');
  const [modalImageAlt, setModalImageAlt] = useState('');

  const articleId = searchParams.get('articleId');

  const fetchArticle = useCallback(async () => {
    if (!articleId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const fetchedArticle = await articles.getArticle(articleId);
      setArticle(fetchedArticle);
      // 假设收藏状态可以从后端获取或本地存储
      setIsFavorited(false); 
    } catch (error) {
      console.error('获取文章详情失败:', error);
      setArticle(null);
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  useEffect(() => {
    const originalTitle = document.title;
    document.title = article ? `水脉通 - ${article.title}` : '水脉通 - 资讯详情';
    return () => { document.title = originalTitle; };
  }, [article]);

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleFavoriteClick = () => {
    setIsFavorited(!isFavorited);
  };

  const handleShareClick = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.title || '水脉通资讯',
        text: article?.summary || '分享水脉通资讯',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('链接已复制到剪贴板');
      });
    }
  };

  const handleImageClick = (src: string, alt: string) => {
    setModalImageSrc(src);
    setModalImageAlt(alt);
    setIsImageModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsImageModalVisible(false);
  };

  const handleModalBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsImageModalVisible(false);
    }
  };

  const handleGlobalSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const keyword = (e.target as HTMLInputElement).value.trim();
      if (keyword) {
        navigate(`/info-list?keyword=${encodeURIComponent(keyword)}`);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isImageModalVisible) {
        setIsImageModalVisible(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isImageModalVisible]);

  const getCategoryColor = (categoryName: string) => {
    const colorMap: { [key: string]: string } = {
      '水务政策': 'bg-blue-100 text-blue-800',
      '技术创新': 'bg-purple-100 text-purple-800',
      '市场动态': 'bg-orange-100 text-orange-800',
      '案例研究': 'bg-teal-100 text-teal-800'
    };
    return colorMap[categoryName] || 'bg-gray-100 text-gray-800';
  };

  const getAIScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <div className="text-center py-8 text-text-secondary">加载中...</div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className={styles.pageWrapper}>
        <div className="text-center py-8 text-danger">文章未找到或加载失败。</div>
      </div>
    );
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
                placeholder="搜索水务资讯..." 
                className={`w-full pl-10 pr-4 py-2 border border-border-light rounded-lg ${styles.searchInputFocus}`}
                onKeyPress={handleGlobalSearchKeyPress}
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
      <aside className={`fixed left-0 top-16 bottom-0 bg-white border-r border-border-light transition-all duration-300 z-40 ${
        isSidebarCollapsed ? styles.sidebarCollapsed : styles.sidebarExpanded
      }`}>
        <nav className="p-4 space-y-2">
          <Link 
            to="/info-list" 
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-text-secondary hover:bg-gray-100"
          >
            <i className="fas fa-home w-5"></i>
            {!isSidebarCollapsed && <span>首页</span>}
          </Link>
          <Link 
            to="/info-list" 
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${styles.navItemActive}`}
          >
            <i className="fas fa-newspaper w-5"></i>
            {!isSidebarCollapsed && <span>资讯列表</span>}
          </Link>
          <Link 
            to="/admin-category" 
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-text-secondary hover:bg-gray-100"
          >
            <i className="fas fa-folder w-5"></i>
            {!isSidebarCollapsed && <span>分类管理</span>}
          </Link>
          <Link 
            to="/admin-data-source" 
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-text-secondary hover:bg-gray-100"
          >
            <i className="fas fa-rss w-5"></i>
            {!isSidebarCollapsed && <span>数据源</span>}
          </Link>
          <Link 
            to="/admin-ai-rules" 
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-text-secondary hover:bg-gray-100"
          >
            <i className="fas fa-brain w-5"></i>
            {!isSidebarCollapsed && <span>AI规则</span>}
          </Link>
          <Link 
            to="/admin-user-permission" 
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-text-secondary hover:bg-gray-100"
          >
            <i className="fas fa-users w-5"></i>
            {!isSidebarCollapsed && <span>用户管理</span>}
          </Link>
          <Link 
            to="/admin-api-manage" 
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-text-secondary hover:bg-gray-100"
          >
            <i className="fas fa-code w-5"></i>
            {!isSidebarCollapsed && <span>API管理</span>}
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
              <h2 className="text-2xl font-semibold text-text-primary">{article.title}</h2>
              <nav className="mt-1">
                <ol className="flex items-center space-x-2 text-sm text-text-secondary">
                  <li><Link to="/info-list" className="hover:text-primary">首页</Link></li>
                  <li><i className="fas fa-chevron-right text-xs"></i></li>
                  <li><Link to="/info-list" className="hover:text-primary">资讯列表</Link></li>
                  <li><i className="fas fa-chevron-right text-xs"></i></li>
                  <li className="text-text-primary">{article.title}</li>
                </ol>
              </nav>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleBackClick}
                className="px-4 py-2 border border-border-light rounded-lg hover:bg-gray-50 flex items-center space-x-2"
              >
                <i className="fas fa-arrow-left text-sm"></i>
                <span>返回</span>
              </button>
              <button 
                onClick={handleFavoriteClick}
                className={`px-4 py-2 rounded-lg hover:bg-yellow-600 flex items-center space-x-2 ${
                  isFavorited 
                    ? 'bg-gray-500 hover:bg-gray-600' 
                    : 'bg-warning text-white'
                }`}
              >
                <i className={`${isFavorited ? 'far' : 'fas'} fa-star text-sm`}></i>
                <span>{isFavorited ? '取消收藏' : '收藏'}</span>
              </button>
              <button 
                onClick={handleShareClick}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary flex items-center space-x-2"
              >
                <i className="fas fa-share text-sm"></i>
                <span>分享</span>
              </button>
            </div>
          </div>
        </div>

        {/* 资讯元数据区 */}
        <div className="bg-white rounded-lg shadow-card p-6 mb-6">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center space-x-2">
              <i className="fas fa-building text-text-secondary"></i>
              <span className="text-text-secondary">来源：</span>
              <span className="text-text-primary font-medium">{article.source}</span>
            </div>
            <div className="flex items-center space-x-2">
              <i className="fas fa-calendar text-text-secondary"></i>
              <span className="text-text-secondary">发布时间：</span>
              <span className="text-text-primary font-medium">{new Date(article.publish_time).toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <i className="fas fa-user text-text-secondary"></i>
              <span className="text-text-secondary">作者：</span>
              <span className="text-text-primary font-medium">{article.author || '未知'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <i className="fas fa-eye text-text-secondary"></i>
              <span className="text-text-secondary">阅读量：</span>
              <span className="text-text-primary font-medium">{article.views.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <i className="fas fa-folder text-text-secondary"></i>
              <span className="text-text-secondary">分类：</span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getCategoryColor(article.category_name)}`}>
                {article.category_name}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <i className="fas fa-brain text-text-secondary"></i>
              <span className="text-text-secondary">AI质量评分：</span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getAIScoreColor(article.ai_score)}`}>
                {article.ai_score}分
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <i className="fas fa-tags text-text-secondary"></i>
              <span className="text-text-secondary">AI主题：</span>
              <div className="flex space-x-1">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                  {article.ai_category || '无'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 资讯内容区 */}
        <div className="bg-white rounded-lg shadow-card p-6 mb-6">
          <div className={styles.articleContent}>
            {article.image_url && (
              <div className="mb-6">
                <img 
                  src={article.image_url} 
                  alt={article.title} 
                  className="w-full max-w-2xl mx-auto cursor-pointer"
                  onClick={() => handleImageClick(article.image_url, article.title)}
                />
              </div>
            )}
            
            <div dangerouslySetInnerHTML={{ __html: article.content || article.summary }} />
          </div>
        </div>

        {/* 相关推荐区 */}
        <div className="bg-white rounded-lg shadow-card p-6">
          <h3 className="text-xl font-semibold text-text-primary mb-4">相关资讯推荐</h3>
          <div className="space-y-4">
            {/* 这里可以添加相关推荐的逻辑，目前先留空或使用模拟数据 */}
            <p className="text-text-secondary">暂无相关推荐</p>
          </div>
        </div>
      </main>

      {/* 图片放大模态框 */}
      <div 
        className={`${styles.imageModal} ${isImageModalVisible ? styles.imageModalShow : ''}`}
        onClick={handleModalBackdropClick}
      >
        <img src={modalImageSrc} alt={modalImageAlt} />
        <button 
          onClick={handleCloseModal}
          className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
    </div>
  );
};

export default InfoDetailPage;
