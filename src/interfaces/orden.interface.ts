export interface Orden {
  id: string;
  cliente: string;
  usuarioId?: string;
  fecha: string;
  metodo_pago: string;
  total: number;
  descuento: number;
  detalle: string;
  estado_orden: string;
}
