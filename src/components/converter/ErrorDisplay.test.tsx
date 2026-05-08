import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorDisplay } from '@/components/converter/ErrorDisplay';

describe('ErrorDisplay', () => {
  it('should display string error', () => {
    render(<ErrorDisplay error="出错了" />);
    expect(screen.getByText('出错了')).toBeInTheDocument();
  });

  it('should display error object with code', () => {
    render(<ErrorDisplay error={{ code: 'ERR_001', message: '解析失败' }} />);
    expect(screen.getByText(/ERR_001/)).toBeInTheDocument();
    expect(screen.getByText('解析失败')).toBeInTheDocument();
  });

  it('should display error with details', () => {
    render(<ErrorDisplay error={{ message: '错误', details: '详细信息' }} />);
    expect(screen.getByText('错误')).toBeInTheDocument();
    expect(screen.getByText('详细信息')).toBeInTheDocument();
  });
});
