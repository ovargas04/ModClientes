import { IMensaje } from '../../IMensaje';

export interface ISucursal extends IMensaje {
  // propiedades  normales de la interface
  id: number;
  descripcion: string;
  activa: boolean;
  fecha?: string;
  email?: string;
  codigoLetras?: string;
  Zona?: string;
  pais?: string;
  provincia?: string;
  canton?: string;
  direccion?: string;
  telefono?: string;
  coordenadas?: string;
  email2?: string;
  direccionIps?: string;
  horario?: string;
}
