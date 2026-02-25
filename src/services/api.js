const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

async function callApi(endpoint, method = 'GET', data = null, authRequired = false) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (authRequired) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user && user.username && user.password) {
      headers['Authorization'] = 'Basic ' + btoa(`${user.username}:${user.password}`);
    } else {
      console.error('Authentication required but no user data found.');
    }
  }

  const config = {
    method,
    headers,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Something went wrong');
    }
    return await response.json();
  } catch (error) {
    console.error(`API call to ${endpoint} failed:`, error);
    throw error;
  }
}

async function callApiWithApiKey(endpoint, method = 'GET', data = null) {
  const apiKey = localStorage.getItem('apiKey') || import.meta.env.VITE_API_KEY;
  const headers = {
    'Content-Type': 'application/json',
  };

  if (apiKey) {
    headers['x-api-key'] = apiKey;
  }

  const config = {
    method,
    headers,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Something went wrong');
    }
    return await response.json();
  } catch (error) {
    console.error(`API call to ${endpoint} failed:`, error);
    throw error;
  }
}

export const auth = {
  login: (username, password) => callApi('/auth/login', 'POST', { username, password }),
  me: () => callApi('/auth/me', 'GET', null, true),
};

export const articles = {
  getArticles: (params) => callApi(`/articles?${new URLSearchParams(params).toString()}`),
  getArticle: (id) => callApi(`/articles/${id}`),
  createArticle: (data) => callApi('/articles', 'POST', data, true),
  updateArticle: (id, data) => callApi(`/articles/${id}`, 'PUT', data, true),
  deleteArticle: (id) => callApi(`/articles/${id}`, 'DELETE', null, true),
};

export const categories = {
  getCategories: () => callApi('/categories'),
  getCategory: (id) => callApi(`/categories/${id}`),
  createCategory: (data) => callApi('/categories', 'POST', data, true),
  updateCategory: (id, data) => callApi(`/categories/${id}`, 'PUT', data, true),
  deleteCategory: (id) => callApi(`/categories/${id}`, 'DELETE', null, true),
};

export const dataSources = {
  getDataSources: (params) => callApi(`/data-sources?${new URLSearchParams(params).toString()}`),
  getDataSource: (id) => callApi(`/data-sources/${id}`),
  createDataSource: (data) => callApi('/data-sources', 'POST', data, true),
  updateDataSource: (id, data) => callApi(`/data-sources/${id}`, 'PUT', data, true),
  deleteDataSource: (id) => callApi(`/data-sources/${id}`, 'DELETE', null, true),
};

export const aiRules = {
  getAiRules: () => callApi('/ai-rules'),
  getAiRule: (id) => callApi(`/ai-rules/${id}`),
  createAiRule: (data) => callApi('/ai-rules', 'POST', data, true),
  updateAiRule: (id, data) => callApi(`/ai-rules/${id}`, 'PUT', data, true),
  deleteAiRule: (id) => callApi(`/ai-rules/${id}`, 'DELETE', null, true),
};

export const users = {
  getUsers: () => callApi('/users', 'GET', null, true),
  getUser: (id) => callApi(`/users/${id}`, 'GET', null, true),
  createUser: (data) => callApi('/users', 'POST', data, true),
  updateUser: (id, data) => callApi(`/users/${id}`, 'PUT', data, true),
  deleteUser: (id) => callApi(`/users/${id}`, 'DELETE', null, true),
};

export const apiManage = {
  getApiKeys: () => callApi('/api-manage', 'GET', null, true),
  createApiKey: (data) => callApi('/api-manage', 'POST', data, true),
  updateApiKey: (id, data) => callApi(`/api-manage/${id}`, 'PUT', data, true),
  deleteApiKey: (id) => callApi(`/api-manage/${id}`, 'DELETE', null, true),
  getApiLogs: () => callApi('/api-manage/logs', 'GET', null, true),
};

export const settings = {
  getSettings: () => callApi('/settings', 'GET', null, true),
  getSetting: (key) => callApi(`/settings/${key}`, 'GET', null, true),
  updateSetting: (key, value) => callApi(`/settings/${key}`, 'PUT', { value }, true),
};

export const aiFilter = {
  filterData: (data_items, filter_rule_id, filter_rule) => callApiWithApiKey('/ai-filter/filter', 'POST', {
    data_items,
    filter_rule_id,
    filter_rule
  }),
  analyzeData: (data_item) => callApiWithApiKey('/ai-filter/analyze', 'POST', {
    data_item
  }),
  batchFilter: (data_items, filter_rule_id, filter_rule) => callApiWithApiKey('/ai-filter/batch-filter', 'POST', {
    data_items,
    filter_rule_id,
    filter_rule
  }),
  getResults: (params) => callApiWithApiKey(`/ai-filter/results?${new URLSearchParams(params).toString()}`),
  getResult: (id) => callApiWithApiKey(`/ai-filter/results/${id}`),
  deleteResult: (id) => callApiWithApiKey(`/ai-filter/results/${id}`, 'DELETE'),
};

export const aiSearch = {
  search: (keyword, max_count) => callApiWithApiKey(`/ai-search/search?keyword=${encodeURIComponent(keyword)}&max_count=${max_count || 20}`),
  fetch: (max_count) => callApiWithApiKey('/ai-search/fetch', 'POST', {
    max_count: max_count || 50
  }),
  getHistory: (params) => callApiWithApiKey(`/ai-search/history?${new URLSearchParams(params).toString()}`),
  getStats: () => callApiWithApiKey('/ai-search/stats'),
};
