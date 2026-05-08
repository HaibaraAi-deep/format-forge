import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConversionStats } from '@/components/converter/ConversionStats';

describe('ConversionStats', () => {
  it('should render nothing when no stats', () => {
    const { container } = render(<ConversionStats />);
    expect(container.innerHTML).toBe('');
  });

  it('should display processing time', () => {
    render(<ConversionStats processingTime={150} />);
    expect(screen.getByText(/150/)).toBeInTheDocument();
  });

  it('should display size info', () => {
    render(<ConversionStats inputSize={1024} outputSize={512} />);
    expect(screen.getByText(/1\.0 KB/)).toBeInTheDocument();
    expect(screen.getByText(/512 B/)).toBeInTheDocument();
  });

  it('should display compression ratio', () => {
    render(<ConversionStats inputSize={1000} outputSize={500} processingTime={10} />);
    expect(screen.getByText(/50%/)).toBeInTheDocument();
  });
});
