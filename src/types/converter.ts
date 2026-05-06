export interface Converter<TInput, TOutput> {
  id: string;
  name: string;
  description: string;
  category: 'data' | 'encoding' | 'crypto' | 'color' | 'text' | 'binary';
  icon: string;
  path: string;
  convert: (input: TInput) => TOutput | Promise<TOutput>;
  validate?: (input: TInput) => string | null;
}

export interface ToolInfo {
  id: string;
  name: string;
  description: string;
  category: 'data' | 'encoding' | 'crypto' | 'color' | 'text' | 'binary';
  icon: string;
  path: string;
  keywords: string[];
}
