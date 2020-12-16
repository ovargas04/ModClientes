import { IMensaje } from '../../IMensaje';

export interface ITarjeta extends IMensaje {
  // propiedades  normales de la interface
  cuenta: string;
  desde: string;
  hasta: string;
}
