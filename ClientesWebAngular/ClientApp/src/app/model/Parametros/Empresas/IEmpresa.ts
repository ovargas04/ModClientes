import { IMensaje } from '../../IMensaje';

export interface IEmpresa extends IMensaje  {
  // propiedades  normales de la interface
  id: number;
  name: string;
  costoElaboracionGuia?: string;
  descripcionCostoElaboracionGuia?: string;
  cargoFuel?: string;
  cargoTarjeta?: string;
  excepcionImpuesto?: string;
  excepcionImpuestoAdicional?: string;
}
