import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Footer from './Footer';

function renderFooter() {
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>
  );
}

describe('Footer', () => {
  it('renders the brand and shop links', () => {
    renderFooter();
    expect(screen.getAllByText(/cent/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: /all products/i })).toHaveAttribute('href', '/products');
  });

  it('renders account and contact sections', () => {
    renderFooter();
    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByText('Visit Us')).toBeInTheDocument();
  });

  it('includes the copyright line', () => {
    renderFooter();
    const year = new Date().getFullYear();
    expect(screen.getByText(new RegExp(String(year)))).toBeInTheDocument();
  });
});