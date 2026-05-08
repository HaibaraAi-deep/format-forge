import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConverterLayout } from '@/components/converter/ConverterLayout';

describe('ConverterLayout', () => {
  it('should render title and description', () => {
    render(
      <ConverterLayout title="测试工具" description="测试描述">
        <div>内容</div>
      </ConverterLayout>
    );
    expect(screen.getByText('测试工具')).toBeInTheDocument();
    expect(screen.getByText('测试描述')).toBeInTheDocument();
    expect(screen.getByText('内容')).toBeInTheDocument();
  });

  it('should render privacy notice', () => {
    render(
      <ConverterLayout title="工具" description="描述">
        <div />
      </ConverterLayout>
    );
    expect(screen.getByText(/浏览器本地处理/)).toBeInTheDocument();
  });
});
