// Libraries
import { Link } from 'react-router-dom';

// Context
import { useInformation } from '../../context/InformationContext';

// Styles
import './Layout.css';

const col1 = [
  { to: '/productos', label: 'Productos' },
  { to: '/categorias', label: 'Categorías' },
  { to: '/clientes', label: 'Clientes' },
  { to: '/ordenes', label: 'Órdenes' },
];

const col2 = [
  { to: '/usuarios', label: 'Usuarios' },
  { to: '/estados-orden', label: 'Estados de Orden' },
  { to: '/informacion', label: 'Información' },
];

export function Footer() {
  const year = new Date().getFullYear();
  const { empresa, registros, loading } = useInformation();

  const nombre = empresa?.nombre || 'Unholy Store';
  const mision = empresa?.mision;
  const vision = empresa?.vision;
  const contactos = registros.filter(
    (item) => item.telefono || item.direccion || item.horario,
  );

  return (
    <footer className="ft">
      <div className="ft__body container">
        <div className="ft__brand">
          <div className="ft__logo-row">
            <span className="ft__logo">{nombre.charAt(0).toUpperCase()}</span>
            <span className="ft__name">{nombre}</span>
          </div>
          {loading ? (
            <p className="ft__desc">Cargando información institucional...</p>
          ) : (
            <>
              {mision && (
                <div className="ft__institutional">
                  <p className="ft__heading">Misión</p>
                  <p className="ft__desc">{mision}</p>
                </div>
              )}
              {vision && (
                <div className="ft__institutional">
                  <p className="ft__heading">Visión</p>
                  <p className="ft__desc">{vision}</p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="ft__col">
          <p className="ft__heading">Tienda</p>
          <ul className="ft__list">
            {col1.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="ft__lnk">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="ft__col">
          <p className="ft__heading">Administración</p>
          <ul className="ft__list">
            {col2.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="ft__lnk">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="ft__col">
          <p className="ft__heading">Contacto</p>
          <ul className="ft__list">
            {contactos.length === 0 && !loading && (
              <li className="ft__contact">
                <span className="ft__ct">Sin datos de contacto</span>
              </li>
            )}
            {contactos.map((info) => (
              <li key={info.id} className="ft__contact-block">
                <span className="ft__contact-name">{info.nombre}</span>
                {info.telefono && (
                  <span className="ft__ct">{info.telefono}</span>
                )}
                {info.direccion && (
                  <span className="ft__ct">{info.direccion}</span>
                )}
                {info.horario && <span className="ft__ct">{info.horario}</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="ft__bar container">
        <p className="ft__copy">
          © {year} {nombre}. Todos los derechos reservados.
        </p>
        <div className="ft__legal">
          <Link to="/informacion" className="ft__legal-lnk">
            Información institucional
          </Link>
        </div>
      </div>
    </footer>
  );
}
