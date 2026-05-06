export interface ConversionResult<T> {
  success: true;
  data: T;
  meta?: { processingTime: number; inputSize: number; outputSize: number };
}

export interface ConversionError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string;
    line?: number;
    column?: number;
  };
}

export type Result<T> = ConversionResult<T> | ConversionError;
