import { IMensaje } from '../../IMensaje';

export interface IRptObox extends IMensaje {
  // propiedades  normales de la interface
  autorizaciones: string,
  codigopromocion: string;
  columnas: string;
  comoconocio: string;
  contratos: string;
  cumplea_os: string;
  empresas: string;
  estados: string;
  fechadesde: string;
  fechahasta: string;
  guardar: boolean;
  nombre: string;
  productos: string;
  reporte: string;
  sucursales: string;
  tipo: string;
  zonas: string;
  id: number;
}
