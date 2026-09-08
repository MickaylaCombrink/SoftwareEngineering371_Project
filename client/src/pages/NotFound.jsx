import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[65vh] flex flex-col items-center justify-center px-4 text-center">
      <p className="eyebrow mb-3">The page has vanquished</p>
      <h1 className="font-display text-8xl text-gold-3 mb-4">404</h1>
      <h2 className="font-display text-2xl text-ink mb-2">Page Not Found</h2>
      <p className="text-ink/55 mb-8">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-gold text-base">
        Go Home
      </Link>
    </div>
  );
}