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
import { IContrato } from '../../model/Parametros/InterfacesParametros';
import { ITablaManejo } from '../../model/Parametros/InterfacesParametros';

//Util
import * as XLSX from 'xlsx';
import { escapeLeadingUnderscores } from 'typescript';

@Component({
  selector: 'app-tablamanejo',
  templateUrl: './tablamanejo.component.html',
  styleUrls: ['./tablamanejo.component.html'],
})
export class TablamanejoComponent implements OnInit, OnDestroy, AfterViewInit {
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


  columnsMultiPais = [
    { name: 'desde', prop: 'desde' },
    { name: 'hasta', prop: 'hasta' },
    { name: 'valor', prop: 'valor' },
    { name: 'porcentaje', prop: 'porcentaje' }];


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
  contratos: ITablaManejo[];
  contratosModificar: ITablaManejo[];
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
    
    this.cargarTablasManejo();
  }

  ngOnDestroy(): void {
    
  }

  empresaAgregar() {

  }

  sucursalAgregar() {

  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();

    this.cargarPais();
  }



  async selectEmpresa({ selected }) {
    const empresa = selected[0];
    this.empresa.id = empresa.id;
    this.empresa.name = empresa.name;
    if (this.id === empresa.id) {
      this.isselected = false;
    } else {
      this.isselected = true;
      let empresasParse: IEmpresa[];
      empresasParse = [];
      this.overlays.message = 'Buscando sucursales...';
      this.overlayService.show(this.overlays);
      this.url = AppConfigService.settings.server + 'parametros/sucursales';
      this.jdata = { jdata: { empresa_id: empresa.id }, jSessionId: this.user.token };
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
        JSON.parse(this.resultado.values).forEach((a, b) => {
          empresasParse.push({
            id: a[0],
            name: a[1],
          });
        });
        this.sucursales = empresasParse;
        this.overlayService.show(this.overlaysHide);
        this.refresh('#sucursalTable', 'dtTriggerSucursal');
      } else {
        this.overlayService.show(this.overlaysHide);
      }
    }
    this.id = empresa.id;
    
  }


  async cargarPais()
  {
    //SE CARGA OBJETO DE PAISES
    let paisesParse: IPais[];
    paisesParse = [];
    this.overlays.message = 'Buscando paises...';
    this.overlayService.show(this.overlays);
    this.url = AppConfigService.settings.server + 'parametros/paises';
    this.jdata = { jdata: {}, jSessionId: this.user.token };
    this.data = 'jdata=' + encodeURIComponent(JSON.stringify(this.jdata));
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      }),
    };
    await this.servPais.ObtenerPaises(this.data, this.url, httpOptions)
      .then((result: []) => this.resultado = result)
      .catch(catchError(this.handleError));
    if (this.util.vResultado(this.resultado)) {
      JSON.parse(this.resultado.values).forEach((a, b) => {
        paisesParse.push({
          id: a[0],
          nombre: a[1],
        });
      });
      this.paises = paisesParse;

      this.overlayService.show(this.overlaysHide);
      this.refresh('#sucursalTable', 'dtTriggerSucursal');


    } else {
      this.overlayService.show(this.overlaysHide);
    }

  }

  async cargarTablasManejo()
  {
    this.userNameCookie = this.cookieService.get('username') === '' ? null : this.cookieService.get('username'); // To Get Cookie
    if (this.userNameCookie === '' || UtilApp.isNullOrUndefined(this.userNameCookie) || this.user.token === '') {
      this.redirectLogin();
    } else {
      let empresasParse: IEmpresa[];
      empresasParse = [];
      this.overlayService.show(this.overlays);
      debugger;
      this.url = AppConfigService.settings.server + 'parametros/manejos';
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
        console.log(JSON.parse(this.resultado.values));
        JSON.parse(this.resultado.values).forEach((a, b) => {
          empresasParse.push({
            id: a.id,
            name: a.nombre,
          });
        });
        this.empresas = empresasParse;
        this.overlayService.show(this.overlaysHide);
      } else {
        this.overlayService.show(this.overlaysHide);
      }
    }
  }

  refresh(selector: string, trigger: string) {
    this.dtElements.forEach((dtElement: DataTableDirective) => {
      dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        if (dtInstance.table(selector).node() !== undefined) {
          dtInstance.destroy();
          this[trigger].next();
        }
      });
    });
  }


  public onDetailsClick(): void {
    alert('example');
    console.log('exampleee')
  }

  async editarZona(zona) {

    try {
      
      const zonaId = zona.id;
      let productosParse: IZona[];
      productosParse = [];
      this.overlays.message = 'Cargando zona...';
      this.overlayService.show(this.overlays);
      this.url = AppConfigService.settings.server + 'parametros/zona-cargar';
      this.jdata = { jdata: { zona_id: zonaId }, jSessionId: this.user.token };
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
        let values = JSON.parse(this.resultado.values);

        this.zonaObject.zonaId = values["id"];
        this.zonaObject.zonaNombre = values['nombre'];
        this.zonaObject.zonaPais = this.paises.findIndex(x => x.id === values['codigoPais']);
        this.zonaObject.zonaDescripcion = values["descripcion"];
        this.overlayService.show(this.overlaysHide);

      } else {
        this.overlayService.show(this.overlaysHide);
      }
    } catch (e) {
      this.mostrarMensaje('<p>Ha sucedido un error mientras procesabamos la solicitud,' +
        'si este mensaje persiste por favor contacte a TI </p>', this.iconoError);
        this.overlayService.show(this.overlaysHide);
    }


  }

  Manejoid = "";
  levantarModalTablaManejo()
  {
    this.Manejoid = "";
    this.limpiarData();
  }



  file: any;
  arrayBuffer: any;
  dataExcel: any;

  /// metodo para leer un excel
  async addfile(event) {
    this.file = event.target.files[0];

    if (this.file.name.split('.').pop() != "xlsx") {
      await this.mostrarMensaje("<p>Solo se permite un archivo excel</p>", this.iconoError);
      return false;
    }


    try {
      let fileReader = new FileReader();
      fileReader.readAsArrayBuffer(this.file);
      fileReader.onload = (e) => {
        this.arrayBuffer = fileReader.result;
        var data = new Uint8Array(this.arrayBuffer);
        var arr = new Array();
        for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
        var bstr = arr.join("");
        var workbook = XLSX.read(bstr, { type: "binary" });

        var first_sheet_name = workbook.SheetNames[0];
        var worksheet = workbook.Sheets[first_sheet_name];
        this.dataExcel = XLSX.utils.sheet_to_json(worksheet, { raw: true });
        this.llenarTablaExcel(true);

      }
    } catch (e) {
      let tablaContratos: ITablaManejo[];
      tablaContratos = [];
      this.contratos = tablaContratos;
      this.refresh('#MutiPaisTable', 'dtTrigger');
      await this.mostrarMensaje("<p>Ha ocurrido un error procesando el archivo</p>", this.iconoError);
    }

  }


  llenarTablaExcel(esArchivo) {
    let tablaContratos: ITablaManejo[];
    tablaContratos = [];

    if (esArchivo) {
      for (var i = 0; i < this.dataExcel.length; i++) {
        tablaContratos.push(
          {
            desde: this.dataExcel[i].desde,
            hasta: this.dataExcel[i].hasta,
            valor: this.dataExcel[i].valor,
            porcentaje: this.dataExcel[i].porcentaje

          });
      }
    }
    else {
      for (var i = 0; i < this.dataExcel.length; i++) {
        tablaContratos.push(
          {
            desde: this.dataExcel[i][0],
            hasta: this.dataExcel[i][1],
            valor: this.dataExcel[i][2],
            porcentaje: this.dataExcel[i][3]

          });
      }
    }

    this.contratos = tablaContratos;
    this.contratosModificar = tablaContratos;
    this.refresh('#MercaderiaTable', 'dtTrigger');
  }





  async actualizarTablaManejo() {

    let tablaManejoNombre = $("#tablaManejoNombre").val();

    if (tablaManejoNombre == "") {
      await this.mostrarMensaje('<p>Digite el nombre por favor</p>', this.iconoError);
      return false;
    }


    let lineas = [];

    $(this.contratosModificar).each(function (i, v) {
      lineas.push([v["hasta"], v["valor"], v["porcentaje"]])
    });


    let respuestaGuardado = await this.llamadaGenerica({ "manejo_id": this.Manejoid, "nombre": tablaManejoNombre, "lineas": lineas}, "guardando...", "parametros/manejo-actualizar");

    if (respuestaGuardado.success) {
      this.triggerClick("BtnCerrarModalTablaManejo");
      this.cargarTablasManejo();
    }
    else {
      await this.mostrarMensaje('<p>No se pudo completar el proceso.</p>', this.iconoError);
    }





  }


  async levantarPopUpEdicion(request)
  {

    this.limpiarData();

    let id = request.id;

    let respuestaCargado = await this.llamadaGenerica({ manejo_id: id }, "cargando data...", "parametros/manejo-cargar");

    if (respuestaCargado.success) {


      console.log("levantarPopUpEdicion", respuestaCargado);
      let values = respuestaCargado.Data;


      this.Manejoid = values['id'];
      $("#tablaManejoNombre").val(values['nombre'] == null ? "" : values['nombre']);

      let lineas = values['lineas'];
      let array = [];
      for (var i = 0; i < lineas.length; i++) {
        array.push(
          {
            desde: lineas[i].desde,
            hasta: lineas[i].hasta,
            porcentaje: lineas[i].porcentaje,
            valor: lineas[i].valor,
          });
      }

      this.dataExcel = array;
      this.llenarTablaExcel(true);

    }
    else {
      await this.mostrarMensaje('<p>No se ha podido cargar los datos</p>', this.iconoError);
    }




  }


  async llamadaGenerica(data, mensajeOverlay,nombreMetodo)
  {
    var objetoRespuesta =
    {
      success: false,
      Data: {}
    };
    this.overlays.message = mensajeOverlay;
    this.overlayService.show(this.overlays);
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
      objetoRespuesta.Data = JSON.parse(this.resultado.values);
    } else {
      objetoRespuesta.success = false;
      this.overlayService.show(this.overlaysHide);
    }

    return objetoRespuesta;
  }

  async LevantarPopUpEliminar(request) {
    debugger;
    this.Manejoid = request.id;
    this.triggerClick("btnEliminarTablaManejo");
  }


  async eliminarTablaManejo() {

    let id = parseInt(this.Manejoid == "" ? "-1" : this.Manejoid);

    if (id < 0) {
      await this.mostrarMensaje("<p>Ha ocurrido un error al eliminar el registro. Por favor, refresque la pagina e intente de nuevo</p>", this.iconoError);
      return;
    }


    let respuestaEliminado = await this.llamadaGenerica({ "manejo_id": id }, "eliminando...", "parametros/manejo-borrar");

    if (respuestaEliminado.success) {
      this.cargarTablasManejo();
      this.triggerClick("BtnCerrarModalEliminar");
    }
    else {
      await this.mostrarMensaje("<p>No se pudo borrar la tabla de manejo, esta siendo usado!</p>", this.iconoError);
    }

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
    this.mostrarMensaje('<p>Ha sucedido el siguiente error: ' + errorMessage+'</p>', this.iconoError);
    console.log(errorMessage);
    return throwError(errorMessage);
  }

  
  async mostrarMensaje(htmlMostrar, icono = 'Success')
  {
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

  triggerClick(idElementoHTML)
  {
    let boton: HTMLElement = document.getElementById(idElementoHTML) as HTMLElement;
    boton.click();
  }


 async limpiarData()
 {
   let tablaContratos: ITablaManejo[];
   tablaContratos = [];
   this.contratos = tablaContratos;
   this.refresh('#MutiPaisTable', 'dtTrigger');

   $("#inputExcel").val("");
   $("#tablaManejoNombre").val("");

 }


}
