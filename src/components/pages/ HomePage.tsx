// Libraries
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// Interfaces
import type { Producto, Categoria, Cliente } from '../../interfaces';

// Repositories
import { productoRepository } from '../../respositories/producto.repository';
import { categoriaRepository } from '../../respositories/categoria.repository';
import { clienteRepository } from '../../respositories/cliente.repository';

// Utils
import { getProductFallbackImage } from '../../utils/productImage';
import { useCart } from '../../context/CartContext';
import { useAlert } from '../../context/AlertContext';

// Styles
import './pages.css';

type GroupedProductos = Record<string, Producto[]>;

function groupByCategoria(productos: Producto[]): GroupedProductos {
  return productos.reduce<GroupedProductos>((acc, p) => {
    const cat = p.categoria || 'Sin categoría';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});
}

export function HomePage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cargando, setCargando] = useState(true);
  const { addToCart } = useCart();
  const { showToast } = useAlert();

  useEffect(() => {
    async function cargar() {
      try {
        const [prods, cats, clients] = await Promise.all([
          productoRepository.getAll(),
          categoriaRepository.getAll(),
          clienteRepository.getAll(),
        ]);
        setProductos(prods);
        setCategorias(cats);
        setClientes(clients);
      } catch (_) {
        // silencioso — la sección simplemente no mostrará datos
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  const grupos = groupByCategoria(productos);
  const categoriasConProductos = Object.entries(grupos);

  return (
    <div>
      {/* ── Hero ─────────────────────────────── */}
      <section className="home-hero">
        <div className="home-hero__content">
          <span className="home-hero__label">✦ Bienvenido al panel</span>
          <h1>
            Unholy Store
            <br />
            Admin Dashboard
          </h1>
          <p className="home-hero__sub">
            Gestiona tu catálogo, clientes y órdenes desde un solo lugar.
            Diseñado para moverse rápido.
          </p>
          <div className="home-hero__actions">
            <Link to="/productos">
              <button className="home-hero__btn home-hero__btn--primary">
                Ver productos
              </button>
            </Link>
            <Link to="/ordenes">
              <button className="home-hero__btn home-hero__btn--outline">
                Ver órdenes
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────── */}
      <section className="home-stats">
        <div className="home-stat">
          <span className="home-stat__icon">📦</span>
          <div className="home-stat__value">
            {cargando ? '—' : productos.length}
          </div>
          <div className="home-stat__label">Productos</div>
        </div>
        <div className="home-stat">
          <span className="home-stat__icon">🏷️</span>
          <div className="home-stat__value">
            {cargando ? '—' : categorias.length}
          </div>
          <div className="home-stat__label">Categorías</div>
        </div>
        <div className="home-stat">
          <span className="home-stat__icon">🧑‍🤝‍🧑</span>
          <div className="home-stat__value">
            {cargando ? '—' : clientes.length}
          </div>
          <div className="home-stat__label">Clientes</div>
        </div>
        <div className="home-stat">
          <span className="home-stat__icon">✅</span>
          <div className="home-stat__value">
            {cargando ? '—' : productos.filter((p) => p.estado).length}
          </div>
          <div className="home-stat__label">Activos</div>
        </div>
      </section>

      {/* ── Productos por categoría ───────────── */}
      {cargando ? (
        <p className="muted">Cargando catálogo...</p>
      ) : categoriasConProductos.length === 0 ? (
        <p className="muted">No hay productos disponibles.</p>
      ) : (
        <>
          <h2 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)' }}>
            Destacados por categoría
          </h2>

          {categoriasConProductos.map(([categoria, items]) => {
            const muestra = items.slice(0, 2);
            return (
              <section key={categoria} className="home-section">
                <div className="home-section__header">
                  <h3 className="home-section__title">{categoria}</h3>
                  <span className="home-section__cat-label">
                    📦 {items.length} producto{items.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="product-grid">
                  {muestra.map((p) => {
                    const fallback = getProductFallbackImage(
                      p.nombre,
                      p.categoria,
                    );
                    return (
                      <div key={p.id} className="product-card">
                        <img
                          src={p.imagen || fallback}
                          alt={p.nombre}
                          className="product-card__img"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            if (img.src !== fallback) img.src = fallback;
                          }}
                        />
                        <div className="product-card__body">
                          <p className="product-card__cat">{p.categoria}</p>
                          <p className="product-card__name">{p.nombre}</p>
                          <p className="product-card__stock">
                            {p.stock} en stock
                          </p>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginTop: '0.5rem',
                            }}
                          >
                            <p
                              className="product-card__price"
                              style={{ margin: 0 }}
                            >
                              ${p.precio.toFixed(2)}
                            </p>
                            <button
                              className="home-hero__btn home-hero__btn--primary"
                              style={{
                                padding: '0.4rem 0.8rem',
                                fontSize: '0.85rem',
                              }}
                              onClick={() => {
                                addToCart(p);
                                showToast(
                                  `${p.nombre} añadido al carrito`,
                                  'success',
                                );
                              }}
                            >
                              + Añadir
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </>
      )}
    </div>
  );
}
