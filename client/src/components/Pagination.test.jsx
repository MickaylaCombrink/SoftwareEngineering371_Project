import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from './Pagination';

describe('Pagination', () => {
  it('renders nothing for a single page', () => {
    const { container } = render(<Pagination page={1} pages={1} onPage={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders page numbers and honours the current page', () => {
    render(<Pagination page={2} pages={5} onPage={vi.fn()} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go to page 2' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Go to page 5' })).toBeInTheDocument();
  });

  it('calls onPage when a page number is clicked', () => {
    const onPage = vi.fn();
    render(<Pagination page={1} pages={3} onPage={onPage} />);
    fireEvent.click(screen.getByRole('button', { name: 'Go to page 3' }));
    expect(onPage).toHaveBeenCalledWith(3);
  });

  it('disables prev on the first page and next on the last', () => {
    render(<Pagination page={1} pages={3} onPage={vi.fn()} />);
    expect(screen.getByRole('button', { name: /prev/i })).toBeDisabled();
  });

  it('disables next on the last page', () => {
    render(<Pagination page={3} pages={3} onPage={vi.fn()} />);
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
  });
});