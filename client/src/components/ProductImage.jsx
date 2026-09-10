import { useState, useEffect } from 'react';
import { Bottle } from './Bottle';

// Product images are external URLs from the seed data, so any of them can be
// unreachable — a blocked host, an offline placeholder service, a dead link.
// When the browser fails to load one we fall back to the drawn bottle rather
// than leaving a broken-image icon and its alt text on the page.
export function ProductImage({ product, size = 110, className = '' }) {
  const url = product?.image?.[0] || null;
  const [failed, setFailed] = useState(false);

  // A new product means a new URL, so give it a fresh chance to load
  useEffect(() => {
    setFailed(false);
  }, [url]);

  return (
    <div className={`bottle ${className}`.trim()}>
      {url && !failed ? (
        <img
          src={url}
          alt={product.productName}
          onError={() => setFailed(true)}
          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
        />
      ) : (
        <Bottle seed={product?.productName || ''} size={size} />
      )}
    </div>
  );
}
