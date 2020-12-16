import { IMensaje } from '../../IMensaje';

export interface IManejo2 extends IMensaje  {
  // propiedades normales de la interface
  desde: string;
  hasta: string;
  costo: string;
  valor: string;
  id: number;
}
