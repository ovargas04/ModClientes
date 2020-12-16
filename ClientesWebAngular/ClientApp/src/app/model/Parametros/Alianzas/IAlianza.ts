import { IMensaje } from '../../IMensaje';

export interface IAlianza extends IMensaje {
  // propiedades  normales de la interface
  id: number;
  name: string;
  monDescuento: number;
  conContrato?: string;
  tarjetaRequerida: boolean;
  monJetBillete: number;
  monKiloBox: number;
  monBanco: string;
  bines: string;
  codigoPais: number;
}
