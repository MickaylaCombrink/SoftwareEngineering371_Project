import { describe, test, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductImage } from './ProductImage';

// Component test: the real component in a real DOM, with only its props faked.

const withImage = {
  productName: 'Lattafa Queen of Arabia',
  image: ['/images/lattafa-queen-of-arabia.webp'],
};

const withoutImage = { productName: 'Velvet Oud', image: [] };

describe('ProductImage', () => {
  test('renders the product photo when one is given', () => {
    render(<ProductImage product={withImage} />);

    const img = screen.getByRole('img', { name: 'Lattafa Queen of Arabia' });
    expect(img).toHaveAttribute('src', '/images/lattafa-queen-of-arabia.webp');
  });

  test('falls back to the drawn bottle when the product has no image', () => {
    const { container } = render(<ProductImage product={withoutImage} />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  test('falls back when the image fails to load', () => {
    // The real case: the path is in the database but the file is missing.
    const { container } = render(<ProductImage product={withImage} />);

    fireEvent.error(screen.getByRole('img'));

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  test('a new product gets a fresh chance to load', () => {
    const { rerender, container } = render(<ProductImage product={withImage} />);
    fireEvent.error(screen.getByRole('img'));
    expect(container.querySelector('svg')).toBeInTheDocument();

    rerender(
      <ProductImage product={{ productName: 'Другой', image: ['/images/other.webp'] }} />
    );

    // Without the reset, one broken image would poison every later product
    expect(screen.getByRole('img')).toHaveAttribute('src', '/images/other.webp');
  });

  test('the drawn bottle is hidden from assistive technology', () => {
    const { container } = render(<ProductImage product={withoutImage} />);

    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});
