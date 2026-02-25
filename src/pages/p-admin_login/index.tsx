import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles.module.css';
import { auth } from '../../services/api';

interface LoginFormData {
  username: string;
  password: string;
  rememberMe: boolean;
}

interface ValidationErrors {
  username: boolean;
  password: boolean;
  form: boolean;
}

interface ErrorMessages {
  username: string;
  password: string;
  form: string;
}

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
    rememberMe: false
  });
  
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    username: false,
    password: false,
    form: false
  });
  
  const [errorMessages, setErrorMessages] = useState<ErrorMessages>({
    username: '请输入用户名',
    password: '请输入密码',
    form: '用户名或密码错误，请重试'
  });
  
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '水脉通 - 后台登录';
    return () => { document.title = originalTitle; };
  }, []);

  // 页面加载时检查记住的密码
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const rememberMe = localStorage.getItem('rememberMe') === 'true';
      const savedUsername = localStorage.getItem('username') || '';
      
      setFormData(prev => ({
        ...prev,
        rememberMe,
        username: savedUsername
      }));
    }
  }, []);

  // 用户名验证函数
  const validateUsername = (value: string): boolean => {
    return value.trim().length >= 3;
  };

  // 密码验证函数
  const validatePassword = (value: string): boolean => {
    return value.length >= 6;
  };

  // 处理输入变化
  const handleInputChange = (field: keyof LoginFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // 清除错误状态
    if (validationErrors[field as keyof ValidationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: false
      }));
    }

    // 记住密码逻辑
    if (field === 'rememberMe' && typeof value === 'boolean') {
      if (typeof window !== 'undefined') {
        localStorage.setItem('rememberMe', value.toString());
        if (!value) {
          localStorage.removeItem('username');
        }
      }
    }

    // 用户名输入时更新本地存储
    if (field === 'username' && formData.rememberMe && typeof value === 'string') {
      if (typeof window !== 'undefined') {
        localStorage.setItem('username', value);
      }
    }
  };

  // 处理输入框失焦验证
  const handleInputBlur = (field: 'username' | 'password') => {
    const value = formData[field];
    let isValid = false;
    let errorMessage = '';

    if (field === 'username') {
      isValid = validateUsername(value);
      errorMessage = isValid ? '' : '用户名至少需要3个字符';
    } else if (field === 'password') {
      isValid = validatePassword(value);
      errorMessage = isValid ? '' : '密码至少需要6个字符';
    }

    setValidationErrors(prev => ({
      ...prev,
      [field]: !isValid
    }));

    if (!isValid) {
      setErrorMessages(prev => ({
        ...prev,
        [field]: errorMessage
      }));
    }
  };

  // 切换密码可见性
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  // 处理忘记密码
  const handleForgotPassword = () => {
    setShowForgotPasswordModal(true);
  };

  // 关闭忘记密码模态框
  const closeForgotPasswordModal = () => {
    setShowForgotPasswordModal(false);
  };

  // 处理注册链接点击
  const handleRegisterLink = () => {
    alert('请联系系统管理员获取账户信息');
  };

  // 处理表单提交
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 清除之前的表单错误
    setValidationErrors(prev => ({
      ...prev,
      form: false
    }));

    // 验证所有字段
    const isUsernameValid = validateUsername(formData.username);
    const isPasswordValid = validatePassword(formData.password);

    if (!isUsernameValid || !isPasswordValid) {
      setValidationErrors(prev => ({
        ...prev,
        username: !isUsernameValid,
        password: !isPasswordValid
      }));

      if (!isUsernameValid) {
        setErrorMessages(prev => ({
          ...prev,
          username: '用户名至少需要3个字符'
        }));
      }

      if (!isPasswordValid) {
        setErrorMessages(prev => ({
          ...prev,
          password: '密码至少需要6个字符'
        }));
      }

      return;
    }

    // 显示加载状态
    setIsLoading(true);

    try {
      const response = await auth.login(formData.username, formData.password);
      if (response) {
        localStorage.setItem('user', JSON.stringify({ username: formData.username, password: formData.password, role: response.role }));
        navigate('/admin-dashboard');
      } else {
        setValidationErrors(prev => ({ ...prev, form: true }));
      }
    } catch (error) {
      console.error('登录失败:', error);
      setValidationErrors(prev => ({ ...prev, form: true }));
    } finally {
      setIsLoading(false);
    }
  };

  // 处理键盘事件
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC键关闭模态框
      if (e.key === 'Escape' && showForgotPasswordModal) {
        setShowForgotPasswordModal(false);
      }

      // Enter键提交表单
      if (e.key === 'Enter' && document.activeElement?.tagName !== 'BUTTON') {
        handleFormSubmit(e as any);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showForgotPasswordModal, handleFormSubmit]);

  return (
    <div className={styles.pageWrapper}>
      {/* 登录容器 */}
      <div className="w-full max-w-md">
        {/* 登录卡片 */}
        <div className="bg-white rounded-xl shadow-login p-8 w-full">
          {/* Logo和系统名称 */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-tint text-white text-2xl"></i>
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">水脉通管理系统</h1>
            <p className="text-text-secondary">请登录您的管理员账户</p>
          </div>
          
          {/* 登录表单 */}
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* 用户名输入框 */}
            <div className={styles.formGroup}>
              <label htmlFor="username" className="block text-sm font-medium text-text-primary mb-2">
                用户名
              </label>
              <div className="relative">
                <i className="fas fa-user"></i>
                <input 
                  type="text" 
                  id="username" 
                  name="username" 
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  onBlur={() => handleInputBlur('username')}
                  className={`w-full h-10 px-4 border rounded-lg ${styles.loginInputFocus} transition-all duration-200 ${
                    validationErrors.username ? 'border-danger' : 'border-border-light'
                  }`}
                  placeholder="请输入用户名"
                  required
                />
              </div>
              <p className={`${styles.errorMessage} ${validationErrors.username ? styles.show : ''} text-danger text-sm mt-1`}>
                <i className="fas fa-exclamation-circle mr-1"></i>
                {errorMessages.username}
              </p>
            </div>
            
            {/* 密码输入框 */}
            <div className={styles.formGroup}>
              <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
                密码
              </label>
              <div className="relative">
                <i className="fas fa-lock"></i>
                <input 
                  type={isPasswordVisible ? 'text' : 'password'}
                  id="password" 
                  name="password" 
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  onBlur={() => handleInputBlur('password')}
                  className={`w-full h-10 px-4 border rounded-lg ${styles.loginInputFocus} transition-all duration-200 ${
                    validationErrors.password ? 'border-danger' : 'border-border-light'
                  }`}
                  placeholder="请输入密码"
                  required
                />
                <button 
                  type="button" 
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary"
                >
                  <i className={`fas ${isPasswordVisible ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              <p className={`${styles.errorMessage} ${validationErrors.password ? styles.show : ''} text-danger text-sm mt-1`}>
                <i className="fas fa-exclamation-circle mr-1"></i>
                {errorMessages.password}
              </p>
            </div>
            
            {/* 记住密码和忘记密码 */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  checked={formData.rememberMe}
                  onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                  className="rounded border-border-light focus:ring-primary"
                />
                <span className="text-sm text-text-secondary">记住密码</span>
              </label>
              <button 
                type="button" 
                onClick={handleForgotPassword}
                className="text-sm text-primary hover:text-secondary transition-colors"
              >
                忘记密码？
              </button>
            </div>
            
            {/* 登录按钮 */}
            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full h-11 bg-primary text-white rounded-lg font-medium ${styles.loginButtonHover} transition-all duration-200 flex items-center justify-center space-x-2`}
            >
              <span>{isLoading ? '登录中...' : '登录'}</span>
              <i className={`fas fa-spinner fa-spin ${styles.loadingSpinner} ${isLoading ? styles.show : ''}`}></i>
            </button>
            
            {/* 错误提示 */}
            <div className={`${styles.errorMessage} ${validationErrors.form ? styles.show : ''} bg-red-50 border border-red-200 rounded-lg p-3`}>
              <div className="flex items-center space-x-2">
                <i className="fas fa-exclamation-triangle text-danger"></i>
                <span className="text-danger text-sm">{errorMessages.form}</span>
              </div>
            </div>
          </form>
          
          {/* 底部链接 */}
          <div className="text-center mt-6 pt-6 border-t border-border-light">
            <p className="text-sm text-text-secondary">
              没有账户？
              <button onClick={handleRegisterLink} className="text-primary hover:text-secondary transition-colors">
                联系系统管理员
              </button>
            </p>
          </div>
        </div>
        
        {/* 版权信息 */}
        <div className="text-center mt-6">
          <p className="text-white text-sm opacity-80">
            © 2024 水脉通管理系统. 保留所有权利.
          </p>
        </div>
      </div>
      
      {/* 忘记密码模态框 */}
      {showForgotPasswordModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeForgotPasswordModal();
            }
          }}
        >
          <div className="bg-white rounded-xl shadow-login p-6 w-full max-w-md">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-warning rounded-lg flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-key text-white"></i>
              </div>
              <h3 className="text-lg font-semibold text-text-primary">重置密码</h3>
              <p className="text-text-secondary text-sm mt-1">请联系系统管理员重置您的密码</p>
            </div>
            <button 
              onClick={closeForgotPasswordModal}
              className="w-full h-10 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
            >
              我知道了
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLoginPage;
