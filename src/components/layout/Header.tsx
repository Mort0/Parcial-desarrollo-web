// Libraries
import { useState, useRef, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';

// Context
import { useTheme, THEMES } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

// Styles
import './layout.css';

const links = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/productos', label: 'Productos', end: false },
  { to: '/categorias', label: 'Categorías', end: false },
  { to: '/usuarios', label: 'Usuarios', end: false },
  { to: '/clientes', label: 'Clientes', end: false },
  { to: '/ordenes', label: 'Pedidos', end: false },
  { to: '/estados-orden', label: 'Estados de Orden', end: false },
  { to: '/informacion', label: 'Información', end: false },
];

/* ── Mini palette dropdown ─────────────────── */
function ThemeDropdown() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Cierra al click externo
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = THEMES.find((t) => t.id === theme)!;

  return (
    <div className="theme-dropdown" ref={ref}>
      <button
        className="theme-dropdown__trigger"
        onClick={() => setOpen((o) => !o)}
        aria-label="Cambiar tema"
        title="Cambiar paleta de colores"
      >
        <span className="theme-dropdown__swatches">
          {current.swatches.map((c, i) => (
            <span
              key={i}
              className="theme-dropdown__dot"
              style={{
                background: c,
                border:
                  c === '#ffffff' ? '1px solid rgba(255,255,255,0.3)' : 'none',
              }}
            />
          ))}
        </span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="currentColor"
          style={{ opacity: 0.6 }}
        >
          <path
            d="M1 3l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {open && (
        <div className="theme-dropdown__menu">
          <p className="theme-dropdown__heading">Paleta de colores</p>
          {THEMES.map((t) => (
            <button
              key={t.id}
              className={`theme-dropdown__item${theme === t.id ? ' is-active' : ''}`}
              onClick={() => {
                setTheme(t.id);
                setOpen(false);
              }}
            >
              <span className="theme-dropdown__item-swatches">
                {t.swatches.map((c, i) => (
                  <span
                    key={i}
                    className="theme-dropdown__item-dot"
                    style={{
                      background: c,
                      border: c === '#ffffff' ? '1px solid #e2e5ec' : 'none',
                    }}
                  />
                ))}
              </span>
              <span className="theme-dropdown__item-info">
                <strong>{t.label}</strong>
                <span>{t.description}</span>
              </span>
              {theme === t.id && (
                <span className="theme-dropdown__check">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Header + Navbar ───────────────────────── */
import { useCart } from '../../context/CartContext';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const { cartCount, toggleCart } = useCart();

  return (
    <>
      {/* ── Header ── */}
      <header className="app-header">
        <div className="container app-header__inner">
          <Link to="/" className="app-header__brand">
            <span className="app-header__logo">U</span>
            <span className="app-header__name">Unholy Store</span>
          </Link>

          <div className="app-header__right">
            <button
              className="app-header__cart-btn"
              onClick={toggleCart}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-text)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                fontSize: '1.25rem',
                marginRight: '0.5rem',
              }}
            >
              🛒
              {cartCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    background: 'var(--color-cta-bg)',
                    color: 'var(--color-cta-text)',
                    fontSize: '0.65rem',
                    fontWeight: 'bold',
                    padding: '2px 6px',
                    borderRadius: '10px',
                  }}
                >
                  {cartCount}
                </span>
              )}
            </button>

            <ThemeDropdown />
            <div className="app-header__divider" />

            <div className="app-header__user-info">
              <div className="app-header__session">
                <span className="app-header__username">
                  {user?.nombre || 'Invitado'}
                </span>
                {isAdmin && <span className="app-header__role">ADMIN</span>}
                <button
                  type="button"
                  className="app-header__logout"
                  onClick={logout}
                >
                  Cerrar sesión
                </button>
              </div>
              <div className="app-header__avatar">
                {user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'A'}
              </div>
            </div>

            <button
              className={`app-header__hamburger${menuOpen ? ' is-open' : ''}`}
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Menú"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      {/* ── Navbar ── */}
      <nav className="app-navbar" aria-label="Navegación principal">
        <div
          className={`container app-navbar__inner${menuOpen ? ' is-open' : ''}`}
        >
          {links
            .filter((l) => isAdmin || l.to !== '/usuarios')
            .map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `app-navbar__link${isActive ? ' app-navbar__link--active' : ''}`
                }
              >
                {l.to === '/ordenes' && !isAdmin ? 'Mis pedidos' : l.label}
              </NavLink>
            ))}
        </div>
      </nav>
    </>
  );
}
