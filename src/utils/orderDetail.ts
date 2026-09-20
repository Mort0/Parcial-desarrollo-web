import type { CartItem } from '../context/CartContext';

export function buildOrderDetalle(cart: CartItem[]): string {
  return cart
    .map((item) => {
      const lineTotal = item.producto.precio * item.quantity;
      return `${item.producto.nombre} x${item.quantity} ($${item.producto.precio.toFixed(2)} c/u = $${lineTotal.toFixed(2)})`;
    })
    .join('; ');
}

export function isOrderOwnedByUser(
  orden: { usuarioId?: string; cliente: string },
  user: { id: string; nombre: string },
): boolean {
  if (orden.usuarioId) return orden.usuarioId === user.id;
  return orden.cliente.toLowerCase() === user.nombre.toLowerCase();
}
