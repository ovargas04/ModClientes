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
  selector: 'app-perfiles-component',
  templateUrl: './Perfiles.component.html',
})
export class PerfilesComponent implements OnInit, OnDestroy, AfterViewInit {

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


  asignadosArray = [];
  disponiblesArray = [];
  paisIdHtml = "#_PaisPerfil";

  fieldsIds: string[] =
    [
      this.paisIdHtml
    ];


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

    //await this.cargarMenu();
    await this.cargarPerfiles();

    this.sucursalesCargar(null);
    this.inhabilitarElementoSimple("#btnNuevo");
    
  }



  ngOnDestroy(): void {

  }

  empresaAgregar() {

  }

  sucursalAgregar() {

  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();

    this.cargarDropDown(this.paisIdHtml, "parametros/paises", { value: 0, text: 1, secondText: null }, '-1', "-- SIN DEFINIR");
    this.ponerEventoCheckbox();
  }






  //********************************PERFILES***********************************//


  async cargarMenu() {

    var respuestaMenu = await this.llamadaGenerica(null, "", "seguridad/load-menu", false);
    let contenedorMenu = await this.obtenerElementoHTML("perfil_tree");
    let html = "<div class='parent-check'>";
    html += "<input type='checkbox' id='Nivel_0'><label>Opciones del Sistema</label>";

    var values: any = respuestaMenu.Data['children'];

    for (var i = 0; i < values.length; i++) {


      html += "<div class='child-check'>";
      html += "<input type='checkbox' data-codigoMenu='" + values[i]["codigoMenu"] + "' id='Nivel_" + values[i]["id"] + "'><label>" + values[i]["name"] + "</label>";

      let childrens = values[i]["children"];
      for (var y = 0; y < childrens.length; y++) {

        if (childrens[y]["parent"] == values[i]["id"]) {

          html += "<div class='child-check'>";
          html += "<input type='checkbox' data-id='" + childrens[y]["id"] + "' data-parent='" + childrens[y]["parent"] + "' data-codigoMenu='" + childrens[y]["codigoMenu"] + "' id='Nivel_" + values[i]["id"] + "_" + childrens[y]["id"] + "'><label>" + childrens[y]["name"] + "</label>";
          html += "</div>";

        }

      }




      html += "</div>";


    }


    html += "</div>";
    contenedorMenu.innerHTML = html;
  }


  async sucursalesCargar(lista: any = null) {
    var divisiones = [];

    var resultado = await this.llamadaGenerica({ empresa_id: "-1" }, '', 'parametros/sucursales', false);

    if (resultado.success) {
      JSON.parse(resultado.DataJson).forEach((a, b) => {

        if (a[0] != null) {
          divisiones.push(
            {
              id: a[0],
              nombre: a[1]
            });
        }

      });

      let asignados = null;
      let disponibles = null;
      if (lista == null) {
        asignados = null;
        disponibles = divisiones;


      }
      else {

        if (lista.length > 0) {


          if (lista.length == divisiones.length) {
            asignados = divisiones;
            disponibles = null;
          }
          else {


            let asignadosCustom = [];

            for (var i = 0; i < lista.length; i++) {
              let objAsignado = divisiones.filter(x => x.id == lista[i])[0];

              if (objAsignado) {
                asignadosCustom.push(objAsignado);

                divisiones.splice(divisiones.indexOf(objAsignado), 1);
              }

            }

            disponibles = divisiones;
            asignados = asignadosCustom;

          }



        }
        else {
          asignados = null;
          disponibles = divisiones;
        }




      }



      this.cargarDivisiones(asignados, disponibles);




    } else {
      this.mostrarMensaje("<p>Ha ocurrido un error al cargar las divisiones</p>", this.iconoError);
    }

  }

  async cargarDivisiones(asignados, disponibles) {
    this.asignadosArray = asignados;
    this.disponiblesArray = disponibles;
    let asignadosSelect: HTMLElement = document.getElementById('_Asignados') as HTMLElement;
    let disponiblesSelect: HTMLElement = document.getElementById('_Disponibles') as HTMLElement;

    var options = '';
    var selected = '';


    if (asignados != null) {
      for (var i = 0; i < asignados.length; i++) {
        selected = '';
        if (asignados[i].seleccionado != undefined) {
          if (asignados[i].seleccionado == true) {
            selected = 'selected';
          }
        }
        options += `<option ${selected} value='${asignados[i].id}'>${asignados[i].nombre}</option>`;
      }


    }
    asignadosSelect.innerHTML = options;

    options = '';
    selected = '';


    if (disponibles != null) {
      for (var i = 0; i < disponibles.length; i++) {
        selected = '';
        if (disponibles[i].seleccionado != undefined) {
          if (disponibles[i].seleccionado == true) {
            selected = 'selected';
          }
        }
        options += `<option ${selected} value='${disponibles[i].id}'>${disponibles[i].nombre}</option>`;
      }


    }
    disponiblesSelect.innerHTML = options;

  }

  async asignar() {
    debugger;
    var disponiblesSeleccionados = [];
    $('#_Disponibles option:selected').each(function () {
      disponiblesSeleccionados.push($(this).val());
    });

    for (var i = 0; i < disponiblesSeleccionados.length; i++) {

      var id = disponiblesSeleccionados[i];
      var obj = this.disponiblesArray.filter(x => x.id == id)[0];
      this.disponiblesArray.splice(this.disponiblesArray.indexOf(obj), 1);
      obj['seleccionado'] = true;

      if (this.asignadosArray == null) {
        this.asignadosArray = [];
        this.asignadosArray.push(obj);
      }
      else {
        this.asignadosArray.unshift(obj);
      }


    }

    await this.cargarDivisiones(this.asignadosArray, this.disponiblesArray);

  }

  async desasignar() {


    var asignadosSeleccionados = [];
    $('#_Asignados option:selected').each(function () {
      asignadosSeleccionados.push($(this).val());
    });

    for (var i = 0; i < asignadosSeleccionados.length; i++) {

      var id = asignadosSeleccionados[i];
      var obj = this.asignadosArray.filter(x => x.id == id)[0];
      this.asignadosArray.splice(this.asignadosArray.indexOf(obj), 1);
      obj['seleccionado'] = true;

      if (this.disponiblesArray == null) {
        this.disponiblesArray = [];
        this.disponiblesArray.push(obj);
      }
      else {
        this.disponiblesArray.unshift(obj);
      }

    }

    await this.cargarDivisiones(this.asignadosArray, this.disponiblesArray);

  }

  async cargarPerfiles() {
    try {

      let perfilRespuesta = await this.llamadaGenerica(null, "cargando...", "seguridad/perfiles");
      let listboxPerfilDiv = await this.obtenerElementoHTML("listboxPerfil");

      if (perfilRespuesta.success) {


        let htmlUsuarios = "";
        let ids: string[] = [];
        //let primerElemento = "";
        JSON.parse(perfilRespuesta.DataJson).forEach((value, b) => {
          ids.push(value[0]);
          htmlUsuarios += "<a href='javascript: void (0)' data-perfilId='" + value[0] + "' id='perfil_" + value[0] + "' class='list-group-item'>" + value[1] + "</a>";

          //if (primerElemento != "")
          //  primerElemento = "<a href='javascript: void (0)' data-perfilId='" + value[0] + "' id='perfil_" + value[0] + "' class='list-group-item'>" + value[1] + "</a>";
        });


        listboxPerfilDiv.innerHTML = htmlUsuarios;



        let rowPerfil;
        for (var i = 0; i < ids.length; i++) {
          rowPerfil = this.obtenerElementoHTML(`perfil_${ids[i]}`);
          rowPerfil.addEventListener("click", (e: Event) => this.cargarDataPerfil(e.target));
        }



      }
      else {
        this.mostrarMensaje("<p>No se han podido cargar los perfiles. Por favor intente de nuevo</p>", this.iconoError);
      }


    } catch (e) {
      this.mostrarMensaje("<p>Ha ocurrido un error mientras cargabamos los perfiles. Por favor intente de nuevo</p>", this.iconoError);
    }
  }

  IdGlobalSeleccionado = "";
  async cargarDataPerfil(event) {
    let activeClase = "active";
    let elementoSeleccionado = $(event);
    let esActivo = elementoSeleccionado.attr("class").includes("active");

    if (!UtilApp.isNullOrUndefined(esActivo) && !esActivo) {
      await this.restablecerTreeMenu();
      this.inhabilitarElementoSimple("#_PaisPerfil");
      this.inhabilitarElementoSimple("#btnNuevo",true);
      let aActivo = $("#listboxPerfil a.active");
      let perfilId = elementoSeleccionado.attr("data-perfilId");
      this.IdGlobalSeleccionado = perfilId;
      aActivo.removeClass(activeClase);

      elementoSeleccionado.addClass(activeClase);

      var respuesta = await this.llamadaGenerica({ perfil_id: perfilId }, "cargando...", "seguridad/perfil-cargar",false);


      if (respuesta.success) {

        let values = respuesta.Data;

        this.seleccionarOptionSelect(this.paisIdHtml, await this.validadorString(values['codigoPais'], true, "-1"));
        this.setearValorElemento("#_NombrePerfil", await this.validadorString(values["descripcion"]));
        this.chequearMenu(values["data"].split(","));
        this.sucursalesCargar(values["sucursales"].split(","))


      }
      else {
        this.mostrarMensaje("<p>No se pudo cargar los datos</p>", this.iconoError);
      }
    }
  }

  async chequearMenu(list) {

    var chequearPadre = list.filter(x => x == 0)[0];


    if (chequearPadre) {

      let elementoNivel0 = $("#Nivel_0");

      if (elementoNivel0.prop("checked")) {
        await this.triggerClick('Nivel_0');
        await this.triggerClick('Nivel_0');
      }
      else {
        await this.triggerClick('Nivel_0');
      }
    }


    let checkboxIds = [];
    $("#perfil_tree input[type=checkbox]").each(function () {
      let id = $(this).attr("data-id");

      if (!UtilApp.isNullOrUndefined(id)) {
        checkboxIds.push(id);
      }


    });

    let idPerfil = 0;
    for (var i = 0; i < list.length; i++) {
      idPerfil = list[i];


      let check = checkboxIds.filter(x => x == idPerfil)[0];


      if (check) {
        let elemento = $("[data-id='" + check + "']");
        let parent = elemento.attr("data-parent");
        let id = elemento.attr("id");
        let isChildChecked = elemento.prop("checked");

        let elementoPadre = $("#Nivel_" + parent);
        let isparentChecked = elementoPadre.prop("checked");
        let idPadre = elementoPadre.attr("id");

        if (!isparentChecked) {
          await this.triggerClick(idPadre);
        }

        if (!isChildChecked) {
          await this.triggerClick(id);
        }



      }


    }



  }

  ponerEventoCheckbox() {
    let checks = document.querySelectorAll("input[type=checkbox]");

    for (var i = 0; i < checks.length; i++) {
      checks[i].addEventListener("click", (e: Event) => this.validarCheckedCheck(e.target));
    }

  }

  async validarCheckedCheck(event) {

    let elemento = $(event);
    let esChecked = elemento.prop("checked");
    var check = await this.obtenerElementoHTML(elemento.attr('id'));

    if (esChecked) {
      this.showChildrenChecks(check);
    } else {
      this.hideChildrenChecks(check)
    }

  }

  showChildrenChecks(elm) {
    var pN = elm.parentNode;
    var childCheks = pN.children;

    for (var i = 0; i < childCheks.length; i++) {
      if (this.hasClass(childCheks[i], 'child-check')) {
        childCheks[i].classList.add("active");
      }
    }

  }

  hideChildrenChecks(elm) {
    var pN = elm.parentNode;
    var childCheks = pN.children;

    for (var i = 0; i < childCheks.length; i++) {
      if (this.hasClass(childCheks[i], 'child-check')) {
        childCheks[i].classList.remove("active");
      }
    }

  }

  hasClass(elem, className) {
    return new RegExp(' ' + className + ' ').test(' ' + elem.className + ' ');
  }


  async guardarEditarPerfil() {

    try {

      let idPerfil = this.IdGlobalSeleccionado == "" ? -1 : parseInt(this.IdGlobalSeleccionado);
      let esEditar = idPerfil == -1 ? false : true;

      let checkboxMenuIds = [];


      let checks = document.querySelectorAll("input[type=checkbox]");

      for (var i = 0; i < checks.length; i++) {

        let elemento = $(checks[i]);
        let esChequeado = elemento.prop("checked");
        let id = elemento.attr("data-id");

        if (esChequeado) {

          if (!UtilApp.isNullOrUndefined(id)) {
            checkboxMenuIds.push(id.toString());
          }

        }


      }

      if (checkboxMenuIds.length > 0) {

        let tieneCheckPadreGeneral = checkboxMenuIds.filter(x => x == 0)[0];

        if (!tieneCheckPadreGeneral) {
          checkboxMenuIds.push("0");
        }

      }

      var sucursalesAsignadas = [];
      if (this.asignadosArray != null) {
        this.asignadosArray.forEach((val) => {
          sucursalesAsignadas.push(val.id);
        });
      }
     
    

      let data = {
        "perfil_id": idPerfil,
        "pais_id": await this.obtenerValorElemento('#_PaisPerfil'),
        "descripcion": await this.obtenerValorElemento('#_NombrePerfil'),
        "data": checkboxMenuIds.join(","),
        "sucursales": sucursalesAsignadas.join(",")
      };


      if (data.descripcion == "") {
        await this.mostrarMensaje('<p>El nombre no puede estar en blanco</p>', this.iconoError);
        return false;
      }

      if (data.pais_id == "-1") {
        await this.mostrarMensaje('<p>Digite un pais valido</p>', this.iconoError);
        return false;
      }

      let respuesta = await this.llamadaGenerica(data, "procesando...", "seguridad/perfil-actualizar");

      if (respuesta.success) {
        await this.mostrarMensaje("<p>Se ha " + (idPerfil < 0 ? "creado" : "actualizado") + " correctamente el perfil. </p>", this.iconoSuccess);
        if (!esEditar) {
          this.sucursalesCargar();
          this.cargarPerfiles();
        }

        



      }
      else {
        await this.mostrarMensaje('<p>No se pudo procesar los datos</p>', this.iconoError);
      }


    } catch (e) {
      await this.mostrarMensaje('<p>Ha sucedido el siguiente error mientras guardabamos los datos: ' + e.toString() + '</p>', this.iconoError);
    }


  }

  async nuevoPerfil() {
    this.IdGlobalSeleccionado = "-1";
    this.limpiarForm();


  }

  async limpiarForm()
  {
    await this.restablecerTreeMenu();
    this.inhabilitarElementoSimple("#_PaisPerfil", true);
    this.restablecerValorElemento("#_NombrePerfil");
    this.sucursalesCargar();
  }

  async eliminarModal() {
    if (this.IdGlobalSeleccionado != "") {
      if (parseInt(this.IdGlobalSeleccionado) >= 0) {
        await this.triggerClick("btnEliminarPerfil");
      }
    }
  }

  async restablecerTreeMenu()
  {
    let ids = [];
    $("#perfil_tree input[type='checkbox']").each(function myfunction() {
      if ($(this).prop("checked")) {
        ids.push($(this).attr("id"));
      }
    });

    for (var i = 0; i < ids.length; i++) {
      await this.triggerClick(ids[i]);
    }
  }

  async eliminarPerfil()
  {
   
    let respuestaEliminar = await this.llamadaGenerica({ perfil_id: parseInt(this.IdGlobalSeleccionado) }, "eliminando...", "seguridad/perfil-borrar");


      if (respuestaEliminar.success) {
        await this.mostrarMensaje("<p>Se ha eliminado el perfil correctamente</p>", this.iconoSuccess);
        await this.cargarPerfiles();

        this.sucursalesCargar(null);
        this.inhabilitarElementoSimple("#btnNuevo");
        await this.limpiarForm();
      }
      else {
        await this.mostrarMensaje("<p>No se ha podido eliminar el perfil, por favor, intente de nuevo</p>", this.iconoError);
      }
  }
  //*****************************UTILS*****************************************//


  inhabilitarElementoSimple(elemento, habilitar = false) {
    let elem = $(elemento);

    if (habilitar) {
      elem.removeClass("noHabilitado");
    }
    else {
      elem.addClass("noHabilitado");
    }
  }

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
      else if (element.is("input[type='email']")) {
        element.val("");
      }
      else if (element.is("textarea")) {
        element.val("");
      }

    } catch (e) {

    }
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


  setearValorElemento(elemento, valor) {

    var jqueryElement = $(elemento);

    if (!UtilApp.isNullOrUndefined(jqueryElement)) {
      jqueryElement.val(valor);
    }
    else {
      console.log("elemento invalido. Id = ", elemento);
    }
  }

  //*****************************UTILS*****************************************//

}



