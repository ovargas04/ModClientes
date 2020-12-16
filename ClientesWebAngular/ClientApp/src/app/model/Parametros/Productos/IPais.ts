import { IMensaje } from '../../IMensaje';

export interface IPais extends IMensaje {
  // propiedades normales de la interface
  nombre: string;
  id: number;
}
