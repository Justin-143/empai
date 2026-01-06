// Centralized API service for ML backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://palaced-sharonda-thirtypenny.ngrok-free.dev';

export interface PredictRequest {
  Age: number;
  Gender: string;
  Department: string;
  Education_Level: string;
  Years_At_Company: number;
  Monthly_Salary: number;
  Work_Hours_Per_Week: number;
  Projects_Handled: number;
  Overtime_Hours: number;
  Sick_Days: number;
  Remote_Work_Frequency: string;
  Team_Size: number;
  Training_Hours: number;
  Promotions: number;
  Employee_Satisfaction_Score: number;
  Job_Title: string;
}

export interface PredictResponse {
  performance_score: number;
  confidence: number;
  probabilities: {
    low: number;
    medium: number;
    high: number;
  };
  risk_level: 'Low' | 'Medium' | 'High';
  recommendations: string[];
}

export interface HealthResponse {
  status: string;
  model_loaded: boolean;
  version?: string;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error (${response.status}): ${errorText || response.statusText}`);
    }

    return response.json();
  }

  async healthCheck(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/api/health', {
      method: 'GET',
    });
  }

  async predict(data: PredictRequest): Promise<PredictResponse> {
    return this.request<PredictResponse>('/api/predict', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getFeatureImportance(): Promise<FeatureImportance[]> {
    return this.request<FeatureImportance[]>('/api/feature-importance', {
      method: 'GET',
    });
  }
}

export const apiService = new ApiService();
