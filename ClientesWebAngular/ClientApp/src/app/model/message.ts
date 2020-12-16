import { IMensaje } from './IMensaje';

export interface IMessage extends IMensaje {
  id?: number;
  text?: string;
  type?: string;
}
