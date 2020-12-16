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
  templateUrl: './Usuarios.component.html',
})
export class UsuariosComponent implements OnInit, OnDestroy, AfterViewInit {

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



  paisIdHtml = "#_PaisUsuario";
  perfilIdHtml = "#_perfilesSelect";
  estadoIdHtml = "#_estadosSelect";
  usuarioIdHtml = "#_Usuario";
  identificacionIdHtml = "#_Identificacion";
  nombreIdHtml = "#_Nombre";
  departamentoIdHtml = "#_Departamento";
  telefonoIdHtml = "#_Telefono";
  correoIdHtml = "#_Correo";
  requierePasswordIdHtml = "#_RequierePassword";
  avatarDivIdHtml = "#_AvatarDiv";
  esUsuarioNuevo = true;

  fieldsIds =
    [
      { dataId: "username", fieldId: this.usuarioIdHtml },
      { dataId: "nombre", fieldId: this.nombreIdHtml },
      { dataId: "departamento", fieldId: this.departamentoIdHtml },
      { dataId: "identificacion", fieldId: this.identificacionIdHtml },
      { dataId: "email", fieldId: this.correoIdHtml },
      { dataId: "telefono", fieldId: this.telefonoIdHtml },
      { dataId: "cambiarPassword", fieldId: this.requierePasswordIdHtml },
      { dataId: "perfil", fieldId: this.perfilIdHtml },
      { dataId: "codigoPais", fieldId: this.paisIdHtml },
      { dataId: "estadoUsuario", fieldId: this.estadoIdHtml }
    ];


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

    
    await this.cargarUsuarios();
    
  }



  ngOnDestroy(): void {

  }

  empresaAgregar() {

  }

  sucursalAgregar() {

  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();


    this.cargarDropDown(this.paisIdHtml, "parametros/paises", { value: 0, text: 1, secondText: null }, '-1', "Seleccionar");
    this.cargarDropDown(this.perfilIdHtml, "seguridad/perfiles", { value: 0, text: 1, secondText: null }, "-1", "Seleccionar");
    this.cargarDropDown(this.estadoIdHtml, "seguridad/estados", { value: 0, text: 1, secondText: null }, "-1", "Sin Estado");
    this.inhabilitar();
    this.inhabilitarElementoSimple("#EditarHabilitarCampos");
  }



  //********************************USUARIOS***********************************//

  async cargarUsuarios(soloUsuariosActivos: boolean = false,data:string = null)
  {
    try {

      let listboxUsuarioDiv = await this.obtenerElementoHTML("listboxUsuario");
      this.inhabilitar();
      let htmlUsuarios = "";
      let ids = [];
      if (data != null) {
       // this.usuariosGlobal = JSON.parse(data);
        let respuesta = await JSON.parse(this.generarHtmlUsuarios(data,2));
        ids = respuesta.ids;
        htmlUsuarios = respuesta.htmlUsuarios;
      }
      else {
        let usuarioRespuesta = await this.llamadaGenerica({ solo_activos: soloUsuariosActivos }, "cargando...", "seguridad/usuarios");
        if (usuarioRespuesta.success) {

          let respuesta = await JSON.parse(this.generarHtmlUsuarios(usuarioRespuesta.DataJson));
          ids = respuesta.ids;
          htmlUsuarios = respuesta.htmlUsuarios;
         // this.usuariosGlobal = usuarioRespuesta.Data;
        } else {
          this.mostrarMensaje("<p>No se han podido cargar los usuarios. Por favor intente de nuevo</p>", this.iconoError);
        }
  

      }


      listboxUsuarioDiv.innerHTML = "";
      listboxUsuarioDiv.innerHTML = htmlUsuarios;

      let rowUsuario;
      for (var i = 0; i < ids.length; i++) {
        rowUsuario = this.obtenerElementoHTML(`usuario_${ids[i]}`);
        rowUsuario.addEventListener("click", (e: Event) => this.cargarDataUsuario(e.target));
      }

      
    } catch (e) {
      this.mostrarMensaje("<p>Ha ocurrido un error mientras cargabamos los usuarios. Por favor intente de nuevo</p>", this.iconoError);
    }
  }

  //1 -> cargaInicial
  //2 -> buscador
  generarHtmlUsuarios(jsonUsuarios,origen = 1):string
  {
    debugger;
    let htmlUsuarios = "";
    let ids: string[] = [];
    let primerElemento = "";
    let lista = [];

    if (origen == 1) {
      JSON.parse(jsonUsuarios).forEach((value, b) => {
        lista.push({ name: value[0] });
        ids.push(value[0]);
        htmlUsuarios += "<a href='javascript: void (0)' data-usuarioId='" + value[0] + "' id='usuario_" + value[0] + "' class='list-group-item'>" + value[0] + "</a>";

        if (primerElemento != "")
          primerElemento = "<a href='javascript: void (0)' data-usuarioId='" + value[0] + "' id='usuario_" + value[0] + "' class='list-group-item'>" + value[0] + "</a>";
      });

      this.usuariosGlobal = lista;
    }
    else if (origen == 2) {
      JSON.parse(jsonUsuarios).forEach((value, b) => {
        lista.push({ name: value.name });
        ids.push(value.name);
        htmlUsuarios += "<a href='javascript: void (0)' data-usuarioId='" + value.name + "' id='usuario_" + value.name + "' class='list-group-item'>" + value.name + "</a>";

        if (primerElemento != "")
          primerElemento = "<a href='javascript: void (0)' data-usuarioId='" + value.name + "' id='usuario_" + value.name + "' class='list-group-item'>" + value.name + "</a>";
      });
    }



    

    return JSON.stringify({ htmlUsuarios: htmlUsuarios, ids:ids});

  }


  async cargarDataUsuario(event)
  {
    try {


      await this.inhabilitarElementoSimple("#EditarHabilitarCampos", true);
      await this.inhabilitar();
      this.esUsuarioNuevo = false;
      let activeClase = "active";
      let elementoUsuarioSeleccionado = $(event);
      let esActivo = elementoUsuarioSeleccionado.attr("class").includes("active");

      if (!UtilApp.isNullOrUndefined(esActivo) && !esActivo) {
        let aActivo = $("#listboxUsuario a.active");
        let usuario = elementoUsuarioSeleccionado.attr("data-usuarioId");

        aActivo.removeClass(activeClase);

        elementoUsuarioSeleccionado.addClass(activeClase);

        var respuestaUsuario = await this.llamadaGenerica({ username: usuario }, "cargando...", "usuario/usuario-cargar");


        if (respuestaUsuario.success) {

          let values = respuestaUsuario.Data;

          this.setearValorElemento(this.usuarioIdHtml, await this.validadorString(values["user"]));
          this.setearValorElemento(this.identificacionIdHtml, await this.validadorString(values["identificacion"]));
          this.setearValorElemento(this.nombreIdHtml, await this.validadorString(values["nombre"]));
          this.setearValorElemento(this.departamentoIdHtml, await this.validadorString(values["departamento"]));
          this.setearValorElemento(this.telefonoIdHtml, await this.validadorString(values["telefono"]));
          this.setearValorElemento(this.correoIdHtml, await this.validadorString(values["email"]));

          this.validarCheckCheckbox((values["cambiarPassword"] == true ? true : false), this.requierePasswordIdHtml);

          this.seleccionarOptionSelect(this.perfilIdHtml, await this.validadorString(values['perfil'], true, "-1"));
          this.seleccionarOptionSelect(this.estadoIdHtml, await this.validadorString(values['estadoUsuario'], true, "-1"));
          this.seleccionarOptionSelect(this.paisIdHtml, await this.validadorString(values['codigoPais'], true, "-1"));

        }
        else {
          this.mostrarMensaje("<p>No se pudo cargar los datos de " + usuario+" </p>", this.iconoError);
        }


      }

    } catch (e) {
      this.mostrarMensaje("<p>Ha ocurrido un error en el proceso de carga de datos.</p>", this.iconoError);
    }
  }


  cargarUsuariosActivos(event)
  {
    this.cargarUsuarios(event);
  }


  
  async modificarUsuario()
  {
    try {
      
      let data = {};
      for (var i = 0; i < this.fieldsIds.length; i++) {
        data[this.fieldsIds[i].dataId] = await this.obtenerValorElemento(this.fieldsIds[i].fieldId);
      }

      if (!this.esUsuarioValido(data["username"])) {
        return false;
      }


      var respuestaUsuario = await this.llamadaGenerica(data, "", "seguridad/usuario-actualizar");

      if (respuestaUsuario.success) {

        var mensaje = "Se ha {1} correctamente el usuario.";
        if (this.esUsuarioNuevo) {
          mensaje = mensaje.replace("{1}", "guardado");
        } else {
          mensaje = mensaje.replace("{1}", "actualizado");
        }

        this.cargarUsuarios(false, null);
        await this.mostrarMensaje("<p>" + mensaje + "<p>", this.iconoSuccess);
      }
      else {

        var mensaje = "No se ha podido {1} .Por favor intente de nuevo";
        if (this.esUsuarioNuevo) {
          mensaje = mensaje.replace("{1}", "guardado el usuario");
        } else {
          mensaje = mensaje.replace("{1}", "actualizar los datos del usuario");
        }

        await this.mostrarMensaje("<p>" + mensaje + " </p>", this.iconoError);
      }

    } catch (e) {
      await this.mostrarMensaje("<p>Ha sucedido un error: "+e.toString()+" </p>", this.iconoError);
    }
  }

  editarHiden = "#editarHidden";
  async editar()
  {
    try {
      
      if ($(this.editarHiden).val() == "") {
        await this.inhabilitar(true);
        await this.setearValorElemento(this.editarHiden, "true");
      }
      else {
        if ($("#editarHidden").val() == "true")
        {
          await this.inhabilitar(false);
          await this.setearValorElemento(this.editarHiden, "false");
        }
        else {
          await this.inhabilitar(true);
          await this.setearValorElemento(this.editarHiden, "true");
        }
      }

     
      await this.inhabilitarElementoSimple(this.usuarioIdHtml);

    } catch (e) {

    }
  }


  buscarUsuario(text)
  {
    debugger;
    let usuarios: any; 
    if (UtilApp.isNullOrUndefined(text) || text == "") {
      usuarios = this.usuariosGlobal;
    }
    else {
      usuarios = this.usuariosGlobal.filter(x => x.name.toLowerCase().includes(text));
    }


    this.cargarUsuarios(false, JSON.stringify(usuarios));

  }

  


  async eliminarUsuario()
  {
    let usuario = await this.obtenerValorElemento(this.usuarioIdHtml);

    if (this.esUsuarioValido(usuario)) {

      let respuestaEliminar = await this.llamadaGenerica({ username: usuario}, "eliminando...", "seguridad/usuario-borrar");


      if (respuestaEliminar.success) {
        await this.mostrarMensaje("<p>Se ha eliminado el usuario correctamente</p>", this.iconoSuccess);
        this.cargarUsuarios(false);
        this.limpiarForm();
      }
      else {
        await this.mostrarMensaje("<p>No se ha podido eliminar el usuario, por favor, intente de nuevo</p>", this.iconoError);
      }

    }
    else {
      await this.mostrarMensaje("<p>El campo Usuario no debe estar vacio</p>", this.iconoError);
    }


  }

  async limpiarForm()
  {
    for (var i = 0; i < this.fieldsIds.length; i++) {
      var elemento = this.fieldsIds[i].fieldId;
      await this.restablecerValorElemento(elemento);
    }
  }


  async nuevoUsuario()
  {
    this.inhabilitarElementoSimple("#EditarHabilitarCampos", false);
    this.inhabilitar(true);
    await this.limpiarForm();

  }


  async generarClave()
  {
    let usuario = await this.obtenerValorElemento(this.usuarioIdHtml);

    if (!this.esUsuarioValido(usuario))
      return false;

    let respuesta = await this.llamadaGenerica({ usuario: usuario }, "generando...", "seguridad/new-password");

    if (respuesta.success) {
      await this.mostrarMensaje("<p>La nueva clave se ha enviado al correo registrado.</p>", this.iconoSuccess);
    }
    else {
      await this.mostrarMensaje("<p>No se ha podido generar una nueva clave. Intente de nuevo</p>", this.iconoError);
    }


  }


  esUsuarioValido(usuario): boolean
  {

    if (usuario == "")
    {
      this.mostrarMensaje("<p>El campo Usuario no debe estar vacio</p>", this.iconoError);
      return false;
    }
    else {
      return true;
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


  inhabilitarElementoSimple(elemento, habilitar = false)
  {
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



