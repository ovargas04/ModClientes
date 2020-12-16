import { MessageService } from '../message.service';
import { IMessage } from '../model/message';

export class UtilApp {
  mensage: IMessage = { type: 'Warning', detalleError: '', detalleTecnico: '', resultado: '' };

  static isNullOrUndefined<T>(obj: T | null | undefined): obj is null | undefined {
    return typeof obj === 'undefined' || obj === null;
  }

  constructor(
    private servMessage: MessageService,
  ) { }

  vResultado(resultado: IMessage) {
    if (resultado != null) {
      if (resultado.resultado === 'OK') {
        return true;
      } else {
        this.mensage.text = resultado.detalleTecnico;
        this.mensage.type = 'Warning';
        this.servMessage.add(this.mensage);
      }
    }
    return false;
  }

  formatMonetario(value): string {
    if (value !== null) {
      return parseFloat(value).toPrecision(3);
    }
    return '0.00';
  }
}
