import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component, OnDestroy, OnInit  } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Servicios
import { CookieService } from 'ngx-cookie-service';
import { Subject, throwError  } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { AppConfigService } from '../app-configuration.service';
import { MessageService } from '../message.service';
import { IOverlay } from '../model/IOverlay';
// modelo
import { IUsuario } from '../model/IUsuario';
import { Usuario } from '../model/Usuario';
import { OverlayService } from '../overlay.service';
import { LoginService } from '../Servicios/Login/login.service';
import { UsuarioService } from '../usuario.service';
// Utiles
import { UtilApp } from '../Util/util';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, OnDestroy {
  userNameCookie: string = null;
  private destroy$: Subject<void> = new Subject<void>();
  url = '';
  inter: any = null;
  data = '';
  loginData: {};
  jdata: {};
  photo = '';
  overlays: IOverlay = { message: 'Iniciando sesión...', show: true };
  overlaysHide: IOverlay = { message: '', show: false };
  user: Usuario = new Usuario();
  util: UtilApp = new UtilApp(this.servMessage);
  Iuser: IUsuario;
  clearOutput = true;
  loginOutput = false;
  profileForm = new FormGroup({
    username: new FormControl(),
    password: new FormControl(),
  });

  constructor(
    private cookieService: CookieService,
    private overlayService: OverlayService,
    private serv: LoginService,
    private servUser: UsuarioService,
    private servMessage: MessageService,
    public router: Router) {
    this.servUser.model$.
      pipe(takeUntil(this.destroy$)).subscribe(
      (model: Usuario) => {
        this.user = model;
      });
  }

  async onSubmit() {
    try {
      this.overlayService.show(this.overlays);
      this.url = AppConfigService.settings.server + 'login/autenticar';
      this.user.username = this.profileForm.value.username;
      this.user.password = this.profileForm.value.password;
      this.jdata = { jdata: { username: this.user.username, password: this.user.password }, jSessionId: 'jdata' };
      this.data = 'jdata=' + encodeURIComponent(JSON.stringify(this.jdata));
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          // 'Authorization': 'my-auth-token'
        }),
      };

      await this.serv.login(this.data, this.url, httpOptions)
        .then((result: IUsuario) => this.Iuser = result)
        .catch(catchError(this.handleError));

      if (this.util.vResultado(this.Iuser)) {
        this.clearOutput = true;
        this.loginData = JSON.parse(this.Iuser.values);
        if (this.loginData['autenticado']) {
          // Se asignan valores y se muestra que se autentico correctamente
          this.loginOutput = true;
          this.clearOutput = true;
          this.Iuser.codigoPais = this.loginData['codigoPais'];
          this.Iuser.name = this.loginData['nombre'];
          this.Iuser.email = this.loginData['email'];
          this.Iuser.token = this.loginData['sessionToken'];
          this.Iuser.menuItems = this.loginData['menuItems'];
          this.Iuser.username = this.user.username;
          // this.Iuser.pais_suffix = AppConfigService.settings.paises[this.Iuser.codigoPais]["pais_suffix"];
          this.servUser.init(this.Iuser);
          // this.overlayService.show(this.overlaysHide);
          // Se carga la foto
          // this.overlayService.show(this.overlays);
          this.photo = `${AppConfigService.settings.server}login/foto-cargar?username='${this.Iuser.username}` +
                       `&jSessionId=${this.Iuser.token}`;
          // Se carga las cookies
          const dateNow = new Date();
          dateNow.setDate(dateNow.getDate() + AppConfigService.settings.cookies_expiration);
          this.cookieService.set('username', `username=${this.Iuser.username}; expires=${dateNow} UTC; path=/`);
          // this.overlayService.show(this.overlaysHide);
          this.inter = setInterval(() => (this.redirectHome()), 1000);
        } else {
          this.clearOutput = false;
          this.loginOutput = false;
          this.overlayService.show(this.overlaysHide);
        }
      } else {
        this.clearOutput = false;
        this.overlayService.show(this.overlaysHide);
      }
    } catch (e) {
      this.overlayService.show(this.overlaysHide);
      console.log(`Could not log in at '${this.url}': ${e.message + '' + e.stack }`);
    }
  }

  private redirectHome() {
    // Usually you would use the redirect URL from the auth service.
    // However to keep the example simple, we will always redirect to `/admin`.
    const redirectUrl = '';
    // Set our navigation extras object
    // that passes on our global query params and fragment
    const navigationExtras: NavigationExtras = {
      queryParamsHandling: 'preserve',
      preserveFragment: true,
    };
    // Redirect the user
    clearInterval(this.inter);
    this.router.navigate([redirectUrl], navigationExtras);
  }

  handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error!';
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side errors
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.log(errorMessage);
    return throwError(errorMessage);
  }

  ngOnInit() {
    this.userNameCookie = this.cookieService.get('username') === '' ? null : this.cookieService.get('username'); // To Get Cookie
    if (this.userNameCookie !== '' && !UtilApp.isNullOrUndefined(this.userNameCookie) && this.user.token !== '') {
      this.redirectHome();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
