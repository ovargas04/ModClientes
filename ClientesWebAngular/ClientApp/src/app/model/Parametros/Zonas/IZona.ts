import { IMensaje } from '../../IMensaje';

export interface IZona extends IMensaje {
  // propiedades  normales de la interface
  id: number;
  nombre: string;
  costoElaboracionGuia?: string;
  descripcionCostoElaboracionGuia?: string;
  cargoFuel?: string;
  cargoTarjeta?: string;
  excepcionImpuesto?: string;
  excepcionImpuestoAdicional?: string;
}
