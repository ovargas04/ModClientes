import { IMensaje } from '../../IMensaje';

export interface IRuta extends IMensaje {
  // propiedades normales de la interface
  nombre: string;
  id: number;
}
