// Libraries
import { useEffect, useState } from 'react';

// Interfaces
import type { Producto } from '../../../interfaces';

// Repositories
import { productoRepository } from '../../../respositories/producto.repository';

// Utils
import { getProductFallbackImage } from '../../../utils/productImage';

// Context
import { useAuth } from '../../../context/AuthContext';
import { useAlert } from '../../../context/AlertContext';
import { useCart } from '../../../context/CartContext';

// Styles
import '../pages.css';

const VACIO: Omit<Producto, 'id'> = {
  nombre: '',
  descripcion: '',
  stock: 0,
  imagen: '',
  precio: 0,
  categoria: '',
  estado: true,
};

export function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [form, setForm] = useState<Omit<Producto, 'id'>>(VACIO);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const { addToCart } = useCart();
  const { isAdmin } = useAuth();
  const { showToast, showConfirm } = useAlert();

  async function cargar() {
    try {
      setCargando(true);
      const data = await productoRepository.getAll();
      setProductos(data);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Error al cargar', 'error');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      if (editandoId) {
        await productoRepository.update(editandoId, form);
      } else {
        await productoRepository.create(form);
      }
      setForm(VACIO);
      setEditandoId(null);
      await cargar();
      showToast('Guardado correctamente', 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Error al guardar', 'error');
    }
  }

  function handleEditar(p: Producto) {
    const { id, ...rest } = p;
    setForm(rest);
    setEditandoId(id);
  }

  function handleEliminar(id: string) {
    showConfirm({
      title: 'Confirmar eliminación',
      message: '¿Eliminar este producto?',
      confirmText: 'Eliminar',
      onConfirm: async () => {
        try {
          await productoRepository.remove(id);
          await cargar();
          showToast('Registro eliminado exitosamente', 'success');
        } catch (e) {
          showToast(e instanceof Error ? e.message : 'Error al eliminar', 'error');
        }
      }
    });
  }

  function handleCancelar() {
    setForm(VACIO);
    setEditandoId(null);
  }

  return (
    <div className="page">
      <header className="page__header">
        <h1>Productos</h1>
        <p className="page__subtitle">Gestiona el catálogo de la tienda</p>
      </header>

      {/* Formulario */}
      {isAdmin && (
        <section className="card">
          <h2 className="card__title">
            {editandoId ? 'Editar producto' : 'Nuevo producto'}
          </h2>

          <form className="form-grid" onSubmit={handleSubmit}>
            <label className="field">
              <span>Nombre</span>
              <input
                required
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              />
            </label>

            <label className="field">
              <span>Descripción</span>
              <input
                required
                value={form.descripcion}
                onChange={(e) =>
                  setForm({ ...form, descripcion: e.target.value })
                }
              />
            </label>

            <label className="field">
              <span>Precio</span>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={form.precio}
                onChange={(e) =>
                  setForm({ ...form, precio: Number(e.target.value) })
                }
              />
            </label>

            <label className="field">
              <span>Stock</span>
              <input
                type="number"
                min="0"
                required
                value={form.stock}
                onChange={(e) =>
                  setForm({ ...form, stock: Number(e.target.value) })
                }
              />
            </label>

            <label className="field">
              <span>Categoría</span>
              <input
                required
                value={form.categoria}
                onChange={(e) =>
                  setForm({ ...form, categoria: e.target.value })
                }
              />
            </label>

            <label className="field">
              <span>URL de imagen</span>
              <input
                value={form.imagen}
                onChange={(e) => setForm({ ...form, imagen: e.target.value })}
              />
            </label>

            <label className="field field--check">
              <input
                type="checkbox"
                checked={form.estado}
                onChange={(e) => setForm({ ...form, estado: e.target.checked })}
              />
              <span>Activo</span>
            </label>

            <div className="form-actions">
              <button type="submit" className="btn btn--primary">
                {editandoId ? 'Actualizar' : 'Crear'}
              </button>
              {editandoId && (
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={handleCancelar}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>
      )}

      {/* Listado */}
      <section className="card">
        <h2 className="card__title">Listado ({productos.length})</h2>

        {cargando && <p>Cargando...</p>}

        {!cargando && productos.length === 0 && (
          <p className="muted">Aún no hay productos.</p>
        )}

        {productos.length > 0 && (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((p) => {
                  const fallback = getProductFallbackImage(
                    p.nombre,
                    p.categoria,
                  );
                  return (
                    <tr key={p.id}>
                      <td>
                        <img
                          src={p.imagen || fallback}
                          alt={p.nombre}
                          className="table__thumb"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            if (img.src !== fallback) img.src = fallback;
                          }}
                        />
                      </td>
                      <td>{p.nombre}</td>
                      <td>{p.categoria}</td>
                      <td>${p.precio.toFixed(2)}</td>
                      <td>{p.stock}</td>
                      <td>
                        <span
                          className={
                            p.estado ? 'badge badge--ok' : 'badge badge--off'
                          }
                        >
                          {p.estado ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td
                        className="table__actions"
                        style={{
                          display: 'flex',
                          padding: '11%',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <button
                          className="btn btn--sm btn--primary"
                          onClick={() => {
                            addToCart(p);
                            showToast(
                              `${p.nombre} añadido al carrito`,
                              'success',
                            );
                          }}
                        >
                          + Carrito
                        </button>
                        {isAdmin && (
                          <>
                            <button
                              className="btn btn--sm"
                              onClick={() => handleEditar(p)}
                            >
                              Editar
                            </button>
                            <button
                              className="btn btn--sm btn--danger"
                              onClick={() => handleEliminar(p.id)}
                            >
                              Eliminar
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
