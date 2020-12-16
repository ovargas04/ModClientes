import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
// Modelo
import { Usuario } from './model/Usuario';
// Servicios
import { UsuarioService } from './usuario.service';
// Utiles
import { UtilApp } from './Util/util';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  private user: Usuario = new Usuario(0, 'empty.empty', 'No User', 'empty.empty@jetbox.com', 'empty', '');
  private destroy$: Subject<void> = new Subject<void>();
  constructor(private serv: UsuarioService) {
    this.serv.model$
    .pipe(takeUntil(this.destroy$)).subscribe(
      (model: Usuario) => {
        if (UtilApp.isNullOrUndefined(model)) {
          this.serv.init(this.user);
        } else {
          this.user = model;
        }
      });
  }

  ngOnInit() { }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
