import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-ink text-cream/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <p className="eyebrow mb-2">Belgium</p>
            <p className="font-display text-2xl text-cream mb-3">Scent</p>
            <p className="text-sm leading-relaxed text-cream/60">
              A curated boutique of rare and beautiful perfumes.
              Find the fragrance that tells your story.
            </p>
          </div>

          <div>
            <h4 className="text-cream font-display text-lg mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="hover:text-gold-2 transition-colors">All Products</Link></li>
              <li><Link to="/products?category=new" className="hover:text-gold-2 transition-colors">New Arrivals</Link></li>
              <li><Link to="/cart" className="hover:text-gold-2 transition-colors">My Cart</Link></li>
              <li><Link to="/orders" className="hover:text-gold-2 transition-colors">My Orders</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-cream font-display text-lg mb-4">Account</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="hover:text-gold-2 transition-colors">Sign In</Link></li>
              <li><Link to="/register" className="hover:text-gold-2 transition-colors">Create Account</Link></li>
              <li><Link to="/profile" className="hover:text-gold-2 transition-colors">My Profile</Link></li>
              <li><Link to="/admin" className="hover:text-gold-2 transition-colors">Admin</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-cream font-display text-lg mb-4">Visit Us</h4>
            <ul className="space-y-2 text-sm text-cream/60">
              <li className="flex items-start gap-2">
                <span className="text-gold mt-0.5">&#9679;</span>
                <span>138 Berg Avenue<br />Pretoria, South Africa</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gold">&#9990;</span>
                <span>+27 68 550 0830</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gold">&#9993;</span>
                <span>mthi6223@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-cream/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-cream/50">
          <p>&copy; {new Date().getFullYear()} Scent. All rights reserved.</p>
          <p className="tracking-[0.25em] uppercase">Authentic fragrances &middot; Curated with care</p>
        </div>
      </div>
    </footer>
  );
}