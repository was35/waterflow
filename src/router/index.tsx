import { createBrowserRouter, Navigate, Outlet, useLocation } from 'react-router-dom';
import React, { useEffect } from 'react';
import { ErrorBoundary } from '../components/ErrorBoundary';

import P_info_list from '../pages/p-info_list';
import P_info_detail from '../pages/p-info_detail';
import P_admin_login from '../pages/p-admin_login';
import P_admin_dashboard from '../pages/p-admin_dashboard';
import P_admin_category from '../pages/p-admin_category';
import P_admin_update_time from '../pages/p-admin_update_time';
import P_admin_data_source from '../pages/p-admin_data_source';
import P_admin_ai_rules from '../pages/p-admin_ai_rules';
import P_admin_user_permission from '../pages/p-admin_user_permission';
import P_admin_api_manage from '../pages/p-admin_api_manage';
import NotFoundPage from './NotFoundPage';
import ErrorPage from './ErrorPage';

function Listener() {
  const location = useLocation();
  useEffect(() => {
    const pageId = 'P-' + location.pathname.replace('/', '').toUpperCase();
    console.log('当前pageId:', pageId, ', pathname:', location.pathname, ', search:', location.search);
    if (typeof window === 'object' && window.parent && window.parent.postMessage) {
      window.parent.postMessage({
        type: 'chux-path-change',
        pageId: pageId,
        pathname: location.pathname,
        search: location.search,
      }, '*');
    }
  }, [location]);

  return <Outlet />;
}

const AuthGuard: React.FC = () => {
  const user = localStorage.getItem('user');
  if (!user) {
    return <Navigate to="/admin-login" replace />;
  }
  return <Outlet />;
};

// 使用 createBrowserRouter 创建路由实例
const router = createBrowserRouter([
  {
    path: '/',
    element: <Listener />,
    children: [
      {
        path: '/',
        element: <Navigate to='/info-list' replace={true} />,
      },
      {
        path: '/info-list',
        element: (
          <ErrorBoundary>
            <P_info_list />
          </ErrorBoundary>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: '/info-detail',
        element: (
          <ErrorBoundary>
            <P_info_detail />
          </ErrorBoundary>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: '/admin-login',
        element: (
          <ErrorBoundary>
            <P_admin_login />
          </ErrorBoundary>
        ),
        errorElement: <ErrorPage />,
      },
      {
        element: <AuthGuard />,
        children: [
          {
            path: '/admin-dashboard',
            element: (
              <ErrorBoundary>
                <P_admin_dashboard />
              </ErrorBoundary>
            ),
            errorElement: <ErrorPage />,
          },
          {
            path: '/admin-category',
            element: (
              <ErrorBoundary>
                <P_admin_category />
              </ErrorBoundary>
            ),
            errorElement: <ErrorPage />,
          },
          {
            path: '/admin-update-time',
            element: (
              <ErrorBoundary>
                <P_admin_update_time />
              </ErrorBoundary>
            ),
            errorElement: <ErrorPage />,
          },
          {
            path: '/admin-data-source',
            element: (
              <ErrorBoundary>
                <P_admin_data_source />
              </ErrorBoundary>
            ),
            errorElement: <ErrorPage />,
          },
          {
            path: '/admin-ai-rules',
            element: (
              <ErrorBoundary>
                <P_admin_ai_rules />
              </ErrorBoundary>
            ),
            errorElement: <ErrorPage />,
          },
          {
            path: '/admin-user-permission',
            element: (
              <ErrorBoundary>
                <P_admin_user_permission />
              </ErrorBoundary>
            ),
            errorElement: <ErrorPage />,
          },
          {
            path: '/admin-api-manage',
            element: (
              <ErrorBoundary>
                <P_admin_api_manage />
              </ErrorBoundary>
            ),
            errorElement: <ErrorPage />,
          },
        ],
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ]
  }
]);

export default router;
