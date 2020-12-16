import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { AfterViewInit, Component, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { DataTableDirective } from 'angular-datatables';
import { CookieService } from 'ngx-cookie-service';
import { Subject, throwError } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { AppConfigService } from '../../app-configuration.service';
import { MessageService } from '../../message.service';
// Modelo
import { IOverlay } from '../../model/IOverlay';
import { IMessage } from '../../model/message';
import { IEmpresaResponse } from '../../model/Parametros/Empresas/EmpresaResponse';
import { IEmpresa } from '../../model/Parametros/Empresas/IEmpresa';
import { IManejo } from '../../model/Parametros/Empresas/IManejo';
import { IManejo2 } from '../../model/Parametros/Empresas/IManejo2';
import { IMercaderia } from '../../model/Parametros/Empresas/IMercaderia';
import { ISeguro } from '../../model/Parametros/Empresas/ISeguro';
import { IPais } from '../../model/Parametros/Productos/IPais';
import { Usuario } from '../../model/Usuario';
import { OverlayService } from '../../overlay.service';
import { EmpresasService } from '../../Servicios/Parametros/Empresas/empresas.service';
import { PaisesService } from '../../Servicios/Parametros/Paises/paises.service';
// Servicios
import { UsuarioService } from '../../usuario.service';
import { UtilApp } from '../../Util/util';
import { IZona } from '../../model/Parametros/Zonas/IZona';
import { escapeLeadingUnderscores } from 'typescript';
@Component({
  selector: 'app-ejecutivos',
  templateUrl: './ejecutivos.component.html',
  styleUrls: ['./ejecutivos.component.html'],
})
export class EjecutivosComponent implements OnInit, OnDestroy, AfterViewInit {
  paises: IPais[] = [];

  @ViewChildren(DataTableDirective)
  dtElements: QueryList<DataTableDirective>;
  util: UtilApp = new UtilApp(this.servMessage);
  private destroy$: Subject<void> = new Subject<void>();
  bntIdBotonModalTrigger = 'BtnMostrarModal';
  iconoSuccess = 'Success';
  iconoError = 'Error';
  // Properties table empresa ngx
  ColumnMode = ColumnMode;
  loadingIndicator = true;
  reorderable = true;
  SelectionType = SelectionType;
  columnsEmpresa = [
    { name: 'ID', prop: 'id' },
    { name: 'Empresa', prop: 'name' },
    { name: 'Editar' },
    { name: 'Eliminar' }];

  selected = [];

  editField: string;
  message: IMessage = {};
  idfalso = 0;
  objetoDetalle = {};
  falsoFila: {} = {
    id: 0,
    codigoPais: 0,
    empresa: 0,
    desde: 0,
    hasta: 0,
    costo: 0,
    valor: false,
  };
  dtOptions: DataTables.Settings = {};
  isselected = false;
  id = 0;
  dtTrigger: Subject<any> = new Subject();
  jdata: {};
  data = '';
  resultado: any;
  empresas: IEmpresa[];
  manejos: IManejo[];
  manejos2: IManejo2[];
  seguros: ISeguro[];
  mercaderias: IMercaderia[];
  empresa: IEmpresa = { id: 0, name: '' };
  sucursales: IEmpresa[];
  user: Usuario = new Usuario();
  url = '';
  userNameCookie: string = null;
  overlays: IOverlay = { message: 'Buscando zonas...', show: true };
  overlaysHide: IOverlay = { message: '', show: false };
  zonaObject =
    {
      zonaId: 0,
      zonaNombre: '',
      zonaPais: 0,
      zonaDescripcion: ''
    };
  zonaForm = new FormGroup({
    empresaid: new FormControl(),
    empresanombre: new FormControl(),
    empresacostoElaboracionGuia: new FormControl(),
    empresadescripcionCostoElaboracionGuia: new FormControl(),
    empresacargoFuel: new FormControl(),
    empresaexcepcionImpuesto: new FormControl(),
    empresacargoTarjeta: new FormControl(),
    empresaexcepcionImpuestoAdicional: new FormControl(),
    zonaNombre: new FormControl(),
    paisnombre: new FormControl(),
    descripcionZona: new FormControl(),
    zonaId: new FormControl()
  });

  method = "PUT";

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

  onSelect({ selected }) {
    console.log('Select Event', selected, this.selected);
  }

  onActivate(event) {
    console.log('Activate Event', event);
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

    this.cargarEjecutivos();
  }

  ngOnDestroy(): void {

  }


  ngAfterViewInit(): void {
    this.dtTrigger.next();

    this.cargarDropDown("#_PaisSelect", "parametros/paises", { value: 0, text: 1, secondText: null }, "", "");
  }



  /*********CARGA DE DATA*************/


  ocultarCampos(): void {
    this.inhabilitarElementoSimple(".paises", true);
    $(".pais-nuevo").hide("slow");
  }

  mostrarCampos(): void {
    this.inhabilitarElementoSimple(".paises", false);
    $(".pais-nuevo").show("slow");
  }



  async cargarEjecutivos() {
    debugger;
    this.userNameCookie = this.cookieService.get('username') === '' ? null : this.cookieService.get('username'); // To Get Cookie
    if (this.userNameCookie === '' || UtilApp.isNullOrUndefined(this.userNameCookie) || this.user.token === '') {
      this.redirectLogin();
    } else {
      let empresasParse: IEmpresa[];
      empresasParse = [];
      this.overlayService.show(this.overlays);

      this.url = AppConfigService.settings.server + 'parametros/ejecutivos';
      this.jdata = { jdata: this.jdata, jSessionId: this.user.token };
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
        await console.log(this.resultado.values);
        JSON.parse(this.resultado.values).forEach((a, b) => {
          empresasParse.push({
            id: a[0],
            name: a[1] + " " + (a[2] == null ? "" : a[2]) + " " + (a[3] == null ? "" : a[3]),
          });
        });
        this.empresas = empresasParse;
        this.overlayService.show(this.overlaysHide);
      } else {
        this.overlayService.show(this.overlaysHide);
      }
    }
  }


  async editarMultiPais(request) {

    try {

      await this.limpiarData();
      this.mostrarCampos();
      let editarMultiPaisData = await this.llamadaGenerica(
        {
          "codigoPais": request.id
        },
        "cargando productos...",
        "config/multipais-cargar");

      if (editarMultiPaisData.success) {

        let values = editarMultiPaisData.Data;


        this.setearValorElemento("campanaApiKey", await this.validadorString(values["campanaApiKey"]));
        this.setearValorElemento("campanaPassword", await this.validadorString(values["campanaPassword"]));
        this.setearValorElemento("campanaServer", await this.validadorString(values["campanaServer"]));
        this.setearValorElemento("campanaUsuario", await this.validadorString(values["campanaUsuario"]));

        this.seleccionarOptionSelect("#_PaisSelect", values["codigoPais"]);
        this.seleccionarOptionSelect("#contratoAereoSelect", values["contratoAereo"]);
        this.seleccionarOptionSelect("#contratoEconomySelect", values["contratoEconomy"]);
        this.seleccionarOptionSelect("#contratoGoldSelect", values["contratoGold"]);
        this.seleccionarOptionSelect("#manejoDefaultSelect", values["manejoDefault"]);
        this.seleccionarOptionSelect("#productoAgenciaAduanalSelect", values["productoAgenciaAduanal"]);
        this.seleccionarOptionSelect("#productoPOBoxSelect", values["productoPOBox"]);


        this.setearValorElemento("miamiDireccion1", await this.validadorString(values["miamiDireccion1"]));
        this.setearValorElemento("miamiDireccion1A", await this.validadorString(values["miamiDireccion1A"]));
        this.setearValorElemento("miamiDireccion2", await this.validadorString(values["miamiDireccion2"]));

        // this.validarCheckCheckbox((values["mostrarContratoEconomy"] == true ? true : false), "#mostrarContratoEconomy");

        if ((values["mostrarContratoEconomy"] == true ? true : false)) {
          $("#mostrarContratoEconomy").trigger("click");
        }



        this.setearValorElemento("sufijo", await this.validadorString(values["sufijo"]));

        var tarjetas = (await this.validadorString(values["tarjetas"])).split(",");

        if (tarjetas.length > 0) {
          for (var i = 0; i < tarjetas.length; i++) {
            if (tarjetas[i] != "") {
              $("#" + tarjetas[i]).trigger("click");
            }
          }
        }



        this.setearValorElemento("textoCedulaJuridica", await this.validadorString(values["textoCedulaJuridica"]));
        this.setearValorElemento("textoDivision0", await this.validadorString(values["textoDivision0"]));
        this.setearValorElemento("textoDivision1", await this.validadorString(values["textoDivision1"]));
        this.setearValorElemento("zonasBloqueadas", await this.validadorString(values["zonasBloqueadas"]));









        this.method = "POST";
        this.triggerClick('buttonEditarMultiPais');

      }
      else {
        await this.mostrarMensaje("<p>No se han podido cargar los datos del multi pais </p>", this.iconoError);
      }

    } catch (e) {
      await this.mostrarMensaje('<p>Ha sucedido un error mientras procesabamos la solicitud,' +
        'si este mensaje persiste por favor contacte a TI </p>', this.iconoError);
    }


  }

  async LevantarPopUpEliminar(request) {
    this.EjecutivoId = request.id;
  }

  async eliminarEjecutivo() {

    let id = parseInt((this.EjecutivoId == "" ? "-1" : this.EjecutivoId)); 


    if (id < 0) {
      await this.mostrarMensaje("<p>Ha ocurrido un error al eliminar el registro. Por favor, refresque la pagina e intente de nuevo</p>", this.iconoError);
      return;
    }


    let respuestaEliminado = await this.llamadaGenerica({ "ejecutivo_id": id }, "eliminando...", "parametros/ejecutivo-borrar");

    if (respuestaEliminado.success) {
      this.cargarEjecutivos();
      this.triggerClick("BtnCerrarModalEliminar");
    }
    else {
      await this.mostrarMensaje("<p>No se pudo borrar el ejecutivo, esta siendo usado!</p>", this.iconoError);
    }

  }


  /*********CARGA DE DATA*************/




  EjecutivoId = "";
  levantarModalAgregar(): void {
    this.EjecutivoId = "";
    this.limpiarData();
  }


  async levantarModalEditar(request) {
    this.limpiarData();
    this.EjecutivoId = request.id;


    var respuestaCargar = await this.llamadaGenerica({ "ejecutivo_id": this.EjecutivoId }, "cargando datos...", "parametros/ejecutivo-cargar");

    if (respuestaCargar.success) {

      let values = respuestaCargar.Data;
      this.setearValorElemento("#Nombre", values[2]);
      this.setearValorElemento("#PrimerApellido", values[3]);
      this.setearValorElemento("#SegundoApellido", values[4]);
      this.seleccionarOptionSelect("#_PaisSelect", values[1]);

    }
    else {
      await this.mostrarMensaje("<p>No se ha podido obtener los datos del registro</p>", this.iconoError);
    }


    


  }

  //Para enviar a guardar
  async actualizarEjecutivo() {
    try {


      var data = {};
      data["ejecutivo_id"] = this.EjecutivoId;
      // $(`div.${pa_pagina} input, div.${pa_pagina} select, div.${pa_pagina} textarea`).each(function () {
      $("#ContentModalEjecutivo select,#ContentModalEjecutivo input,#ContentModalEjecutivo textarea").each(function () {
        let elemento = $(this);
        let value = null;
        try {

          if (elemento.is("select")) {
            value = elemento.find("option:selected").eq(0).val();
          }
          else if (elemento.is("input[type='checkbox']")) {
            value = elemento.prop("checked");
          }
          else if (elemento.is("input[type='text']")) {
            value = elemento.val();
          }
          else if (elemento.is("input[type='email']")) {
            value = elemento.val();
          }
          else if (elemento.is("input[type='date']")) {
            value = elemento.val();
          }
          else if (elemento.is("textarea")) {
            value = elemento.val();
          }
        } catch (e) { value = null; }



        if (UtilApp.isNullOrUndefined(value)) {
          value = null;
        }

        let dataff = elemento.attr("data-ff");

        if (!UtilApp.isNullOrUndefined(dataff)) {
          data[elemento.attr("data-ff")] = value;
        }


      });



      if (data["nombre"].trim() == "") {
        await this.mostrarMensaje("<p>Ingrese el nombre del ejecutivo!</p>", this.iconoError);
        return;
      }

      var resultado = await this.llamadaGenerica(data, "guardando datos...", "parametros/ejecutivo-actualizar");


      if (resultado.success) {
        this.cargarEjecutivos();
        this.triggerClick("BtnCerrarModal");
        this.limpiarData();
      }
      else {
        await this.mostrarMensaje("<p>No se ha podido actualizar los datos</p>", this.iconoError);
      }


    } catch (e) {
      await this.mostrarMensaje("<p>Ha ocurrido un error en el proceso. Por favor, contacte a TI</p>", this.iconoError);
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

    let contenedor: HTMLElement = document.getElementById('bodyModalContainer') as HTMLElement;
    contenedor.innerHTML = htmlMostrar;

    let contenedorIcono: HTMLElement = document.getElementById('iconBoxBody') as HTMLElement;
    contenedorIcono.innerHTML = iconoausar;

    let contenedorHeader: HTMLElement = document.getElementById('headerBody') as HTMLElement;
    contenedorHeader.style.backgroundColor = (icono == this.iconoError ? iconos.colorError : iconos.colorSuccess);

    this.triggerClick(this.bntIdBotonModalTrigger);

  }

  triggerClick(idElementoHTML) {
    let boton: HTMLElement = document.getElementById(idElementoHTML) as HTMLElement;
    boton.click();
  }


  async limpiarData() {
    $("#ContentModalEjecutivo select,#ContentModalEjecutivo input,#ContentModalEjecutivo textarea").each(function () {

      let element = $(this);

      if (element.is("select")) {
        element.prop("selectedIndex", 0);
      }
      else if (element.is("input[type='checkbox']")) {

        if (element.prop("checked")) {
          element.trigger("click");
        }

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



    });



  }


  //************************************** Metodo de carga de dropDown ************************************//

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


  //************************************** Metodo de carga de dropDown ************************************//


  //*****************************UTILS*****************************************//



  setearValorElemento(elemento: string, valor) {


    if (!elemento.startsWith("#")) {
      elemento = "#" + elemento;
    }

    var jqueryElement = $(elemento);

    if (!UtilApp.isNullOrUndefined(jqueryElement)) {
      jqueryElement.val(valor);
    }
    else {
      console.log("elemento invalido. Id = ", elemento);
    }
  }


  private obtenerElementoHTML(idElementoHTML): HTMLElement {
    let elemento: HTMLElement = document.getElementById(idElementoHTML) as HTMLElement;
    return elemento;
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


  inhabilitarElementoSimple(elemento, habilitar = false) {
    let elem = $(elemento);

    if (habilitar) {
      elem.removeClass("noHabilitado");
    }
    else {
      elem.addClass("noHabilitado");
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



  restablecerValorElemento(elemento): void {

    try {

      let element = $(elemento);

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



  //*****************************UTILS*****************************************//


}
