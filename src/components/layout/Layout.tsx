// Libraries
import { Outlet } from 'react-router-dom';

// Components — Navbar integrado en Header
import { Header } from './Header';
import { Footer } from './Footer';
import { CartDrawer } from './CartDrawer';

// Styles
import './Layout.css';

export function Layout() {
  return (
    <div className="app-shell">
      <Header />
      <CartDrawer />
      <main className="app-main">
        <div className="container">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}
