import { IMensaje } from '../../IMensaje';

export interface IMercaderia extends IMensaje  {
  // propiedades normales de la interface
  desde: string;
  hasta: string;
  costo: string;
  valor: string;
  id: number;
}
