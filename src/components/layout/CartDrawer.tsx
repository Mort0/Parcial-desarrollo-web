// Libraries
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Context
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';

// Repositories
import { ordenRepository } from '../../respositories/orden.repository';

// Utils
import { getProductFallbackImage } from '../../utils/productImage';
import { buildOrderDetalle } from '../../utils/orderDetail';

// Styles
import './cart.css';

interface OrderSummary {
  id: string;
  fecha: string;
  total: number;
  estado: string;
  comprador: string;
  detalle: string;
  items: { nombre: string; quantity: number; precio: number }[];
}

export function CartDrawer() {
  const {
    cart,
    isCartOpen,
    toggleCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
  } = useCart();
  const { user } = useAuth();
  const { showToast } = useAlert();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [metodoPago, setMetodoPago] = useState('Tarjeta');
  const [summary, setSummary] = useState<OrderSummary | null>(null);

  useEffect(() => {
    if (cart.length > 0) setSummary(null);
  }, [cart.length]);

  const handleClose = () => {
    if (isCartOpen) toggleCart();
  };

  const handleCheckout = async () => {
    if (!user) {
      showToast('Debes iniciar sesión para finalizar la compra', 'error');
      return;
    }
    if (cart.length === 0) return;

    setLoading(true);
    try {
      const detalle = buildOrderDetalle(cart);
      const fecha = new Date().toISOString().slice(0, 10);
      const items = cart.map((item) => ({
        nombre: item.producto.nombre,
        quantity: item.quantity,
        precio: item.producto.precio,
      }));

      const orden = await ordenRepository.create({
        cliente: user.nombre,
        usuarioId: user.id,
        fecha,
        metodo_pago: metodoPago,
        total: cartTotal,
        descuento: 0,
        detalle,
        estado_orden: 'Pendiente',
      });

      setSummary({
        id: orden.id,
        fecha,
        total: cartTotal,
        estado: 'Pendiente',
        comprador: user.nombre,
        detalle,
        items,
      });
      clearCart();
      showToast('Pedido confirmado. Revisa el resumen de tu orden.', 'success');
    } catch (error) {
      showToast('Error al crear la orden', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`cart-overlay ${isCartOpen ? 'is-open' : ''}`}
      onClick={handleClose}
    >
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h2>{summary ? 'Pedido confirmado' : 'Tu Carrito'}</h2>
          <button className="cart-close-btn" onClick={handleClose}>
            ✕
          </button>
        </div>

        <div className="cart-body">
          {summary ? (
            <div className="cart-summary">
              <p className="cart-summary__badge">Orden #{summary.id}</p>
              <p className="cart-summary__meta">
                Comprador: <strong>{summary.comprador}</strong>
              </p>
              <p className="cart-summary__meta">Fecha: {summary.fecha}</p>
              <p className="cart-summary__meta">Estado: {summary.estado}</p>
              <ul className="cart-summary__items">
                {summary.items.map((item) => (
                  <li key={item.nombre}>
                    {item.nombre} × {item.quantity} — $
                    {(item.precio * item.quantity).toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>
          ) : cart.length === 0 ? (
            <div className="cart-empty">
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            cart.map((item) => {
              const fallback = getProductFallbackImage(
                item.producto.nombre,
                item.producto.categoria,
              );
              return (
                <div key={item.producto.id} className="cart-item">
                  <img
                    src={item.producto.imagen || fallback}
                    alt={item.producto.nombre}
                    className="cart-item-img"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      if (img.src !== fallback) img.src = fallback;
                    }}
                  />
                  <div className="cart-item-info">
                    <span className="cart-item-title">
                      {item.producto.nombre}
                    </span>
                    <span className="cart-item-price">
                      ${item.producto.precio.toFixed(2)} c/u
                    </span>
                    <div className="cart-item-controls">
                      <div
                        style={{
                          display: 'flex',
                          gap: '0.5rem',
                          alignItems: 'center',
                        }}
                      >
                        <button
                          className="cart-qty-btn"
                          onClick={() => updateQuantity(item.producto.id, -1)}
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          className="cart-qty-btn"
                          onClick={() => updateQuantity(item.producto.id, 1)}
                        >
                          +
                        </button>
                      </div>
                      <button
                        className="cart-item-remove"
                        onClick={() => removeFromCart(item.producto.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {summary && (
          <div className="cart-footer">
            <div className="cart-total-row">
              <span>Total pagado:</span>
              <span>${summary.total.toFixed(2)}</span>
            </div>
            <button
              className="cart-checkout-btn"
              onClick={() => {
                handleClose();
                navigate('/ordenes');
              }}
            >
              Ver historial de pedidos
            </button>
            <button
              className="cart-secondary-btn"
              onClick={() => {
                setSummary(null);
                handleClose();
              }}
            >
              Seguir comprando
            </button>
          </div>
        )}

        {!summary && cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-checkout-form">
              <p className="cart-buyer">
                Compra a nombre de <strong>{user?.nombre}</strong>
              </p>
              <label htmlFor="metodo-pago">Método de pago</label>
              <select
                id="metodo-pago"
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
                disabled={loading}
              >
                <option value="Tarjeta">Tarjeta</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
              </select>
            </div>

            <div className="cart-total-row">
              <span>Total:</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>

            <button
              className="cart-checkout-btn"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? 'Procesando...' : 'Finalizar compra'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
