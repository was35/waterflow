declare module '../../services/api' {
  export interface Article {
    article_id: string;
    title: string;
    content: string;
    category_id: string;
    category_name: string;
    source: string;
    source_url: string;
    author: string;
    publish_time: string;
    summary: string;
    image_url: string;
    ai_score: number;
    ai_category: string;
    views: number;
    created_at: string;
    updated_at: string;
  }

  export interface Category {
    category_id: string;
    category_name: string;
    sort_order: number;
    created_at: string;
    updated_at: string;
  }

  export interface DataSource {
    source_id: string;
    source_name: string;
    source_url: string;
    source_type: string;
    relevance_score: number;
    discovery_method: string;
    enabled: number;
    created_at: string;
    updated_at: string;
  }

  export interface AiRule {
    rule_id: string;
    rule_name: string;
    rule_type: string;
    rule_content: string;
    created_at: string;
  }

  export interface User {
    user_id: string;
    username: string;
    email: string;
    role: string;
    created_at: string;
    updated_at: string;
  }

  export interface ApiKey {
    api_key_id: string;
    api_key: string;
    name: string;
    permissions: string;
    rate_limit: number;
    enabled: number;
    created_at: string;
  }

  export interface ApiLog {
    log_id: string;
    api_key_id: string;
    endpoint: string;
    method: string;
    params: string;
    result: string;
    status: number;
    created_at: string;
  }

  export interface Setting {
    key: string;
    value: string;
    updated_at: string;
  }

  export const auth: {
    login: (username: string, password: string) => Promise<User>;
    me: () => Promise<User>;
  };

  export const articles: {
    getArticles: (params?: any) => Promise<{ data: Article[]; total: number; page: number; pageSize: number }>;
    getArticle: (id: string) => Promise<Article>;
    createArticle: (data: Partial<Article>) => Promise<{ article_id: string }>;
    updateArticle: (id: string, data: Partial<Article>) => Promise<{ success: boolean }>;
    deleteArticle: (id: string) => Promise<{ success: boolean }>;
  };

  export const categories: {
    getCategories: () => Promise<Category[]>;
    getCategory: (id: string) => Promise<Category>;
    createCategory: (data: Partial<Category>) => Promise<{ category_id: string }>;
    updateCategory: (id: string, data: Partial<Category>) => Promise<{ success: boolean }>;
    deleteCategory: (id: string) => Promise<{ success: boolean }>;
  };

  export const dataSources: {
    getDataSources: (params?: any) => Promise<DataSource[]>;
    getDataSource: (id: string) => Promise<DataSource>;
    createDataSource: (data: Partial<DataSource>) => Promise<{ source_id: string }>;
    updateDataSource: (id: string, data: Partial<DataSource>) => Promise<{ success: boolean }>;
    deleteDataSource: (id: string) => Promise<{ success: boolean }>;
  };

  export const aiRules: {
    getAiRules: () => Promise<AiRule[]>;
    getAiRule: (id: string) => Promise<AiRule>;
    createAiRule: (data: Partial<AiRule>) => Promise<{ rule_id: string }>;
    updateAiRule: (id: string, data: Partial<AiRule>) => Promise<{ success: boolean }>;
    deleteAiRule: (id: string) => Promise<{ success: boolean }>;
  };

  export const users: {
    getUsers: () => Promise<User[]>;
    getUser: (id: string) => Promise<User>;
    createUser: (data: Partial<User>) => Promise<{ user_id: string }>;
    updateUser: (id: string, data: Partial<User>) => Promise<{ success: boolean }>;
    deleteUser: (id: string) => Promise<{ success: boolean }>;
  };

  export const apiManage: {
    getApiKeys: () => Promise<ApiKey[]>;
    createApiKey: (data: Partial<ApiKey>) => Promise<{ api_key_id: string; api_key: string }>;
    updateApiKey: (id: string, data: Partial<ApiKey>) => Promise<{ success: boolean }>;
    deleteApiKey: (id: string) => Promise<{ success: boolean }>;
    getApiLogs: () => Promise<ApiLog[]>;
  };

  export const settings: {
    getSettings: () => Promise<Record<string, string>>;
    getSetting: (key: string) => Promise<Setting>;
    updateSetting: (key: string, value: string) => Promise<{ success: boolean }>;
  };
}
