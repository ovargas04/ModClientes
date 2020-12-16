import { IMensaje } from '../../IMensaje';

export interface IProducto extends IMensaje {
  // propiedades normales de la interface
  id: number;
  nombre: string;
  empresa_id: number;
  MultiPais: boolean;
  CodigoPais: number;
 
}
