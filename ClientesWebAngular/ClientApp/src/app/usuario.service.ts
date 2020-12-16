import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Usuario } from './model/Usuario';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private userInit: Usuario;
  private modelUsuario: BehaviorSubject<Usuario> = new BehaviorSubject(this.userInit);
  model$ = this.modelUsuario.asObservable();

  constructor() { }

  init(model?: Usuario) {
    this.modelUsuario.next(model);
  }
}
