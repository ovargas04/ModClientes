import { IMensaje } from '../../IMensaje';

export interface IRptBitacora extends IMensaje {
  // propiedades  normales de la interface
  cuenta: string,
  usuario: string;
  actividades: string;
  fechadesde: string;
  fechahasta: string;
  id: string;
  fecha: string;
  cliente: string;
  detalle: string;
}
