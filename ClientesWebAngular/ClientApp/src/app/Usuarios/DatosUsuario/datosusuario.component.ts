import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { AfterViewInit, Component, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { DataTableDirective } from 'angular-datatables';
import { CookieService } from 'ngx-cookie-service';
import { Subject, throwError } from 'rxjs';
import { catchError, takeUntil, ignoreElements } from 'rxjs/operators';
import { AppConfigService } from '../../app-configuration.service';
import { MessageService } from '../../message.service';
// Modelo
import { IOverlay } from '../../model/IOverlay';
import { IMessage } from '../../model/message';
import { IEmpresa } from '../../model/Parametros/Empresas/IEmpresa';
import { IPais } from '../../model/Parametros/Productos/IPais';
import { Usuario } from '../../model/Usuario';
import { OverlayService } from '../../overlay.service';
import { EmpresasService } from '../../Servicios/Parametros/Empresas/empresas.service';
import { PaisesService } from '../../Servicios/Parametros/Paises/paises.service';
// Servicios
import { UsuarioService } from '../../usuario.service';
import { UtilApp } from '../../Util/util';

@Component({
  selector: 'app-counter-component',
  templateUrl: './datosusuario.component.html',
})
export class DatosUsuarioComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChildren(DataTableDirective)
  dtElements: QueryList<DataTableDirective>;
  util: UtilApp = new UtilApp(this.servMessage);
  private destroy$: Subject<void> = new Subject<void>();

  bntIdBotonModalTrigger = 'btnModalMensaje';
  iconoSuccess = 'Success';
  iconoError = 'Error';
  loadingIndicator = true;
  dtTrigger: Subject<any> = new Subject();

  jdata: {};
  data = '';
  resultado: any;


  user: Usuario = new Usuario();
  url = '';
  userNameCookie: string = null;
  overlays: IOverlay = { message: 'Buscando zonas...', show: true };
  overlaysHide: IOverlay = { message: '', show: false };

  identificacion: string;
  nombre: string;
  departamento: string;
  telefono: number;
  correo: string;


  datosUsuarioForm = new FormGroup({
    identificacion: new FormControl(),
    nombre: new FormControl(),
    departamento: new FormControl(),
    telefono: new FormControl(),
    correo: new FormControl(),
    foto: new FormControl()
  });



  usuariosGlobal: any;

  constructor(
    public router: Router,
    private servUser: UsuarioService,
    private cookieService: CookieService,
    private overlayService: OverlayService,
    private serv: EmpresasService,
    private servMessage: MessageService,
    private http: HttpClient,
    private servPais: PaisesService
  ) {
    this.servUser.model$
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (model: Usuario) => {
          this.user = model;
          setTimeout(() => {
            this.loadingIndicator = false;
          }, 1500);
        });



  }



  private redirectLogin() {
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
  }

  async ngOnInit() {
    
  }



  ngOnDestroy(): void {

  }

  empresaAgregar() {

  }

  sucursalAgregar() {

  }

  ngAfterViewInit(): void {
    var objDatos = JSON.parse(this.user.values);
    $('#identificacion').val(objDatos.identificacion);
    $('#nombre').val(this.user.name);
    $('#departamento').val(objDatos.departamento);
    $('#telefono').val(objDatos.telefono);
    $('#correo').val(objDatos.email);
  }



  //********************************USUARIOS***********************************//

  async actualizar_pressed() {
    try {
      debugger;
      var identificacion = $('#identificacion').val(); // == null ? this.identificacion : this.datosUsuarioForm.controls['identificacion'].value;
      var nombre = $('#nombre').val();
      var departamento = $('#departamento').val();
      var telefono = $('#telefono').val();
      var correo = $('#correo').val();

      if (identificacion == "") {
        this.mostrarMensaje("<p>Debe digitar una identificacion.</p>", this.iconoError);
      }
      else
        if (nombre == "") {
          this.mostrarMensaje("<p>Debe digitar un nombre.</p>", this.iconoError);
        }
        else
          if (departamento == "") {
            this.mostrarMensaje("<p>Debe digitar un departamento.</p>", this.iconoError);
          }
          else
            if (telefono == "") {
              this.mostrarMensaje("<p>Debe digitar un telefono.</p>", this.iconoError);
            }
            else
              if (correo == "") {
                this.mostrarMensaje("<p>Debe digitar un correo.</p>", this.iconoError);
              }
              else {

          var data = {
            "username": this.user.username,
            "nombre": nombre,
            "departamento": departamento,
            "identificacion": identificacion,
            "email": correo,
            "telefono": telefono,
          }

                let usuarioRespuesta = await this.llamadaGenerica(data, "Actualizando...", "usuario/usuario-actualizar");
          if (usuarioRespuesta.success) {
            this.mostrarMensaje("<p>Se ha actualizado la información.</p>", this.iconoSuccess);
          } else {
            this.mostrarMensaje("<p>No se han podido realizar la actualización. Por favor intente de nuevo</p>", this.iconoError);
          }
        }
    }

    catch (e) {
      this.mostrarMensaje("<p>Ha ocurrido un error mientras se realiza el cambio de contraseña. Por favor intente de nuevo</p>", this.iconoError);
    }
  }



  //*****************************UTILS*****************************************//

  async llamadaGenerica(data, mensajeOverlay, nombreMetodo, mostrarOverlay = true) {

    var objetoRespuesta =
    {
      success: false,
      Data: {},
      DataJson: ''
    };


    try {
      if (data == null) {
        data = {};
      }

      if (mostrarOverlay) {
        this.overlays.message = mensajeOverlay;
        this.overlayService.show(this.overlays);
      }


      this.url = AppConfigService.settings.server + nombreMetodo;
      this.jdata = { jdata: data, jSessionId: this.user.token };
      this.data = 'jdata=' + encodeURIComponent(JSON.stringify(this.jdata));
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        }),
      };
      await this.serv.ObtenerSucursales(this.data, this.url, httpOptions)
        .then((result: []) => this.resultado = result)
        .catch(catchError(this.handleError));
      if (this.util.vResultado(this.resultado)) {
        this.overlayService.show(this.overlaysHide);
        objetoRespuesta.success = true;
        objetoRespuesta.DataJson = this.resultado.values;
        objetoRespuesta.Data = JSON.parse(this.resultado.values);
      } else {
        objetoRespuesta.success = false;
        this.overlayService.show(this.overlaysHide);
      }
    } catch (e) {
      this.overlayService.show(this.overlaysHide);
      objetoRespuesta.success = false;
      console.log("Catch en llamada Generica", e);
    }

    this.overlayService.show(this.overlaysHide);
    return objetoRespuesta;
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
    this.mostrarMensaje('<p>Ha sucedido el siguiente error: ' + errorMessage + '</p>', this.iconoError);
    console.log(errorMessage);
    return throwError(errorMessage);
  }


  async mostrarMensaje(htmlMostrar, icono = 'Success') {
    let iconoausar = '';
    var iconos =
    {
      iconoError: 'cancel',
      iconoSuccess: '&#xE876;',
      colorSuccess: 'green',
      colorError: 'red'
    };

    if (icono === this.iconoSuccess) {
      iconoausar = iconos.iconoSuccess;
    } else if (icono === this.iconoError)
      iconoausar = iconos.iconoError;

    let contenedor: HTMLElement = document.getElementById('bodyModalContainerClientes') as HTMLElement;
    contenedor.innerHTML = htmlMostrar;

    let contenedorIcono: HTMLElement = document.getElementById('iconBoxBodyClientes') as HTMLElement;
    contenedorIcono.innerHTML = iconoausar;

    let contenedorHeader: HTMLElement = document.getElementById('headerBodyClientes') as HTMLElement;
    contenedorHeader.style.backgroundColor = (icono == this.iconoError ? iconos.colorError : iconos.colorSuccess);

    this.triggerClick(this.bntIdBotonModalTrigger);

  }

  triggerClick(idElementoHTML) {
    let boton: HTMLElement = document.getElementById(idElementoHTML) as HTMLElement;
    boton.click();
  }


  private obtenerElementoHTML(idElementoHTML): HTMLElement {
    let elemento: HTMLElement = document.getElementById(idElementoHTML) as HTMLElement;
    return elemento;
  }


  async cargarDropDown(HtmlId: string, Ruta, DataCampos, valorDefecto, TextoDefecto = "", DataUrl = null) {
    var elemento = this.obtenerElementoHTML(HtmlId.substring(1, HtmlId.length));
    var options = "";
    if (TextoDefecto != "") {
      options += `<option value='${valorDefecto}'>${TextoDefecto}</option>`;
    }

    var primerElementoValor: any;
    this.llamadaGenerica(DataUrl, "cargando datos complementarios...", Ruta)
      .then(function (data) {

        let primerElemento = true;
        JSON.parse(data.DataJson).forEach((a, b) => {

          if (primerElemento) {
            primerElementoValor = a[DataCampos.value];
            primerElemento = false;
          }

          if (HtmlId == "#_Zona" || HtmlId == "#_EjecutivoCuenta") {

            if (HtmlId == "#_Zona") {
              options += `<option value='${a[DataCampos.value]}'>${a[1]} - ${a[2]}</option>`;
            }
            else if (HtmlId = "#_EjecutivoCuenta") {
              options += `<option value='${a[DataCampos.value]}'>${a[1]} ${a[2]} ${a[3]}</option>`;
            }


          } else {
            options += `<option value='${a[DataCampos.value]}'>${a[DataCampos.text]}</option>`;
          }
        });

        elemento.innerHTML = options;
      });


    return primerElementoValor;
  }

  Mostrar_Ocultar_Campos(idsMostrarCampos: string, idsocultarCampos: string, camposNOMostrar: string = "", camposNOOcultar: string = ""): void {
    try {

      if (!UtilApp.isNullOrUndefined(camposNOMostrar) && camposNOMostrar != "") {

        if (idsMostrarCampos != "") {
          $(idsMostrarCampos).not(camposNOMostrar).each(function () {
            $(this).show("fast");
          });
        }

      }
      else {
        if (idsMostrarCampos != "") {
          $(idsMostrarCampos).each(function () {
            $(this).show("fast");
          });
        }
      }



      if (!UtilApp.isNullOrUndefined(camposNOOcultar) && camposNOOcultar != "") {
        if (idsocultarCampos != "") {
          $(idsocultarCampos).not(camposNOOcultar).each(function () {
            $(this).hide("fast");
          });
        }
      }
      else {
        if (idsocultarCampos != "") {
          $(idsocultarCampos).each(function () {
            $(this).hide("fast");
          });
        }
      }


    } catch (e) {
      this.mostrarMensaje("<p>Ha sucedido un error aplicando la seguridad de campos</p>", this.iconoError);
    }

  }

  async obtenerValorElemento(elemento) {

    try {


      let element = $(elemento);
      let value = null;

      if (element.is("select")) {
        value = element.find("option:selected").eq(0).val();
      }
      else if (element.is("input[type='checkbox']")) {
        value = element.prop("checked");
      }
      else if (element.is("input[type='text']")) {
        value = element.val();
      }
      else if (element.is("input[type='email']")) {
        value = element.val();
      }
      else if (element.is("input[type='date']")) {
        value = element.val();
      }
      else if (element.is("textarea")) {
        value = element.val()
      }

      return value;

    } catch (e) {

    }


    return null;
  }


  restablecerValorElemento(elemento): void {

    try {

      let element = $(elemento);
      let value = null;

      if (element.is("select")) {
        element.prop("selectedIndex", 0);
      }
      else if (element.is("input[type='checkbox']")) {
        element.removeAttr("checked");
      }
      else if (element.is("input[type='text']")) {
        element.val("");
      }
      else if (element.is("input[type='date']")) {
        element.val(this.obtenerFechaActual());
      }
      else if (element.is("input[type='email']")) {
        element.val("");
      }
      else if (element.is("textarea")) {
        element.val("");
      }

    } catch (e) {

    }
  }

  async inhabilitar(esHabilitar = false) {

    let elemento = $(".panel-usuarios input,select");

    if (esHabilitar) {
      elemento.removeClass("noHabilitado");
    }
    else {
      elemento.addClass("noHabilitado");
    }



  }


  inhabilitarElementoSimple(elemento, habilitar = false) {
    let elem = $(elemento);

    if (habilitar) {
      elem.removeClass("noHabilitado");
    }
    else {
      elem.addClass("noHabilitado");
    }
  }

  AccionSessionManager =
    {
      asignarValor: 1,
      obtenerValor: 2,
      eliminarObjeto: 3,
      nombreSession: "nuevaCuenta"
    };

  sessionManager(nombreSession: string, valor: string, tipoAccion: number): string {
    // 1 -> asignar Valor
    // 2 -> obtenerValor
    // 3 -> eliminar

    if (tipoAccion == 1) {
      sessionStorage.setItem(nombreSession, valor);
    }
    else if (tipoAccion == 2) {
      return sessionStorage.getItem(nombreSession) ?? null;
    }
    else if (true) {
      sessionStorage.removeItem(nombreSession);
    }

    return null;
  }



  validadorString(valor, esDropDown: boolean = false, valorDefaultDropDown: string = "-1", valorDefaultCampoNormal: string = ""): string {
    if (esDropDown) {
      return valor == null || undefined ? valorDefaultDropDown : valor;
    }
    else {
      return valor == null || undefined ? valorDefaultCampoNormal : valor;
    }

  }

  validarCheckCheckbox(condicional: boolean, checkboxId: string, htmlElement: JQuery<HTMLElement> = null): void {

    if (checkboxId.startsWith("#")) {
      checkboxId = checkboxId.substring(1, checkboxId.length).toString();
    }


    if (htmlElement != null) {
      var checkboxJquery = htmlElement;

      if (condicional) {
        checkboxJquery.attr("checked", "checked");
      }
      else {
        checkboxJquery.removeAttr("checked");
      }

    }
    else {
      var checkbox: HTMLElement = this.obtenerElementoHTML(checkboxId);

      if (checkbox != null) {
        if (condicional) {
          checkbox.setAttribute("checked", "checked");
        }
        else {
          checkbox.removeAttribute("checked")
        }
      }

    }


  }


  seleccionarOptionSelect(idSelect: string, valor: string) {
    try {


      if (!idSelect.startsWith("#")) {
        idSelect = "#" + idSelect;
      }

      $(idSelect).val(valor);

    } catch (e) {

    }
  }

  contieneSoloNumeros(param: string): boolean {

    var numbers = /^[-+]?[0-9]+$/;
    if (param.match(numbers)) {
      return true;
    }
    else {
      return false;
    }
  }


  image_readImage(evt) {
    let uploadInput = $("#FileUploadImagenSeccion");
    var file = $("#_ImagenImagen");
    this.readURL(uploadInput, file);
  }

  readURL(input: any, target: any): void {


    var reader = new FileReader();
    var result = "";

    reader.onload = function (e: any) {


      sessionStorage.setItem("cliente_imagen", e.target.result);
      $(target).attr('src', e.target.result);
    }
    reader.readAsDataURL(input[0].files[0]);

  }

  setearValorElemento(elemento, valor) {

    var jqueryElement = $(elemento);

    if (!UtilApp.isNullOrUndefined(jqueryElement)) {
      jqueryElement.val(valor);
    }
    else {
      console.log("elemento invalido. Id = ", elemento);
    }
  }

  obtenerFechaActual(): string {
    let d = new Date();
    var datestring = (d.getFullYear().toString() + "-" + d.getMonth().toString() + "-" + d.getDate().toString());
    return datestring;
  }

  setearValorFechaDefault() {
    this.setearValorElemento("#_FechaIngreso", this.obtenerFechaActual());
  }

  //*****************************UTILS*****************************************//

}



