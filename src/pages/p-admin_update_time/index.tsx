import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';
import { settings as settingsApi } from '../../services/api';

interface NotificationState {
  show: boolean;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

const AdminUpdateTimePage: React.FC = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [updateTime, setUpdateTime] = useState('02:00'); // 默认值与后端保持一致
  const [updateFrequency, setUpdateFrequency] = useState('daily'); // 默认值
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    type: 'success',
    title: '',
    message: ''
  });
  const notificationTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const originalTitle = document.title;
    document.title = '更新时间设置 - 水脉通';
    return () => {
      document.title = originalTitle;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current);
      }
    };
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const response = await settingsApi.getSettings();
      if (response.update_time) {
        setUpdateTime(response.update_time);
      }
      if (response.update_frequency) {
        setUpdateFrequency(response.update_frequency);
      }
    } catch (error) {
      console.error('获取设置失败:', error);
      showNotification('error', '加载失败', '获取更新时间设置失败');
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      localStorage.removeItem('user');
      navigate('/admin-login');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSaving(true);
    try {
      await settingsApi.updateSetting('update_time', updateTime);
      await settingsApi.updateSetting('update_frequency', updateFrequency);
      showNotification('success', '保存成功', '更新时间设置已成功保存');
    } catch (error) {
      console.error('保存设置失败:', error);
      showNotification('error', '保存失败', '保存更新时间设置失败');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      await settingsApi.updateSetting('update_time', '02:00');
      await settingsApi.updateSetting('update_frequency', 'daily');
      setUpdateTime('02:00');
      setUpdateFrequency('daily');
      showNotification('info', '已重置', '设置已恢复为默认值');
    } catch (error) {
      console.error('重置设置失败:', error);
      showNotification('error', '重置失败', '重置设置失败');
    }
  };

  const showNotification = (type: NotificationState['type'], title: string, message: string) => {
    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current);
    }
    
    setNotification({
      show: true,
      type,
      title,
      message
    });

    notificationTimerRef.current = window.setTimeout(() => {
      hideNotification();
    }, 3000);
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  const getFrequencyText = (frequency: string) => {
    const frequencyMap: Record<string, string> = {
      'daily': '每日更新',
      'twice': '每日两次（上午、下午）',
      'hourly': '每小时更新'
    };
    return frequencyMap[frequency] || frequency;
  };

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'success':
        return <i className="fas fa-check text-white text-sm"></i>;
      case 'error':
        return <i className="fas fa-exclamation text-white text-sm"></i>;
      case 'info':
        return <i className="fas fa-info text-white text-sm"></i>;
      case 'warning':
        return <i className="fas fa-exclamation-triangle text-white text-sm"></i>;
      default:
        return <i className="fas fa-check text-white text-sm"></i>;
    }
  };

  const getNotificationIconBg = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-success';
      case 'error':
        return 'bg-danger';
      case 'info':
        return 'bg-info';
      case 'warning':
        return 'bg-warning';
      default:
        return 'bg-success';
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
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${styles.navItemActive}`}
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
              <h2 className="text-2xl font-semibold text-text-primary">更新时间设置</h2>
              <nav className="mt-1">
                <ol className="flex items-center space-x-2 text-sm text-text-secondary">
                  <li>
                    <Link to="/admin-dashboard" className="hover:text-primary">后台首页</Link>
                  </li>
                  <li><i className="fas fa-chevron-right text-xs"></i></li>
                  <li className="text-text-primary">更新时间设置</li>
                </ol>
              </nav>
            </div>
          </div>
        </div>

        {/* 表单区域 */}
        <div className="bg-white rounded-lg shadow-card p-6">
          <div className="max-w-md">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-text-primary mb-2">每日更新时间设置</h3>
              <p className="text-sm text-text-secondary">设置系统每日自动抓取和更新资讯的时间</p>
            </div>
            
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="update-time" className="block text-sm font-medium text-text-primary">
                  每日更新时间 <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <input 
                    type="time" 
                    id="update-time" 
                    name="update-time" 
                    className={`w-full px-4 py-3 border border-border-light rounded-lg ${styles.formInputFocus} ${styles.timeInput}`}
                    value={updateTime}
                    onChange={(e) => setUpdateTime(e.target.value)}
                    required
                  />
                  <i className="fas fa-clock absolute right-4 top-1/2 transform -translate-y-1/2 text-text-secondary"></i>
                </div>
                <p className="text-xs text-text-secondary">
                  <i className="fas fa-info-circle mr-1"></i>
                  系统将在每日指定时间自动执行资讯抓取和更新操作
                </p>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="update-frequency" className="block text-sm font-medium text-text-primary">
                  更新频率
                </label>
                <select 
                  id="update-frequency" 
                  name="update-frequency" 
                  className={`w-full px-4 py-3 border border-border-light rounded-lg ${styles.formInputFocus}`}
                  value={updateFrequency}
                  onChange={(e) => setUpdateFrequency(e.target.value)}
                >
                  <option value="daily">每日更新</option>
                  <option value="twice">每日两次（上午、下午）</option>
                  <option value="hourly">每小时更新</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-primary">
                  当前设置
                </label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">每日更新时间：</span>
                    <span className="text-sm font-medium text-text-primary">{updateTime}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-text-secondary">更新频率：</span>
                    <span className="text-sm font-medium text-text-primary">{getFrequencyText(updateFrequency)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-text-secondary">上次更新：</span>
                    <span className="text-sm text-text-secondary">2024-01-15 08:00</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 pt-4 border-t border-border-light">
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary flex items-center space-x-2 transition-colors duration-200 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      <span>保存中...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i>
                      <span>保存设置</span>
                    </>
                  )}
                </button>
                <button 
                  type="button" 
                  onClick={handleReset}
                  className="px-6 py-3 border border-border-light text-text-secondary rounded-lg hover:bg-gray-50 flex items-center space-x-2 transition-colors duration-200"
                >
                  <i className="fas fa-undo"></i>
                  <span>重置</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* 通知提示 */}
      <div className={`${styles.notification} ${notification.show ? styles.notificationShow : ''} bg-white border border-border-light rounded-lg shadow-lg p-4 max-w-sm`}>
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 ${getNotificationIconBg()} rounded-full flex items-center justify-center`}>
            {getNotificationIcon()}
          </div>
          <div>
            <h4 className="text-sm font-medium text-text-primary">{notification.title}</h4>
            <p className="text-xs text-text-secondary mt-1">{notification.message}</p>
          </div>
          <button 
            onClick={hideNotification}
            className="text-text-secondary hover:text-text-primary"
          >
            <i className="fas fa-times text-sm"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminUpdateTimePage;
