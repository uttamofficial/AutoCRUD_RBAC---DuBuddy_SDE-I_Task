const normalizeBaseUrl = (value?: string) => {
  if (!value) return undefined;
  return value.endsWith('/') ? value.slice(0, -1) : value;
};

const resolveSameOriginBase = (suffix: string) => {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${suffix}`;
  }
  return `http://localhost:4000${suffix}`;
};

const resolveBaseUrl = (envValue: string | undefined, fallbackSuffix: string) => {
  const fromEnv = normalizeBaseUrl(envValue);
  if (fromEnv) return fromEnv;
  return resolveSameOriginBase(fallbackSuffix);
};

const API_BASE_URL = resolveBaseUrl(import.meta.env.VITE_API_BASE_URL as string | undefined, '/api');
const AUTH_BASE_URL = resolveBaseUrl(import.meta.env.VITE_AUTH_BASE_URL as string | undefined, '/auth');

// Token management
let authToken: string | null = localStorage.getItem('authToken');
let currentUser: { userId: number; email: string; role: string } | null = null;

const storedUser = localStorage.getItem('currentUser');
if (storedUser) {
  try {
    currentUser = JSON.parse(storedUser);
  } catch (e) {
    localStorage.removeItem('currentUser');
  }
}

export const auth = {
  setToken: (token: string) => {
    authToken = token;
    localStorage.setItem('authToken', token);
  },
  
  getToken: () => authToken,
  
  clearToken: () => {
    authToken = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    currentUser = null;
  },
  
  setUser: (user: { userId: number; email: string; role: string }) => {
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
  },
  
  getUser: () => currentUser,
  
  isAuthenticated: () => !!authToken,
  
  hasPermission: (modelRBAC: { [role: string]: string[] } | undefined, permission: string): boolean => {
    if (!currentUser) return false;
    if (!modelRBAC) return true; // No RBAC = allow all
    
    const rolePermissions = modelRBAC[currentUser.role];
    if (!rolePermissions) return false;
    
    if (rolePermissions.includes('all')) return true;
    return rolePermissions.includes(permission);
  },
};

export interface ModelDefinition {
  name: string;
  fields: FieldDefinition[];
  rbac?: RBACConfig;
  ownerField?: string;
}

export interface FieldDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'json' | 'relation';
  required?: boolean;
  unique?: boolean;
  default?: any;
  relationType?: 'one-to-one' | 'one-to-many' | 'many-to-many';
  relatedModel?: string;
}

export interface RBACConfig {
  [role: string]: string[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export const api = {
  // Get all models
  getModels: async (): Promise<ApiResponse<ModelDefinition[]>> => {
    const response = await fetch(`${API_BASE_URL}/models`);
    return response.json();
  },

  // Get a specific model
  getModel: async (name: string): Promise<ApiResponse<ModelDefinition>> => {
    const response = await fetch(`${API_BASE_URL}/models/${name}`);
    return response.json();
  },

  // Save a new model
  saveModel: async (model: ModelDefinition): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/models/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(model),
    });
    return response.json();
  },

  // Delete a model
  deleteModel: async (name: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/models/${name}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  // Validate a model
  validateModel: async (model: ModelDefinition): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/models/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(model),
    });
    return response.json();
  },

  // Authentication
  login: async (email: string, password: string): Promise<ApiResponse<{ token: string; user: any }>> => {
  const response = await fetch(`${AUTH_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  // Generate mock token for testing
  getMockToken: async (userId: number, email: string, role: string): Promise<ApiResponse<{ token: string }>> => {
  const response = await fetch(`${AUTH_BASE_URL}/mock-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, email, role }),
    });
    return response.json();
  },

  // CRUD Operations
  getRecords: async (modelName: string): Promise<ApiResponse<any[]>> => {
    const headers: any = {
      'Content-Type': 'application/json',
    };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${API_BASE_URL}/crud/${modelName}`, {
      headers,
    });
    return response.json();
  },

  getRecord: async (modelName: string, id: number | string): Promise<ApiResponse<any>> => {
    const headers: any = {
      'Content-Type': 'application/json',
    };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${API_BASE_URL}/crud/${modelName}/${id}`, {
      headers,
    });
    return response.json();
  },

  createRecord: async (modelName: string, data: any): Promise<ApiResponse<any>> => {
    const headers: any = {
      'Content-Type': 'application/json',
    };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${API_BASE_URL}/crud/${modelName}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return response.json();
  },

  updateRecord: async (modelName: string, id: number | string, data: any): Promise<ApiResponse<any>> => {
    const headers: any = {
      'Content-Type': 'application/json',
    };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${API_BASE_URL}/crud/${modelName}/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    return response.json();
  },

  deleteRecord: async (modelName: string, id: number | string): Promise<ApiResponse> => {
    const headers: any = {
      'Content-Type': 'application/json',
    };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${API_BASE_URL}/crud/${modelName}/${id}`, {
      method: 'DELETE',
      headers,
    });
    return response.json();
  },

  // Model Versioning
  getModelVersions: async (modelName: string): Promise<ApiResponse<any[]>> => {
    const response = await fetch(`${API_BASE_URL}/models/${modelName}/versions`);
    return response.json();
  },

  getModelVersion: async (modelName: string, version: number): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/models/${modelName}/versions/${version}`);
    return response.json();
  },

  // Hot Reload
  reloadModels: async (): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/models/reload`, {
      method: 'POST',
    });
    return response.json();
  },

  // Audit Logs
  getAuditLogs: async (filters?: {
    date?: string;
    action?: string;
    resourceType?: string;
    limit?: number;
  }): Promise<ApiResponse<any[]>> => {
    const params = new URLSearchParams();
    if (filters?.date) params.append('date', filters.date);
    if (filters?.action) params.append('action', filters.action);
    if (filters?.resourceType) params.append('resourceType', filters.resourceType);
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const url = `${API_BASE_URL}/models/audit-logs${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);
    return response.json();
  },

  // Export model as JSON file
  exportModel: (model: ModelDefinition): void => {
    const dataStr = JSON.stringify(model, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${model.name}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  // Import model from JSON file
  importModel: (): Promise<ModelDefinition> => {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      input.onchange = (e: any) => {
        const file = e.target?.files?.[0];
        if (!file) {
          reject(new Error('No file selected'));
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const model = JSON.parse(event.target?.result as string);
            resolve(model);
          } catch (error) {
            reject(new Error('Invalid JSON file'));
          }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      };
      
      input.click();
    });
  },
};
