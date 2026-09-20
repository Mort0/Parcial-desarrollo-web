// Libraries
import { useEffect, useState } from 'react';

// Context
import { useAuth } from '../../../context/AuthContext';
import { useAlert } from '../../../context/AlertContext';

// Interfaces
import type { Orden, EstadoOrden } from '../../../interfaces';

// Repositories
import { ordenRepository } from '../../../respositories/orden.repository';
import { estadoOrdenRepository } from '../../../respositories/estadoOrden.repository';
import { isOrderOwnedByUser } from '../../../utils/orderDetail';

// Styles
import '../pages.css';

const today = new Date().toISOString().slice(0, 10);

const VACIO: Omit<Orden, 'id'> = {
  cliente: '',
  fecha: today,
  metodo_pago: '',
  total: 0,
  descuento: 0,
  detalle: '',
  estado_orden: '',
};

export function OrdenesPage() {
  const { isAdmin, user } = useAuth();
  const { showToast, showConfirm } = useAlert();
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [estados, setEstados] = useState<EstadoOrden[]>([]);
  const [form, setForm] = useState<Omit<Orden, 'id'>>(VACIO);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  async function cargar() {
    try {
      setCargando(true);
      const [ordenesData, estadosData] = await Promise.all([
        ordenRepository.getAll(),
        estadoOrdenRepository.getAll(),
      ]);
      setOrdenes(ordenesData);
      setEstados(estadosData);
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
        await ordenRepository.update(editandoId, form);
      } else {
        await ordenRepository.create(form);
      }
      setForm(VACIO);
      setEditandoId(null);
      await cargar();
      showToast('Guardado correctamente', 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Error al guardar', 'error');
    }
  }

  function handleEditar(o: Orden) {
    const { id, ...rest } = o;
    setForm(rest);
    setEditandoId(id);
  }

  function handleEliminar(id: string) {
    showConfirm({
      title: 'Confirmar eliminación',
      message: '¿Eliminar esta orden?',
      confirmText: 'Eliminar',
      onConfirm: async () => {
        try {
          await ordenRepository.remove(id);
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

  const visibles =
    isAdmin || !user
      ? ordenes
      : ordenes.filter((o) => isOrderOwnedByUser(o, user));

  return (
    <div className="page">
      <header className="page__header">
        <h1>{isAdmin ? 'Órdenes' : 'Historial de pedidos'}</h1>
        <p className="page__subtitle">
          {isAdmin
            ? 'Seguimiento y gestión de pedidos'
            : 'Pedidos asociados a tu usuario autenticado'}
        </p>
      </header>

      {/* Formulario */}
      {isAdmin && (
        <section className="card">
          <h2 className="card__title">
            {editandoId ? 'Editar orden' : 'Nueva orden'}
          </h2>

          <form className="form-grid" onSubmit={handleSubmit}>
            <label className="field">
              <span>Cliente</span>
              <input
                required
                value={form.cliente}
                onChange={(e) => setForm({ ...form, cliente: e.target.value })}
                placeholder="Nombre del cliente"
              />
            </label>

            <label className="field">
              <span>Fecha</span>
              <input
                type="date"
                required
                value={form.fecha}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
              />
            </label>

            <label className="field">
              <span>Método de pago</span>
              <input
                required
                value={form.metodo_pago}
                onChange={(e) =>
                  setForm({ ...form, metodo_pago: e.target.value })
                }
                placeholder="Ej. Tarjeta, Efectivo"
              />
            </label>

            <label className="field">
              <span>Total ($)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={form.total}
                onChange={(e) =>
                  setForm({ ...form, total: Number(e.target.value) })
                }
              />
            </label>

            <label className="field">
              <span>Descuento ($)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.descuento}
                onChange={(e) =>
                  setForm({ ...form, descuento: Number(e.target.value) })
                }
              />
            </label>

            <label className="field">
              <span>Estado de orden</span>
              <input
                value={form.estado_orden}
                onChange={(e) =>
                  setForm({ ...form, estado_orden: e.target.value })
                }
                placeholder="Ej. Pendiente, Enviado"
              />
            </label>

            <label className="field" style={{ gridColumn: '1 / -1' }}>
              <span>Detalle</span>
              <input
                value={form.detalle}
                onChange={(e) => setForm({ ...form, detalle: e.target.value })}
                placeholder="Descripción del pedido"
              />
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
        <h2 className="card__title">Listado ({visibles.length})</h2>

        {cargando && <p className="muted">Cargando...</p>}

        {!cargando && visibles.length === 0 && (
          <div className="empty-state">
            <p>
              {isAdmin
                ? 'No hay órdenes registradas.'
                : 'Aún no tienes pedidos en tu historial.'}
            </p>
          </div>
        )}

        {visibles.length > 0 && (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Comprador</th>
                  <th>Fecha</th>
                  <th>Detalle</th>
                  <th>Método pago</th>
                  <th>Total</th>
                  <th>Estado</th>
                  {isAdmin && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {visibles.map((o) => {
                  const estadoInfo = estados.find(
                    (e) =>
                      e.nombre.toLowerCase() ===
                      (o.estado_orden || '').toLowerCase(),
                  );
                  const badgeColor =
                    estadoInfo?.color || 'var(--color-primary)';

                  return (
                    <tr key={o.id}>
                      <td>
                        <strong>{o.cliente}</strong>
                      </td>
                      <td>{o.fecha}</td>
                      <td className="table__detail">{o.detalle || '—'}</td>
                      <td>
                        {o.metodo_pago || <span className="muted">—</span>}
                      </td>
                      <td>${Number(o.total).toFixed(2)}</td>
                      <td>
                        {o.estado_orden ? (
                          <span
                            className="badge"
                            style={{
                              background: badgeColor,
                              color: '#fff',
                              textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                            }}
                          >
                            {o.estado_orden}
                          </span>
                        ) : (
                          <span className="muted">—</span>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="table__actions">
                          <>
                            <button
                              className="btn btn--sm"
                              onClick={() => handleEditar(o)}
                            >
                              Editar
                            </button>
                            <button
                              className="btn btn--sm btn--danger"
                              onClick={() => handleEliminar(o.id)}
                            >
                              Eliminar
                            </button>
                          </>
                        </td>
                      )}
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
