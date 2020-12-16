import { IMensaje } from '../IMensaje';

export interface IContrato extends IMensaje {
  desde: number;
  hasta: number;
  costo: number;
  valor: string;
}

export interface ITablaManejo extends IMensaje {
  desde: number;
  hasta: number;
  valor: number;
  porcentaje: string;
}

export interface IEmpresaSelect extends IMensaje {
  id: any;
  name: any;
}
