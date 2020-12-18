import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { AfterViewInit, Component, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { ColumnMode, SelectionType  } from '@swimlane/ngx-datatable';
import { DataTableDirective } from 'angular-datatables';
import { CookieService } from 'ngx-cookie-service';
import { Subject, throwError } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { ISucursal } from '../../model/Parametros/Empresas/ISucursal';
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
import { Usuario } from '../../model/Usuario';
import { OverlayService } from '../../overlay.service';
import { EmpresasService } from '../../Servicios/Parametros/Empresas/empresas.service';
// Servicios
import { UsuarioService } from '../../usuario.service';
import { UtilApp } from '../../Util/util';
import { IZona } from '../../model/Parametros/Zonas/IZona';
import { IPais } from '../../model/Parametros/Productos/IPais';
@Component({
  selector: 'app-empresa',
  templateUrl: './empresas.component.html',
  styleUrls: ['./empresas.component.html'],
})
export class EmpresasComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<DataTableDirective>;
  util: UtilApp = new UtilApp(this.servMessage);
  private destroy$: Subject<void> = new Subject<void>();
  // Properties table empresa ngx
  ColumnMode = ColumnMode;
  loadingIndicator = true;
  reorderable = true;
  SelectionType = SelectionType;
  bntIdBotonModalDosCerrarTrigger = 'BtnCerrarMercaderiaEdit';
  BtnCerrarSeguroMercaderiaEditTrigger = 'BtnCerrarSeguroMercaderiaEdit';
  BtnCerrarModalManejosEditTrigger = 'BtnCerrarModalManejosEdit'
  BtnCerrarModalManejo2EditTrigger = 'BtnCerrarModalManejo2Edit'
  BtnCerrarModalModalEditTrigger = 'BtnCerrarModalEdit'
  
  

  columnsEmpresa = [
    { name: 'ID', prop: 'id' },
    { name: 'Empresa', prop: 'name' },
    { name: 'Editar' },
    { name: 'Eliminar' }];
  // Properties table Sucursal ngx
  columnsSucursal = [
    { name: 'ID', prop: 'id' },
    { name: 'Sucursal', prop: 'name' },
    { name: 'Editar' },
    { name: 'Eliminar' }];
  // Properties table mercaderia ngx
  columnsMercaderia = [
    { name: 'desde', prop: 'desde' },
    { name: 'hasta', prop: 'hasta' },
    { name: 'costo', prop: 'costo' },
    { name: 'valor', prop: 'valor' }];
  // Properties table manejo ngx
  columnsManejo = [
    { name: 'desde', prop: 'desde' },
    { name: 'hasta', prop: 'hasta' },
    { name: 'costo', prop: 'costo' },
    { name: 'valor', prop: 'valor' }];
  // Properties table manejo2 ngx
  columnsManejo2 = [
    { name: 'desde', prop: 'desde' },
    { name: 'hasta', prop: 'hasta' },
    { name: 'costo', prop: 'costo' },
    { name: 'valor', prop: 'valor' }];
  // Properties table seguro ngx
  columnsSeguros = [
    { name: 'desde', prop: 'desde' },
    { name: 'hasta', prop: 'hasta' },
    { name: 'costo', prop: 'costo' },
    { name: 'valor', prop: 'valor' }];
  selected = [];
  dataEmpresa: {
    empresa_id: 0,
    manejo: IManejo[],
    manejo2: IManejo2[],
    mensajeria: IMercaderia[],
    seguros: ISeguro[],
    nombre: '',
    costoElaboracionGuia: '',
    descripcionCostoElaboracionGuia: '',
    cargoFuel: '',
    excepcionImpuesto: '',
    cargoTarjeta: '',
    excepcionImpuestoAdicional: '',
  };
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
  dtOptionsSucursal: DataTables.Settings = {};
  dtOptionsMercaderia: DataTables.Settings = {};
  dtOptionsManejos: DataTables.Settings = {};
  dtOptionsManejos2: DataTables.Settings = {};
  dtOptionsSeguros: DataTables.Settings = {};
  isselected = false;
  id = 0;
  dtTrigger: Subject<any> = new Subject();
  dtTriggerSucursal: Subject<any> = new Subject();
  dtTriggerMercaderia: Subject<any> = new Subject();
  dtTriggerManejos: Subject<any> = new Subject();
  dtTriggerManejos2: Subject<any> = new Subject();
  dtTriggerSeguros: Subject<any> = new Subject();
  dtLanguage: DataTables.LanguageSettings = {};
  jdata: {};
  data = '';
  resultado: any;
  empresas: IEmpresa[];
  paises: IPais[];
  provincias: IPais[];
  cantones: IPais[];
  zonas: IZona[];
  manejos: IManejo[];
  manejos2: IManejo2[];
  seguros: ISeguro[];
  mercaderias: IMercaderia[];
  objMerca: IMercaderia[];
  empresa: IEmpresa = { id: 0, name: '' };
  sucursales: ISucursal[];
  idEmpresa: number;
  objSucursal: ISucursal = {
    id: 0,
    descripcion: "",
    activa: false,
    fecha: '',
    email: '',
    codigoLetras: '',
    Zona: '',
    pais: '',
    provincia: '',
    canton: '',
    direccion: '',
    telefono: '',
    coordenadas: '',
    email2: '',
    direccionIps: '',
    horario: '',

  }
  bntIdBotonModalTrigger = 'BtnMostrarModal';
  iconoSuccess = 'Success';
  iconoError = 'Error';
  paisId: number;
  user: Usuario = new Usuario();
  url = '';
  sucursalNombre = '';
  userNameCookie: string = null;
  overlays: IOverlay = { message: 'Buscando empresas...', show: true };
  overlaysHide: IOverlay = { message: '', show: false };
  empresaForm = new FormGroup({
    empresaid: new FormControl(),
    empresanombre: new FormControl(),
    empresacostoElaboracionGuia: new FormControl(),
    empresadescripcionCostoElaboracionGuia: new FormControl(),
    empresacargoFuel: new FormControl(),
    empresaexcepcionImpuesto: new FormControl(),
    empresacargoTarjeta: new FormControl(),
    empresaexcepcionImpuestoAdicional: new FormControl(),
  });
  sucursalForm = new FormGroup({
    sucursalid: new FormControl(),
    sucursalnombre: new FormControl(),
    sucursalActiva: new FormControl(),
    sucursalFechaApertura: new FormControl(),
    sucursalEmail: new FormControl(),
    sucursalCodigoLetras: new FormControl(),
    sucursalZona: new FormControl(),
    sucursalPais: new FormControl(),
    sucursalProvincia: new FormControl(),
    sucursalCanton: new FormControl(),
    sucursalCordenadas: new FormControl(),
    sucursalDireccion: new FormControl(),
    sucursalTelefono: new FormControl(),
    sucursalEmaildos: new FormControl(),
    sucursalIps: new FormControl(),
    sucursalHorario: new FormControl(),
    sucursalFoto: new FormControl(),
    sucursalMapa: new FormControl()
  });


  mercaderiaKgForm = new FormGroup({
    mercaderiaKgDesde: new FormControl(),
    mercaderiaKgHasta: new FormControl(),
    mercaderiaKgCosto: new FormControl(),
    mercaderiaKgValor: new FormControl()
  });


  aduanasForm = new FormGroup({
    mercaderiaKgDesde: new FormControl(),
    mercaderiaKgHasta: new FormControl(),
    mercaderiaKgCosto: new FormControl(),
    mercaderiaKgValor: new FormControl()
  });

  aduanasDosForm = new FormGroup({
    mercaderiaKgDesde: new FormControl(),
    mercaderiaKgHasta: new FormControl(),
    mercaderiaKgCosto: new FormControl(),
    mercaderiaKgValor: new FormControl()
  });

  segurosMercaderiaForm = new FormGroup({
    mercaderiaKgDesde: new FormControl(),
    mercaderiaKgHasta: new FormControl(),
    mercaderiaKgCosto: new FormControl(),
    mercaderiaKgValor: new FormControl()
  });

  


  

  constructor(
    public router: Router,
    private servUser: UsuarioService,
    private cookieService: CookieService,
    private overlayService: OverlayService,
    private serv: EmpresasService,
    private servMessage: MessageService,
    private http: HttpClient,
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

    this.cargarZonas();
    this.cargarPais();

    // const httpOptions = {
    //  headers: new HttpHeaders({
    //    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    //  }),
    // };
    this.dtLanguage = {
      url: 'http://cdn.datatables.net/plug-ins/1.10.21/i18n/Spanish.json',
    };
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      language: this.dtLanguage,
      info: false,
      destroy: true,
      data: this.empresas,
      deferRender: true,
    };
    this.dtOptionsSucursal = {
      pagingType: 'full_numbers',
      pageLength: 10,
      language: this.dtLanguage,
      info: false,
      destroy: true,
      data: this.sucursales,
      deferRender: true,
    };
    this.dtOptionsMercaderia = {
      pagingType: 'full_numbers',
      pageLength: 10,
      language: this.dtLanguage,
      info: false,
      responsive: true,
      destroy: true,
      data: this.mercaderias,
      deferRender: true,
    };
    // Manejos
    this.dtOptionsManejos = {
      pagingType: 'full_numbers',
      pageLength: 10,
      language: this.dtLanguage,
      info: false,
      responsive: true,
      destroy: true,
      data: this.manejos,
      deferRender: true,
    };
    // Seguros
    this.dtOptionsSeguros = {
      pagingType: 'full_numbers',
      pageLength: 10,
      language: this.dtLanguage,
      info: false,
      responsive: true,
      destroy: true,
      data: this.seguros,
      deferRender: true,
    };

    this.userNameCookie = this.cookieService.get('username') === '' ? null : this.cookieService.get('username'); // To Get Cookie
    if (this.userNameCookie === '' || UtilApp.isNullOrUndefined(this.userNameCookie) || this.user.token === '') {
      this.redirectLogin();
    } else {
      let empresasParse: IEmpresa[];
      empresasParse = [];
      this.overlayService.show(this.overlays);
      this.url = AppConfigService.settings.server + 'parametros/empresas';
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
        JSON.parse(this.resultado.values).forEach((a, b) => {
          empresasParse.push({
            id: a[0],
            name: a[1],
          });
        });
        this.empresas = empresasParse;
        this.overlayService.show(this.overlaysHide);
      } else {
        this.overlayService.show(this.overlaysHide);
      }
    }
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
    this.dtTriggerManejos.unsubscribe();
    // this.dtTriggerManejos2.unsubscribe();
    this.dtTriggerMercaderia.unsubscribe();
    this.dtTriggerSeguros.unsubscribe();
    this.dtTriggerSucursal.unsubscribe();

    this.dtTriggerManejos2.next();
    this.dtTriggerManejos2.complete();
    // to prevent leak memory
    this.destroy$.next();
    this.destroy$.complete();
  }

  async empresaAgregar() {

    this.empresa.id = 0;
    this.empresa.costoElaboracionGuia = "";
    this.empresa.descripcionCostoElaboracionGuia = "";
    this.empresa.cargoFuel = "";
    this.empresa.excepcionImpuesto = "";
    this.empresa.cargoTarjeta = "";
    this.empresa.excepcionImpuestoAdicional = "";
    this.empresa.name = "";

    this.manejos = [];
    this.manejos2 = [];
    this.seguros = [];
    this.mercaderias = [];
    await this.triggerClick("levantarAgregarEmpresaModal");

  }

  setearValorElemento(elemento: string, valor) {

    if (!elemento.startsWith("#") && !elemento.startsWith(".")) {
      elemento = "#" + elemento;
    }


    let jqueryElement = $(elemento);

    if (!UtilApp.isNullOrUndefined(jqueryElement)) {
      jqueryElement.val(valor);
    }
    else {
      console.log("elemento invalido. Id = ", elemento);
    }
  }


  async limpiarData() {
    this.objSucursal.id = 0;
    this.objSucursal.activa = false;
    this.objSucursal.canton = '';
    this.objSucursal.codigoLetras = '';
    this.objSucursal.coordenadas = '';
    this.objSucursal.descripcion = '';
    this.objSucursal.direccion = '';
    this.objSucursal.direccionIps = '';
    this.objSucursal.email = '';
    this.objSucursal.email2 = '';
    this.objSucursal.fecha = '';
    this.objSucursal.horario = '';
    this.objSucursal.id = 0;
    this.objSucursal.pais = '';
    this.objSucursal.provincia = '';
    this.objSucursal.telefono = '';
    this.objSucursal.Zona = '';
  }

  sucursalAgregar() {

  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
    this.dtTriggerSucursal.next();
    this.dtTriggerMercaderia.next();
    // Manejos
    this.dtTriggerManejos.next();
    // Manejos2
    this.dtTriggerManejos2.next();
    // Seguros
    this.dtTriggerSeguros.next();
  }

  async cargarPais() {
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
    await this.serv.ObtenerSucursales(this.data, this.url, httpOptions)
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

  async cargarZonas() {
    this.userNameCookie = this.cookieService.get('username') === '' ? null : this.cookieService.get('username'); // To Get Cookie
    if (this.userNameCookie === '' || UtilApp.isNullOrUndefined(this.userNameCookie) || this.user.token === '') {
      this.redirectLogin();
    } else {
      let empresasParse: IZona[];
      empresasParse = [];
      this.overlayService.show(this.overlays);
      
      this.url = AppConfigService.settings.server + 'parametros/zonas';
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
            id: a[0],
            nombre: a[1],
            costoElaboracionGuia: "",
            descripcionCostoElaboracionGuia: "",
            cargoFuel: "",
            cargoTarjeta: "",
            excepcionImpuesto: "",
            excepcionImpuestoAdicional: ""
          });
        });
        this.zonas = empresasParse;
        this.overlayService.show(this.overlaysHide);
      } else {
        this.overlayService.show(this.overlaysHide);
      }
    }
  }

  async selectEmpresa({ selected }) {
    const empresa = selected[0];
    this.idEmpresa = empresa.id;
    this.empresa.id = empresa.id;
    this.empresa.name = empresa.name;
    if (this.id === empresa.id) {
      this.isselected = false;
    } else {
      this.isselected = true;
      let empresasParse: ISucursal[];
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
            descripcion: a[1],
            activa: false,
            fecha: '',
            email: '',
            codigoLetras: '',
            Zona: '',
            pais: '',
            provincia: '',
            canton: '',
            direccion: '',
            telefono: '',
            coordenadas: '',
            email2: '',
            direccionIps: '',
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

  async editarEmpresa(empresa) {
    // Manejos2
    // Manejos 2
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      }),
    };
    this.dtOptionsManejos2 = {
      pagingType: 'full_numbers',
      pageLength: 10,
      language: this.dtLanguage,
      // select: true,
      info: false,
      responsive: true,
      destroy: true,
      ordering: false,
      searching: false,
      //data: this.manejos2,
      deferRender: true,
      serverSide: true,
      processing: true,
      scrollY: '200',
      ajax: async (dataTablesParameters: any, callback) => {
        
        await this.http
          .post<IEmpresaResponse>(
            this.url,
            this.data,
            httpOptions,
          )
          .pipe(takeUntil(this.dtTriggerManejos2))
          .subscribe((resp) => {
            this.manejos2 = JSON.parse(resp.values)['manejos2'];
            // this.refresh('#ManejosTable2', 'dtTriggerManejos2');
            setTimeout(function () {
              callback({
                draw: 10,
                recordsTotal: 40000,
                recordsFiltered: 40000,
                data: JSON.parse(resp.values)['manejos2'],
              });
            }, 50);
          });
      },
    };


    var respuesta = await this.llamadaGenerica({ empresa_id: empresa.id }, 'Detalles de empresa...', 'parametros/correo-empresa');

    if (respuesta.success) {
      this.objetoDetalle = JSON.parse(this.resultado.values);
      this.empresa.id = this.objetoDetalle['empresa']['id'];
      this.empresa.name = this.objetoDetalle['empresa']['nombre'];
      this.empresa.costoElaboracionGuia = this.util.formatMonetario(this.objetoDetalle['costoElaboracionGuia']);
      this.empresa.descripcionCostoElaboracionGuia = this.objetoDetalle['descripcionCostoElaboracionGuia'];
      this.empresa.cargoFuel = this.util.formatMonetario(this.objetoDetalle['cargoFuel']);
      this.empresa.cargoTarjeta = this.util.formatMonetario(this.objetoDetalle['cargoTarjeta']);
      this.empresa.excepcionImpuesto = this.util.formatMonetario(this.objetoDetalle['excepcionImpuesto']);
      this.empresa.excepcionImpuestoAdicional = this.util.formatMonetario(this.objetoDetalle['excepcionImpuestoAdicional']);

      this.manejos = this.objetoDetalle['manejos'];
      this.manejos2 = this.objetoDetalle['manejos2'];
      this.seguros = this.objetoDetalle['seguros'];
      this.mercaderias = this.objetoDetalle['mensajeria'];
      this.triggerClick("levantareEdicionEmpresaModal");
    }
    else {
      await this.mostrarMensaje('<p>No se ha podido completar la operación </p>', this.iconoError);
    }
    debugger;
    this.construirTabla("#tbodyMercaderia_Edicion", this.mercaderias, "#tblMercaderiaEdicion");
    this.construirTabla("#tbodyManejoAduanas_Edicion", this.manejos, "#tblManejoAduanasEdicion");
    this.construirTabla("#tbodyManejoAduanasDos_Edicion", this.manejos2, "#TblManejoAduanasDosEdicion");
    this.construirTabla("#tbodySeguroMercaderia_Edicion", this.seguros, "#TblSeguroMercaderiaEdicion");









    //this.overlays.message = 'Detalles de empresa...';
    //this.overlayService.show(this.overlays);
    //this.url = AppConfigService.settings.server + 'parametros/correo-empresa';
    //this.jdata = { jdata: { empresa_id: empresa.id }, jSessionId: this.user.token };
    //this.data = 'jdata=' + encodeURIComponent(JSON.stringify(this.jdata));
    //debugger;
    //await this.serv.ObtenerSucursales(this.data, this.url, httpOptions)
    //  .then((result: []) => this.resultado = result)
    //  .catch(catchError(this.handleError));
    //if (this.util.vResultado(this.resultado)) {
    //  this.objetoDetalle = JSON.parse(this.resultado.values);
    //  this.empresa.id = this.objetoDetalle['empresa']['id'];
    //  this.empresa.name = this.objetoDetalle['empresa']['nombre'];
    //  this.empresa.costoElaboracionGuia = this.util.formatMonetario(this.objetoDetalle['costoElaboracionGuia']);
    //  this.empresa.descripcionCostoElaboracionGuia = this.objetoDetalle['descripcionCostoElaboracionGuia'];
    //  this.empresa.cargoFuel = this.util.formatMonetario(this.objetoDetalle['cargoFuel']);
    //  this.empresa.cargoTarjeta = this.util.formatMonetario(this.objetoDetalle['cargoTarjeta']);
    //  this.empresa.excepcionImpuesto = this.util.formatMonetario(this.objetoDetalle['excepcionImpuesto']);
    //  this.empresa.excepcionImpuestoAdicional = this.util.formatMonetario(this.objetoDetalle['excepcionImpuestoAdicional']);

    //  this.manejos = this.objetoDetalle['manejos'];
    //  this.manejos2 = this.objetoDetalle['manejos2'];
    //  this.seguros = this.objetoDetalle['seguros'];
    //  this.mercaderias = this.objetoDetalle['mensajeria'];
    //  this.triggerClick("levantareEdicionEmpresaModal");
    //} else {
    //  this.overlayService.show(this.overlaysHide);
    //}
    //this.construirTabla("#tbodyMercaderia_Edicion", this.mercaderias, "#tblMercaderiaEdicion");
    //this.construirTabla("#tbodyManejoAduanas_Edicion", this.manejos, "#tblManejoAduanasEdicion");
    //this.construirTabla("#tbodyManejoAduanasDos_Edicion", this.manejos2, "#TblManejoAduanasDosEdicion");
    //this.construirTabla("#tbodySeguroMercaderia_Edicion", this.seguros, "#TblSeguroMercaderiaEdicion");
  }

  eliminarEmpresa(empresa) {

  }

  async editarSucursal(sucursal) {
    
    let sucursalObject = await this.llamadaGenerica({ sucursal_id: sucursal.id }, "", "parametros/sucursal-cargar");
    this.objSucursal.id = sucursalObject.Data.id;
    this.objSucursal.descripcion = sucursalObject.Data.nombre;
    this.objSucursal.activa = sucursalObject.Data.activa;
    var fecha = new Date(sucursalObject.Data.fechaApertura);
    this.objSucursal.fecha = fecha.toString();
    this.objSucursal.email = sucursalObject.Data.soporte;
    this.objSucursal.Zona = this.zonas.findIndex(x => x.id === sucursalObject.Data.zonaDefault.id).toString();
    this.objSucursal.pais = this.paises.findIndex(x => x.id === sucursalObject.Data.codigoPais).toString();
    if (this.objSucursal.pais == "3") {
      this.paisId = sucursalObject.Data.codigoPais;
      await this.llenarProvincias(sucursalObject.Data.codigoPais);
      this.objSucursal.provincia = this.provincias.findIndex(x => x.id === sucursalObject.Data.direccion.divisionId).toString();
      await this.llenarCantones(this.objSucursal.provincia);
      this.objSucursal.canton = this.cantones.findIndex(x => x.id === sucursalObject.Data.direccion.subdivisionId).toString();
    }
    this.objSucursal.direccion = sucursalObject.Data.direccion.descripcion;
    this.objSucursal.telefono = sucursalObject.Data.direccion.telefono1;
    this.objSucursal.coordenadas = sucursalObject.Data.direccion.coordenadaGeografica;
    this.objSucursal.email2 = sucursalObject.Data.direccion.email1;
    this.objSucursal.direccionIps = sucursalObject.Data.direccionesIp;
    this.objSucursal.horario = sucursalObject.Data.horario;

  }

  async llenarProvincias(idPais) {
    //SE CARGA OBJETO DE PAISES
    let paisesParse: IPais[];
    paisesParse = [];
    this.overlays.message = 'Buscando provincias...';
    this.overlayService.show(this.overlays);
    this.url = AppConfigService.settings.server + 'parametros/divisiones';
    this.jdata = { jdata: { pais_id: idPais }, jSessionId: this.user.token };
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
        paisesParse.push({
          id: a[0],
          nombre: a[1],
        });
      });
      this.provincias = paisesParse;

      this.overlayService.show(this.overlaysHide);
      this.refresh('#sucursalTable', 'dtTriggerSucursal');


    } else {
      this.overlayService.show(this.overlaysHide);
    }

  }

  async llenarCantones(idProvincia) {
    //SE CARGA OBJETO DE PAISES
    let paisesParse: IPais[];
    paisesParse = [];
    this.overlays.message = 'Buscando cantones...';
    this.overlayService.show(this.overlays);
    this.url = AppConfigService.settings.server + 'parametros/subdivisiones';
    this.jdata = { jdata: { pais_id: this.paisId, division_id: idProvincia }, jSessionId: this.user.token };
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
        paisesParse.push({
          id: a[0],
          nombre: a[1],
        });
      });
      this.cantones = paisesParse;

      this.overlayService.show(this.overlaysHide);
      this.refresh('#sucursalTable', 'dtTriggerSucursal');


    } else {
      this.overlayService.show(this.overlaysHide);
    }

  }


  async changePais() {
   
    var selectedCountry = $("#paisnombre option:selected").val();
    if (selectedCountry == 188) {
      this.paisId = selectedCountry;
      await this.llenarProvincias(selectedCountry);
    }
    else {
      var selectedCountryAdd = $("#paisAddnombre option:selected").val();
      if (selectedCountryAdd == 188) {
        this.paisId = selectedCountryAdd;
        await this.llenarProvincias(selectedCountryAdd);
      }
    }
  }

  async changeProvincia() {
   
    var selectedCountry = $("#provincianombre option:selected").val();
    if (selectedCountry == undefined) {
      var selectedCountryAdd = $("#provinciaAddnombre option:selected").val();
      await this.llenarCantones(selectedCountryAdd);
    }
    else {
      await this.llenarCantones(selectedCountry);
    }
    
  }



  async llamadaGenerica(data, mensajeOverlay, nombreMetodo) {
    var objetoRespuesta =
    {
      success: false,
      Data: data
    };
    this.overlays.message = mensajeOverlay;
    this.overlayService.show(this.overlays);
    this.url = AppConfigService.settings.server + nombreMetodo;
    this.jdata = { jdata: data, jSessionId: this.user.token };
    this.data = 'jdata=' + encodeURIComponent(JSON.stringify(this.jdata));

    console.log(data);
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

  async guardarSucursal(sucursal) {
    debugger;
    var accion = "guardado";
    var idSucursal = this.sucursalForm.controls['sucursalid'].value == null ? sucursal.id : this.sucursalForm.controls['sucursalid'].value;
    var descripcion = this.sucursalForm.controls['sucursalnombre'].value == null ? sucursal.descripcion : this.sucursalForm.controls['sucursalnombre'].value;
    var activa = this.sucursalForm.controls['sucursalActiva'].value == null ? sucursal.activa : this.sucursalForm.controls['sucursalActiva'].value;
    var fecha = this.sucursalForm.controls['sucursalFechaApertura'].value == null ? sucursal.fecha : this.sucursalForm.controls['sucursalFechaApertura'].value;
    var email = this.sucursalForm.controls['sucursalEmail'].value == null ? sucursal.email : this.sucursalForm.controls['sucursalEmail'].value;
    var identificacionSucursal = this.sucursalForm.controls['sucursalCodigoLetras'].value == null ? sucursal.codigoLetras : this.sucursalForm.controls['sucursalCodigoLetras'].value;
    if (this.sucursalForm.controls['sucursalZona'].value == null) {
      var zona = this.zonas[sucursal.Zona].id;
    }
    else {
      var zona = parseInt(this.sucursalForm.controls['sucursalZona'].value);
    }
    //this.sucursalForm.controls['sucursalZona'].value == null ? sucursal.Zona : this.sucursalForm.controls['sucursalZona'].value;
    if (this.sucursalForm.controls['sucursalPais'].value == null) {
      var pais = this.paises[sucursal.pais].id;
    }
    else {
      var pais = parseInt(this.sucursalForm.controls['sucursalPais'].value);
    }
    //this.sucursalForm.controls['sucursalPais'].value == null ? sucursal.pais : this.sucursalForm.controls['sucursalPais'].value;
    if (this.sucursalForm.controls['sucursalProvincia'].value == null) {
      var provincia = this.provincias[sucursal.provincia].id;
    }
    else {
      var provincia = parseInt(this.sucursalForm.controls['sucursalProvincia'].value);
    }
    //this.sucursalForm.controls['sucursalProvincia'].value == null ? sucursal.provincia : this.sucursalForm.controls['sucursalProvincia'].value;
    if (this.sucursalForm.controls['sucursalCanton'].value == null) {
      var subDivicion = this.cantones[sucursal.canton].id;
    }
    else {
      var subDivicion = parseInt(this.sucursalForm.controls['sucursalCanton'].value);
    }
    //this.sucursalForm.controls['sucursalCanton'].value == null ? sucursal.canton : this.sucursalForm.controls['sucursalCanton'].value;
    var direccion = this.sucursalForm.controls['sucursalDireccion'].value == null ? sucursal.direccion : this.sucursalForm.controls['sucursalDireccion'].value;
    var telefono = this.sucursalForm.controls['sucursalTelefono'].value == null ? sucursal.telefono : this.sucursalForm.controls['sucursalTelefono'].value;
    var coordenadas = this.sucursalForm.controls['sucursalCordenadas'].value == null ? sucursal.coordenadas : this.sucursalForm.controls['sucursalCordenadas'].value;
    var emaildos = this.sucursalForm.controls['sucursalEmaildos'].value == null ? sucursal.email2 : this.sucursalForm.controls['sucursalEmaildos'].value;
    var direccionips = this.sucursalForm.controls['sucursalIps'].value == null ? sucursal.direccionIps : this.sucursalForm.controls['sucursalIps'].value;
    var horario = this.sucursalForm.controls['sucursalHorario'].value == null ? sucursal.horario : this.sucursalForm.controls['sucursalHorario'].value;
    



    var id = sucursal.id;
    var generarConsulta = true;
    var esEdicion = (id > 0 ? true : false);

    if (id > 0) {
      accion = "actualizado";
    }



    if ((descripcion == '' || descripcion == undefined || descripcion == null) && !esEdicion) {
      await this.mostrarMensaje("<p>Digite un nombre para la descripcion</p>", this.iconoError);
      generarConsulta = false;
    } else {


      if (!esEdicion) {
        let existeZona = this.sucursales.filter(function (sucursal) {
          return sucursal.descripcion == descripcion;
        }).length;


        if (existeZona > 0) {
          await this.mostrarMensaje("<p>La sucursal que intenta agregar ya existe</p>", this.iconoError);
          generarConsulta = false;
        }
      }

    }


    if (esEdicion && descripcion == null) {
      generarConsulta = false;
    }

    if (generarConsulta) {
      var data =
      {
        "empresa_id": this.idEmpresa,
        "sucursal_id": idSucursal,
        "descripcion": descripcion,
        "activa": activa,
        "fecha_apertura": fecha,
        "email_soporte": email,
        "identificacion_sucursal": identificacionSucursal,
        "zona_id": zona,
        "pais_id": pais,
        "division_id": provincia,
        "subdivision_id": subDivicion,
        "dir_descripcion": direccion,
        "dir_telefono1": telefono,
        "dir_coordenadas": coordenadas,
        "dir_email1": emaildos,
        "direcciones-ip": direccionips,
        "horario": horario
      };

      console.log(data);

      var respuesta = await this.llamadaGenerica(data, 'Actualizando Sucursal...', 'parametros/sucursal-actualizar');

      if (respuesta.success) {
        this.cargarSucursales();
        this.triggerClick('BtnCerrarModal');
        await this.limpiarData();
        await this.mostrarMensaje('<p>Se ha ' + accion + ' correctamente la sucursal ' + data.sucursal_id + '</p>', this.iconoSuccess);
      }
      else {
        await this.mostrarMensaje('<p>No se ha podido completar la operación </p>', this.iconoError);
      }

      //console.log(data);

      //this.overlays.message = 'Actualizando Zona...';
      //this.overlayService.show(this.overlays);
      //this.url = AppConfigService.settings.server + 'parametros/zona-actualizar';
      //this.jdata = { jdata: data, jSessionId: this.user.token };
      //this.data = 'jdata=' + encodeURIComponent(JSON.stringify(this.jdata));
      //const httpOptions = {
      //  headers: new HttpHeaders({
      //    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      //  }),
      //};
      //await this.serv.ObtenerSucursales(this.data, this.url, httpOptions)
      //  .then((result: []) => this.resultado = result)
      //  .catch(catchError(this.handleError));
      //if (this.util.vResultado(this.resultado)) {
      //  this.overlayService.show(this.overlaysHide);
      //  await this.cargarZonas();
      //  this.triggerClick('BtnCerrarModal');
      //  await this.limpiarData();
      //  await this.mostrarMensaje('<p>Se ha ' + accion + ' correctamente la zona ' + data.nombre + '</p>', this.iconoSuccess);
      //} else {
      //  this.overlayService.show(this.overlaysHide);
      //}
    }

  }

  async cargarDataeliminarSucursal(request) {
   
    let zonaObject = await this.llamadaGenerica({ sucursal_id: request.id }, "", "parametros/sucursal-cargar");
    this.objSucursal.descripcion = zonaObject.Data["nombre"];
    this.id = request.id;
  }

  async eliminar() {
   
    let respuestaEliminarZona = await this.llamadaGenerica({ sucursal_id: this.id }, "eliminando la sucursal " + this.objSucursal.descripcion, "parametros/sucursal-borrar");

    if (respuestaEliminarZona.success) {
      this.mostrarMensaje("Se ha eliminado correctamente la sucursal " + this.objSucursal.descripcion, this.iconoSuccess);
      this.cargarZonas();
    }
    else {
      await this.mostrarMensaje("No se ha podido eliminar la sucursal " + this.objSucursal.descripcion + ". Esta siendo usada.", this.iconoError);
    }

  }

  async cargarSucursales() {
    let empresasParse: ISucursal[];
    empresasParse = [];
    this.overlays.message = 'Buscando sucursales...';
    this.overlayService.show(this.overlays);
    this.url = AppConfigService.settings.server + 'parametros/sucursales';
    this.jdata = { jdata: { empresa_id: this.idEmpresa }, jSessionId: this.user.token };
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
          descripcion: a[1],
          activa: false,
          fecha: '',
          email: '',
          codigoLetras: '',
          Zona: '',
          pais: '',
          provincia: '',
          canton: '',
          direccion: '',
          telefono: '',
          coordenadas: '',
          email2: '',
          direccionIps: '',
        });
      });
      this.sucursales = empresasParse;
      this.overlayService.show(this.overlaysHide);
      this.refresh('#sucursalTable', 'dtTriggerSucursal');
    } else {
      this.overlayService.show(this.overlaysHide);
    }
  }

  async guardarEmpresa(empresa) {
    
    let isAllow = true;
    const dataEmpresa = {};
    $("#agregarEmpresaModal input[type='text']").each(function () {
      
      let value = $(this).val();
      const name = $(this).attr("name");

      if (UtilApp.isNullOrUndefined(value)) {
        value = "";
      }

      dataEmpresa[name] = value;

    });

    if (dataEmpresa["empresa_id"] <= "0" || dataEmpresa["empresa_id"] == "") {
      this.message.text = 'Ingrese el código de la empresa';
      this.message.type = 'Alert';
      isAllow = false;
      this.servMessage.showAlert(this.message);
    }
    if (dataEmpresa["nombre"].length === 0) {
      this.message.text = 'Ingrese el nombre de la empresa';
      this.message.type = 'Alert';
      isAllow = false;
      this.servMessage.showAlert(this.message);
    }
    if (isAllow) {
    
      dataEmpresa["seguros"] = this.seguros;
      dataEmpresa["manejo"] = this.manejos;
      dataEmpresa["manejo2"] = this.manejos2;
      dataEmpresa["mensajeria"] = this.mercaderias;


      

      var respuesta = await this.llamadaGenerica(dataEmpresa, 'Actualizando Empresa...', 'parametros/empresa-actualizar');

      if (respuesta.success) {
        this.cargarSucursales();
        this.triggerClick(this.BtnCerrarModalModalEditTrigger);
        await this.limpiarData();
        await this.mostrarMensaje('<p>Proceso ejecutado correctamente</p>', this.iconoSuccess);

      }
      else {
        await this.mostrarMensaje('<p>No se ha podido completar la operación </p>', this.iconoError);
      }
     




      //this.overlays.message = 'Actualizando Empresa...';
      //this.overlayService.show(this.overlays);
      //this.url = AppConfigService.settings.server + 'parametros/empresa-actualizar';
      //this.jdata = { jdata: dataEmpresa , jSessionId: this.user.token };
      //this.data = 'jdata=' + encodeURIComponent(JSON.stringify(this.jdata));
      //const httpOptions = {
      //  headers: new HttpHeaders({
      //    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      //  }),
      //};
      //debugger;
      //await this.serv.ObtenerSucursales(this.data, this.url, httpOptions)
      //  .then((result: []) => this.resultado = result)
      //  .catch(catchError(this.handleError));
      //if (this.util.vResultado(this.resultado)) {
      //  this.overlayService.show(this.overlaysHide);
      //} else {
      //  this.overlayService.show(this.overlaysHide);
      //}

     
    }
  }

  // Para editar filas
  updateList(id: number, property: string, event: any, table: [], tableName: string) {
    const editField = event.target.textContent;
    const result = table.findIndex((a) => {
      return a['id'] === id;
    });
    this[tableName][result][property] = editField;
  }

  changeValue(id: number, property: string, event: any) {
    this.editField = event.target.textContent;
  }

  MercaderiaAgregar() {
    this.limpiarDataMercaderia();
  }

  manejosAgregar() {
    this.limpiarDataManejos();
  }

  limpiarDataMercaderia() {
    $('#mercaderiaKgDesdeEdit').val('');
    $('#mercaderiaKgHastaEdit').val('');
    $('#mercaderiaKgCostoEdit').val('');
    $('#mercaderiaKgValorEdit').val('');
  }

  limpiarDataManejos() {
    $('#manejosDesdeEdit').val('');
    $('#manejosHastaEdit').val('');
    $('#manejosCostoEdit').val('');
    $('#manejosValorEdit').val('');
  }

  limpiarDataManejos2() {
    $('#manejosDosDesdeEdit').val('');
    $('#manejosDosHastaEdit').val('');
    $('#manejosDosCostoEdit').val('');
    $('#manejosDosValorEdit').val('');
  }

  limpiarDataSeguros() {
    $('#segurosDesdeEdit').val('');
    $('#segurosDesdeHastaEdit').val('');
    $('#segurosDesdeCostoEdit').val('');
    $('#segurosDesdeValorEdit').val('');
  }


  guardarMercaderiaKg() {
    
    let mercaderiaParse: IMercaderia[];
    mercaderiaParse = [];
    var desde = this.mercaderiaKgForm.controls['mercaderiaKgDesde'].value;
    var hasta = this.mercaderiaKgForm.controls['mercaderiaKgHasta'].value;
    var costo = this.mercaderiaKgForm.controls['mercaderiaKgCosto'].value;
    var valor = this.mercaderiaKgForm.controls['mercaderiaKgValor'].value;

    if (desde == null) {
      this.mostrarMensaje("Debe digitar un valor para el campo desde");
    }
    else
      if (hasta == null) {
        this.mostrarMensaje("Debe digitar un valor para el campo hasta");
      }
      else
        if (costo == null) {
          this.mostrarMensaje("Debe digitar un valor para el campo costo");
        }
        else {

          //if (this.mercaderias == undefined) {
            mercaderiaParse = this.mercaderias;
          //}
          this.mercaderias = [];

          if (mercaderiaParse == undefined) {
           mercaderiaParse = [];
            //mercaderiaParse = this.mercaderias;
          }

          debugger;
          mercaderiaParse.push({
            id: this.empresa.id,
            desde: desde,
            hasta: hasta,
            costo: costo,
            valor: valor
          })


          this.construirTabla("#tbodyMercaderia_Edicion", mercaderiaParse, "#tblMercaderiaEdicion", true);
          this.limpiarDataMercaderia();
          this.triggerClick(this.bntIdBotonModalDosCerrarTrigger);

        }
  }

  guardarManejos() {

    let mercaderiaParse: IManejo[];
    mercaderiaParse = [];
    var desde = this.aduanasForm.controls['mercaderiaKgDesde'].value;
    var hasta = this.aduanasForm.controls['mercaderiaKgHasta'].value;
    var costo = this.aduanasForm.controls['mercaderiaKgCosto'].value;
    var valor = this.aduanasForm.controls['mercaderiaKgValor'].value;

    if (desde == null) {
      this.mostrarMensaje("Debe digitar un valor para el campo desde");
    }
    else
      if (hasta == null) {
        this.mostrarMensaje("Debe digitar un valor para el campo hasta");
      }
      else
        if (costo == null) {
          this.mostrarMensaje("Debe digitar un valor para el campo costo");
        }
        else {

          //if (this.mercaderias == undefined) {
          mercaderiaParse = this.manejos;
          //}
          this.manejos = [];

          if (mercaderiaParse == undefined) {
            mercaderiaParse = [];
            //mercaderiaParse = this.mercaderias;
          }

          debugger;
          mercaderiaParse.push({
            id: this.empresa.id,
            desde: desde,
            hasta: hasta,
            costo: costo,
            valor: valor
          })

          this.construirTabla("#tbodyManejoAduanas_Edicion", mercaderiaParse, "#tblManejoAduanasEdicion", true);
          //var table = $('#tblManejoAduanasEdicion').DataTable();
          //table.rows.add([{
          //  "desde": desde,
          //  "hasta": hasta,
          //  "costo": costo,
          //  "valor": valor}])
          //  .draw();
          
          this.limpiarDataManejos();
          this.triggerClick(this.BtnCerrarModalManejosEditTrigger);
        }
  }

  guardarManejosDos() {

    let mercaderiaParse: IManejo2[];
    mercaderiaParse = [];
    var desde = this.aduanasDosForm.controls['mercaderiaKgDesde'].value;
    var hasta = this.aduanasDosForm.controls['mercaderiaKgHasta'].value;
    var costo = this.aduanasDosForm.controls['mercaderiaKgCosto'].value;
    var valor = this.aduanasDosForm.controls['mercaderiaKgValor'].value;

    if (desde == null) {
      this.mostrarMensaje("Debe digitar un valor para el campo desde");
    }
    else
      if (hasta == null) {
        this.mostrarMensaje("Debe digitar un valor para el campo hasta");
      }
      else
        if (costo == null) {
          this.mostrarMensaje("Debe digitar un valor para el campo costo");
        }
        else {

          //if (this.mercaderias == undefined) {
          mercaderiaParse = this.manejos2;
          //}
          this.manejos2 = [];

          if (mercaderiaParse == undefined) {
            mercaderiaParse = [];
            //mercaderiaParse = this.mercaderias;
          }

          debugger;
          mercaderiaParse.push({
            id: this.empresa.id,
            desde: desde,
            hasta: hasta,
            costo: costo,
            valor: valor
          })


          this.construirTabla("#tbodyManejoAduanasDos_Edicion", mercaderiaParse, "#TblManejoAduanasDosEdicion", true);
          this.limpiarDataManejos2();
          this.triggerClick(this.BtnCerrarModalManejo2EditTrigger);
        }
  }

  guardarSeguros() {

    let mercaderiaParse: ISeguro[];
    mercaderiaParse = [];
    var desde = this.segurosMercaderiaForm.controls['mercaderiaKgDesde'].value;
    var hasta = this.segurosMercaderiaForm.controls['mercaderiaKgHasta'].value;
    var costo = this.segurosMercaderiaForm.controls['mercaderiaKgCosto'].value;
    var valor = $("#segurosDesdeValorAgregar").prop("checked");

    if (desde == null) {
      this.mostrarMensaje("Debe digitar un valor para el campo desde");
    }
    else
      if (hasta == null) {
        this.mostrarMensaje("Debe digitar un valor para el campo hasta");
      }
      else
        if (costo == null) {
          this.mostrarMensaje("Debe digitar un valor para el campo costo");
        }

        else {

          //if (this.mercaderias == undefined) {
          mercaderiaParse = this.seguros;
          //}
          this.seguros = [];

          if (mercaderiaParse == undefined) {
            mercaderiaParse = [];
            //mercaderiaParse = this.mercaderias;
          }
        }

    mercaderiaParse.push({
      id: this.empresa.id,
      desde: desde,
      hasta: hasta,
      costo: costo,
      valor: valor
    })

    this.construirTabla("#tbodySeguroMercaderia_Edicion", mercaderiaParse, "TblSeguroMercaderiaEdicion", true);
    this.limpiarDataSeguros();
    this.triggerClick(this.BtnCerrarSeguroMercaderiaEditTrigger);

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


  //tbodySeguroMercaderia_Edicion
  construirTabla(idTable: string, data: any, nombreTable: string = "", esAppend: boolean = false)
  {
    debugger;
    var table = $(nombreTable).DataTable();
    if (data.length > 0) {
      for (var i = 0; i < data.length; i++) {
        table.row.add([data[i].desde, data[i].hasta, data[i].costo, data[i].valor]).draw(false);
      }

      //var editor = new $.fn.dataTable.Editor({
      //  ajax: data,
      //  table: "#example",

      $(nombreTable).on('click', 'tbody td:not(:first-child)', function (e) {
        //editor.inline(this);
        alert($(this).html());
      });


    }

    //if (!idTable.startsWith("#"))
    //  idTable = "#" + idTable;
    //const tableBody = $(idTable);
    //let html = "";
    //for (var i = 0; i < data.length; i++) {
    //  html += "<tr>";
    //  html += "<td>" + data[i]["desde"]+"</td>";
    //  html += "<td>"+data[i]["hasta"]+"</td>";
    //  html += "<td>" + data[i]["costo"] + "</td>";

    //  if (data[i]["valor"]) {
    //    html += "<td><input type='checkbox' checked='checked' /> </td>";
    //  }
    //  else {
    //    html += "<td><input type='checkbox' /> </td>";
    //  }
      
    //  html += "</tr>";
    //}
    //debugger;
    //if (esAppend) {
    //  $(nombreTable).DataTable().clear();
    //  $(nombreTable).DataTable().draw();
    //  tableBody.append(html);
    //}
    //else {
    //  tableBody.html("");
    //  tableBody.html(html);
    //  $(nombreTable).DataTable();

    //}

   


  }

}


