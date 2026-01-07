import { createContext, useContext, useState, ReactNode } from 'react';
import { DatasetAnalysisResponse } from '@/services/api';

interface DatasetContextType {
  analysis: DatasetAnalysisResponse | null;
  setAnalysis: (analysis: DatasetAnalysisResponse | null) => void;
  datasetName: string | null;
  setDatasetName: (name: string | null) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
}

const DatasetContext = createContext<DatasetContextType | undefined>(undefined);

export function DatasetProvider({ children }: { children: ReactNode }) {
  const [analysis, setAnalysis] = useState<DatasetAnalysisResponse | null>(null);
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
