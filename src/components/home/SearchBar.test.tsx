import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBar } from '@/components/home/SearchBar';

describe('SearchBar', () => {
  it('should render with placeholder', () => {
    render(<SearchBar value="" onChange={() => {}} placeholder="搜索..." />);
    expect(screen.getByLabelText('搜索工具')).toBeInTheDocument();
  });

  it('should call onChange on input', () => {
    const handleChange = vi.fn();
    render(<SearchBar value="" onChange={handleChange} />);
    fireEvent.change(screen.getByLabelText('搜索工具'), { target: { value: 'json' } });
    expect(handleChange).toHaveBeenCalledWith('json');
  });

  it('should show clear button when value is present', () => {
    render(<SearchBar value="test" onChange={() => {}} />);
    expect(screen.getByLabelText('清除搜索')).toBeInTheDocument();
  });

  it('should not show clear button when empty', () => {
    render(<SearchBar value="" onChange={() => {}} />);
    expect(screen.queryByLabelText('清除搜索')).not.toBeInTheDocument();
  });

  it('should clear value on clear button click', () => {
    const handleChange = vi.fn();
    render(<SearchBar value="test" onChange={handleChange} />);
    fireEvent.click(screen.getByLabelText('清除搜索'));
    expect(handleChange).toHaveBeenCalledWith('');
  });
});
