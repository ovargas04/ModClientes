import { IMensaje } from './IMensaje';

export interface IUsuario extends IMensaje  {
  // propiedades normales de la interface
  codigoPais: number;
  password: string;
  username: string;
  name: string;
  email: string;
  token: string;
  values: string;
  menuItems: [];
}
