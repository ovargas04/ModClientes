import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DropDownMenuService } from '../dropdownmenu.service';
import { IDropDownMenu } from '../model/IDropDownMenu';
import { IOverlay } from '../model/IOverlay';
// Modelo
import { Usuario } from '../model/Usuario';
import { OverlayService } from '../overlay.service';
// Servicios
import { UsuarioService } from '../usuario.service';
// Utiles
import { UtilApp } from '../Util/util';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();
  user: Usuario = new Usuario();
  userNameCookie: string = null;
  dropDown: IDropDownMenu = { show: true };
  overlays: IOverlay = { message: 'Iniciando sesión...', show: true };
  overlaysHide: IOverlay = { message: '', show: false };
  constructor(
    public router: Router,
    private servUser: UsuarioService,
    private cookieService: CookieService,
    private overlayService: OverlayService,
    private dropDownService: DropDownMenuService,
  ) {
    this.servUser.model$.
      pipe(takeUntil(this.destroy$)).subscribe(
    (model: Usuario) => {
      this.user = model;
    });
  }

  ngOnInit() {
    this.userNameCookie = this.cookieService.get('username') === '' ? null : this.cookieService.get('username'); // To Get Cookie
    this.overlayService.show(this.overlaysHide);
    if (this.userNameCookie === null && UtilApp.isNullOrUndefined(this.userNameCookie)) {
      // Usually you would use the redirect URL from the auth service.
      // However to keep the example simple, we will always redirect to `/admin`.
      const redirectUrl = '/login';
      // Set our navigation extras object
      // that passes on our global query params and fragment
      const navigationExtras: NavigationExtras = {
        queryParamsHandling: 'preserve',
        preserveFragment: true,
      };
      // Redirect the user
      this.router.navigate([redirectUrl], navigationExtras);
    } else {
      this.dropDownService.show(this.dropDown);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
