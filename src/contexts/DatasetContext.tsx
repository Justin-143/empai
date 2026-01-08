import { createContext, useContext, useState, ReactNode } from 'react';

interface DatasetAnalysis {
  summary: {
    total_employees: number;
    avg_performance: number;
    avg_satisfaction: number;
    departments: string[];
    risk_distribution: {
      low: number;
      medium: number;
      high: number;
    };
  };
  department_stats: Array<{
    department: string;
    count: number;
    avg_performance: number;
    avg_satisfaction: number;
    avg_salary: number;
  }>;
  performance_distribution: Array<{
    range: string;
    count: number;
  }>;
  feature_correlations: Array<{
    feature: string;
    correlation: number;
  }>;
  predictions: Array<{
    employee_id: number;
    predicted_performance: number;
    risk_level: string;
    confidence: number;
  }>;
  trends: {
    monthly_performance: Array<{ month: string; performance: number }>;
    department_comparison: Array<{ department: string; performance: number }>;
  };
}

interface DatasetContextType {
  analysis: DatasetAnalysis | null;
  setAnalysis: (analysis: DatasetAnalysis | null) => void;
  datasetName: string | null;
  setDatasetName: (name: string | null) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
}

const DatasetContext = createContext<DatasetContextType | undefined>(undefined);

export function DatasetProvider({ children }: { children: ReactNode }) {
  const [analysis, setAnalysis] = useState<DatasetAnalysis | null>(null);
  const [datasetName, setDatasetName] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  return (
    <DatasetContext.Provider value={{ 
      analysis, 
      setAnalysis, 
      datasetName, 
      setDatasetName,
      isAnalyzing,
      setIsAnalyzing
    }}>
      {children}
    </DatasetContext.Provider>
  );
}

export function useDataset() {
  const context = useContext(DatasetContext);
  if (context === undefined) {
    throw new Error('useDataset must be used within a DatasetProvider');
  }
  return context;
}
