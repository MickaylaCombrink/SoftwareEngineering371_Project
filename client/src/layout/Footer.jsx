import { Link } from 'react-router-dom';

const COLUMNS = [
  {
    heading: 'Shop',
    links: [
      { to: '/products', label: 'All fragrances' },
      { to: '/products?inStock=true', label: 'In stock' },
      { to: '/products?sort=price', label: 'Best value' },
    ],
  },
  {
    heading: 'Help',
    links: [
      { to: '/products', label: 'Delivery' },
      { to: '/products', label: 'Returns' },
      { to: '/contact', label: 'Contact' },
    ],
  },
  {
    heading: 'Account',
    links: [
      { to: '/login', label: 'Sign in' },
      { to: '/orders', label: 'My orders' },
    ],
  },
];

// `slim` renders the single-line variant used on checkout and confirmation.
export function Footer({ slim = false }) {
  const legal = (
    <div className="d-flex flex-column flex-sm-row justify-content-between gap-2 small">
      <span>© {new Date().getFullYear()} Scentigue · SEN371 student project</span>
      <span>Prices in ZAR, incl. VAT</span>
    </div>
  );

  if (slim) {
    return (
      <footer className="site-footer py-4">
        <div className="container-xxl">{legal}</div>
      </footer>
    );
  }

  return (
    <footer className="site-footer pt-5 pb-4">
      <div className="container-xxl">
        <div className="row g-4">
          <div className="col-12 col-lg-5">
            <div className="footer-brand fs-4">SCENTIGUE</div>
            <p className="mt-3 mb-0 small" style={{ maxWidth: '18rem' }}>
              Eau de parfum, honestly priced. Cape Town, South Africa.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <div className="col-6 col-md-4 col-lg" key={column.heading}>
              <div className="footer-heading mb-3">{column.heading}</div>
              <ul className="list-unstyled d-flex flex-column gap-2 mb-0 small">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <hr className="mt-5 mb-4" />
        {legal}
      </div>
    </footer>
  );
}
