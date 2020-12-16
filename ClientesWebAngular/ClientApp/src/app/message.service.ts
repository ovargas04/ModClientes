import { Injectable } from '@angular/core';
import { IMessage } from './model/message';
@Injectable({
  providedIn: 'root',
})
export class MessageService {
  message: IMessage = {};
  messages: IMessage[] = [];
  interval: any;

  constructor() { }

  add(message: IMessage) {
    this.messages.push(message);
    this.interval = setInterval(() => {
      this.clear();
    }, 4000); // set it every one seconds
  }

  showAlert(message: IMessage) {
    // this.message = null;
    this.message = message;
  }

  clear() {
    this.messages = [];
    clearInterval(this.interval);
  }

  closeMessage() {
    this.message = null;
  }
}
