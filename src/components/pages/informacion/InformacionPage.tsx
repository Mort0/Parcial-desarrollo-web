// Libraries
import { useEffect, useState } from 'react';

// Context
import { useAuth } from '../../../context/AuthContext';
import { useAlert } from '../../../context/AlertContext';
import { useInformation } from '../../../context/InformationContext';

// Interfaces
import type { Information } from '../../../interfaces';

// Repositories
import { informationRepository } from '../../../respositories/information.repository';

// Styles
import '../pages.css';

const VACIO: Omit<Information, 'id'> = {
  nombre: '',
  telefono: '',
  direccion: '',
  horario: '',
  mision: '',
  vision: '',
};

function toForm(info: Information): Omit<Information, 'id'> {
  return {
    nombre: info.nombre || '',
    telefono: info.telefono || '',
    direccion: info.direccion || '',
    horario: info.horario || '',
    mision: info.mision || '',
    vision: info.vision || '',
  };
}

export function InformacionPage() {
  const { isAdmin } = useAuth();
  const { showToast, showConfirm } = useAlert();
  const { registros, reload } = useInformation();
  const [form, setForm] = useState<Omit<Information, 'id'>>(VACIO);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  async function cargar() {
    try {
      setCargando(true);
      await reload();
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
        await informationRepository.update(editandoId, form);
      } else {
        await informationRepository.create(form);
      }
      setForm(VACIO);
      setEditandoId(null);
      await cargar();
      showToast('Guardado correctamente', 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Error al guardar', 'error');
    }
  }

  function handleEditar(info: Information) {
    setForm(toForm(info));
    setEditandoId(info.id);
  }

  function handleEliminar(id: string) {
    showConfirm({
      title: 'Confirmar eliminación',
      message: '¿Eliminar este registro?',
      confirmText: 'Eliminar',
      onConfirm: async () => {
        try {
          await informationRepository.remove(id);
          await cargar();
          showToast('Registro eliminado exitosamente', 'success');
        } catch (e) {
          showToast(
            e instanceof Error ? e.message : 'Error al eliminar',
            'error',
          );
        }
      },
    });
  }

  function handleCancelar() {
    setForm(VACIO);
    setEditandoId(null);
  }

  return (
    <div className="page">
      <header className="page__header">
        <h1>Información institucional</h1>
        <p className="page__subtitle">
          Misión, visión, contacto y datos de la empresa cargados desde el Mock
          API
        </p>
      </header>

      {!cargando && registros.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          {registros.map((info) => (
            <div
              key={info.id}
              className="card"
              style={{
                marginBottom: 0,
                borderLeft: '4px solid var(--color-secondary)',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-title)',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  color: 'var(--color-primary)',
                  marginBottom: '0.75rem',
                }}
              >
                {info.nombre}
              </p>
              {info.mision && (
                <p className="info-block">
                  <strong>Misión.</strong> {info.mision}
                </p>
              )}
              {info.vision && (
                <p className="info-block">
                  <strong>Visión.</strong> {info.vision}
                </p>
              )}
              <p className="info-meta">{info.telefono || '—'}</p>
              <p className="info-meta">{info.direccion || '—'}</p>
              <p className="info-meta" style={{ marginBottom: '0.75rem' }}>
                {info.horario || '—'}
              </p>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {isAdmin && (
                  <>
                    <button
                      className="btn btn--sm"
                      onClick={() => handleEditar(info)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn--sm btn--danger"
                      onClick={() => handleEliminar(info.id)}
                    >
                      Eliminar
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isAdmin && (
        <section className="card">
          <h2 className="card__title">
            {editandoId ? 'Editar información' : 'Agregar información'}
          </h2>

          <form className="form-grid" onSubmit={handleSubmit}>
            <label className="field">
              <span>Nombre de la tienda</span>
              <input
                required
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Ej. Unholy Store"
              />
            </label>

            <label className="field">
              <span>Teléfono</span>
              <input
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                placeholder="+57 300 000 0000"
              />
            </label>

            <label className="field">
              <span>Dirección</span>
              <input
                value={form.direccion}
                onChange={(e) =>
                  setForm({ ...form, direccion: e.target.value })
                }
                placeholder="Calle, ciudad"
              />
            </label>

            <label className="field">
              <span>Horario</span>
              <input
                value={form.horario}
                onChange={(e) => setForm({ ...form, horario: e.target.value })}
                placeholder="Lun - Sáb: 9am - 7pm"
              />
            </label>

            <label className="field" style={{ gridColumn: '1 / -1' }}>
              <span>Misión</span>
              <textarea
                rows={3}
                value={form.mision}
                onChange={(e) => setForm({ ...form, mision: e.target.value })}
                placeholder="Misión de la empresa"
              />
            </label>

            <label className="field" style={{ gridColumn: '1 / -1' }}>
              <span>Visión</span>
              <textarea
                rows={3}
                value={form.vision}
                onChange={(e) => setForm({ ...form, vision: e.target.value })}
                placeholder="Visión de la empresa"
              />
            </label>

            <div className="form-actions">
              <button type="submit" className="btn btn--primary">
                {editandoId ? 'Actualizar' : 'Guardar'}
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

      {cargando && <p className="muted">Cargando...</p>}
      {!cargando && registros.length === 0 && (
        <div className="empty-state">
          <p>No hay información registrada. Agrega los datos de la tienda.</p>
        </div>
      )}
    </div>
  );
}
