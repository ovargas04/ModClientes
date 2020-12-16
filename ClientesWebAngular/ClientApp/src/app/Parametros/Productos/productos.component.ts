import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { AfterViewInit, Component, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
//import { NgSelectModule } from '@ng-select/ng-select';
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
import { IProductoResponse } from '../../model/parametros/productos/productosresponse';
import { IProducto } from '../../model/Parametros/Productos/IProducto';
import { IPais } from '../../model/Parametros/Productos/IPais';
import { Usuario } from '../../model/Usuario';
import { OverlayService } from '../../overlay.service';
import { ProductosService } from '../../Servicios/Parametros/Productos/productos.service';
import { PaisesService } from '../../Servicios/Parametros/Paises/paises.service';
// Servicios
import { UsuarioService } from '../../usuario.service';
import { UtilApp } from '../../Util/util';
import { IEmpresa } from '../../model/Parametros/Empresas/IEmpresa';
import { EmpresasService } from '../../Servicios/Parametros/Empresas/empresas.service';
import { async } from 'q';


@Component({
  selector: 'app-producto',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.html'],
})




export class ProductosComponent implements OnInit, OnDestroy, AfterViewInit {
  empresas: IEmpresa[] = [];
  iconoSuccess = 'Success';
  iconoError = 'Error';
  bntIdBotonModalTrigger = 'BtnMostrarModal';
  bntIdBotonModalCerrarTrigger = 'BtnCerrarModal';
  multi_pais: boolean;
  selectedLevel: object;
  producto_index_pais: number;
  producto_index_empresa: number;
  brands: IPais[] = [];
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<DataTableDirective>;
  util: UtilApp = new UtilApp(this.servMessage);
  private destroy$: Subject<void> = new Subject<void>();
  // Properties table empresa ngx
  ColumnMode = ColumnMode;
  loadingIndicator = true;
  reorderable = true;
  SelectionType = SelectionType;
  columnsProducto = [
    { name: 'ID', prop: 'id' },
    { name: 'Producto', prop: 'nombre' },
    { name: 'Editar' },
    { name: 'Eliminar' }];

  selected = [];
  dataProducto: {
    producto_id: 0,
    empresa_id: 0,
    pais: IPais[],
    multiPais: false,
    nombre: '',
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
  productos: IProducto[];

  producto: IProducto = { id: 0, nombre: '', empresa_id: 0, MultiPais: true, CodigoPais: 0 };
  user: Usuario = new Usuario();
  url = '';
  userNameCookie: string = null;
  overlays: IOverlay = { message: 'Buscando productos...', show: true };
  overlaysHide: IOverlay = { message: '', show: false };
  productoForm = new FormGroup({
    productoid: new FormControl(),
    paisnombre: new FormControl(),
    empresanombre: new FormControl(),
    multipais: new FormControl(),
    productonombre: new FormControl(),
  });
  lista: IPais[] = [];
  constructor(
    public router: Router,
    private servUser: UsuarioService,
    private cookieService: CookieService,
    private overlayService: OverlayService,
    private serv: ProductosService,
    private servPais: PaisesService,
    private serveEmpresa: EmpresasService,
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

  async cargarDataeliminarProducto(request) {
    debugger;
    let zonaObject = await this.llamadaGenerica({ producto_id: request.id }, "", "parametros/producto-cargar");
    this.producto.nombre = zonaObject.Data["nombre"];
    this.id = request.id;
  }

  async eliminar() {
    debugger;
    let respuestaEliminarZona = await this.llamadaGenerica({ producto_id: this.id }, "eliminando el producto " + this.producto.nombre, "parametros/producto-borrar");

    if (respuestaEliminarZona.success) {
      this.mostrarMensaje("Se ha eliminado correctamente el producto " + this.producto.nombre, this.iconoSuccess);
      this.cargarProductos();
    }
    else {
      await this.mostrarMensaje("No se ha podido eliminar el producto " + this.producto.nombre + ". Esta siendo usada.", this.iconoError);
    }

  }

  async llamadaGenerica(data, mensajeOverlay, nombreMetodo) {
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
    await this.serv.ObtenerProductos(this.data, this.url, httpOptions)
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

  async ngOnInit() {
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
      data: this.productos, //this.empresas,
      deferRender: true,
    };

    


    this.userNameCookie = this.cookieService.get('username') === '' ? null : this.cookieService.get('username'); // To Get Cookie
    if (this.userNameCookie === '' || UtilApp.isNullOrUndefined(this.userNameCookie) || this.user.token === '') {
      this.redirectLogin();
    } else {
      this.cargarProductos();
      this.cargarEmpresa();
      this.cargarPaises();
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

  productoAgregar() {

    this.producto_index_empresa = 0;

    var check = $("#multiPais").prop("checked");

    if (check) {
      this.triggerClick("multiPais");
    }

    this.producto.nombre = "";
    this.triggerClick("levantarPopUpProductos");


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

  async selectProducto({ selected }) {
    const producto = selected[0];
    let productosParse: IProducto[];
    productosParse = [];
    this.overlays.message = 'Cargando producto...';
    this.overlayService.show(this.overlays);
    this.url = AppConfigService.settings.server + 'parametros/producto-cargar';
    this.jdata = { jdata: { producto_id: producto.id }, jSessionId: this.user.token };
    this.data = 'jdata=' + encodeURIComponent(JSON.stringify(this.jdata));
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      }),
    };
    await this.serv.ObtenerProductos(this.data, this.url, httpOptions)
      .then((result: []) => this.resultado = result)
      .catch(catchError(this.handleError));
    if (this.util.vResultado(this.resultado)) {
      let values = JSON.parse(this.resultado.values);
      this.producto.id = values['id'];
      this.producto.CodigoPais = values['codigoPais'];
      this.producto.empresa_id = values['empresa'];
      this.producto.nombre = values['nombre'];

      if (values['multiPais']) {
        this.triggerClick("multiPais");
      }


      this.producto_index_pais = this.brands.findIndex(x => x.id === values['codigoPais']);
      this.producto_index_empresa = 0 //this.empresas.findIndex(x => x.id === values['id']);

      this.overlayService.show(this.overlaysHide);
      this.refresh('#sucursalTable', 'dtTriggerSucursal');
    } else {
      this.overlayService.show(this.overlaysHide);
    }
    //this.id = producto.id;
  }


  async cargarProductos() {
    let productosParse: IProducto[]; //IEmpresa[];
    productosParse = [];
    this.overlayService.show(this.overlays);
    this.url = AppConfigService.settings.server + 'parametros/productos';
    this.jdata = { jdata: this.jdata, jSessionId: this.user.token };
    this.data = 'jdata=' + encodeURIComponent(JSON.stringify(this.jdata));
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      }),
    };
    await this.serv.ObtenerProductos(this.data, this.url, httpOptions)
      .then((result: []) => this.resultado = result)
      .catch(catchError(this.handleError));
    debugger;
    if (this.util.vResultado(this.resultado)) {
      JSON.parse(this.resultado.values).forEach((a, b) => {
        productosParse.push({
          id: a[0],
          nombre: a[1],
          empresa_id: a[2],
          MultiPais: a[3],
          CodigoPais: a[4],
        });
      });
      this.productos = productosParse;
      this.overlayService.show(this.overlaysHide);
    } else {
      this.overlayService.show(this.overlaysHide);
    }
  }

  async cargarEmpresa() {

    //SE CARGA OBJETO DE EMPRESAS
    let empresaParse: IEmpresa[];
    empresaParse = [];
    this.overlays.message = 'Buscando empresas...';
    this.overlayService.show(this.overlays);
    this.url = AppConfigService.settings.server + 'parametros/empresas';
    this.jdata = { jdata: this.jdata, jSessionId: this.user.token };
    this.data = 'jdata=' + encodeURIComponent(JSON.stringify(this.jdata));
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      }),
    };
    await this.serveEmpresa.ObtenerSucursales(this.data, this.url, httpOptions)
      .then((result: []) => this.resultado = result)
      .catch(catchError(this.handleError));
    if (this.util.vResultado(this.resultado)) {
      JSON.parse(this.resultado.values).forEach((a, b) => {
        empresaParse.push({
          id: a[0],
          name: a[1],
        });
      });
      this.empresas = empresaParse;

      this.overlayService.show(this.overlaysHide);
      this.refresh('#sucursalTable', 'dtTriggerSucursal');


    } else {
      this.overlayService.show(this.overlaysHide);
    }
  }

  async cargarPaises() {
    //SE CARGA OBJETO DE PAISES
      let paisesParse: IPais[]; 
      paisesParse = [];
      this.overlays.message = 'Buscando paises...';
      this.overlayService.show(this.overlays);
      this.url = AppConfigService.settings.server + 'parametros/paises';
      this.jdata = { jdata: {  }, jSessionId: this.user.token };
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
      this.brands = paisesParse;

      this.overlayService.show(this.overlaysHide);
      this.refresh('#sucursalTable', 'dtTriggerSucursal');
    }
    
  }

  async editarEmpresa(producto) {
    // Manejos2
    // Manejos 2
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      }),
    };
    //this.dtOptionsManejos2 = {
    //  pagingType: 'full_numbers',
    //  pageLength: 10,
    //  language: this.dtLanguage,
    //  // select: true,
    //  info: false,
    //  responsive: true,
    //  destroy: true,
    //  ordering: false,
    //  searching: false,
    //  //data: this.manejos2,
    //  deferRender: true,
    //  serverSide: true,
    //  processing: true,
    //  scrollY: '200',
    //  ajax: async (dataTablesParameters: any, callback) => {
    //    debugger;
    //    await this.http
    //      //.post<IEmpresaResponse>(
    //      .post<IProductoResponse>(
    //        this.url,
    //        this.data,
    //        httpOptions,
    //      )
    //      .pipe(takeUntil(this.dtTriggerManejos2))
    //      .subscribe((resp) => {
    //        this.manejos2 = JSON.parse(resp.values)['manejos2'];
    //        // this.refresh('#ManejosTable2', 'dtTriggerManejos2');
    //        setTimeout(function () {
    //          callback({
    //            draw: 10,
    //            recordsTotal: 40000,
    //            recordsFiltered: 40000,
    //            data: JSON.parse(resp.values)['manejos2'],
    //          });
    //        }, 50);
    //      });
    //  },
    //};

    //this.overlays.message = 'Detalles de empresa...';
    //this.overlayService.show(this.overlays);
    //this.url = AppConfigService.settings.server + 'parametros/correo-empresa';
    //this.jdata = { jdata: { empresa_id: empresa.id }, jSessionId: this.user.token };
    //this.data = 'jdata=' + encodeURIComponent(JSON.stringify(this.jdata));

    await this.serv.ObtenerProductos(this.data, this.url, httpOptions)
      .then((result: []) => this.resultado = result)
      .catch(catchError(this.handleError));
    if (this.util.vResultado(this.resultado)) {
      this.objetoDetalle = JSON.parse(this.resultado.values);
      //this.empresa.id = this.objetoDetalle['empresa']['id'];
      //this.empresa.name = this.objetoDetalle['empresa']['nombre'];
      //this.empresa.costoElaboracionGuia = this.util.formatMonetario(this.objetoDetalle['costoElaboracionGuia']);
      //this.empresa.descripcionCostoElaboracionGuia = this.objetoDetalle['descripcionCostoElaboracionGuia'];
      //this.empresa.cargoFuel = this.util.formatMonetario(this.objetoDetalle['cargoFuel']);
      //this.empresa.cargoTarjeta = this.util.formatMonetario(this.objetoDetalle['cargoTarjeta']);
      //this.empresa.excepcionImpuesto = this.util.formatMonetario(this.objetoDetalle['excepcionImpuesto']);
      //this.empresa.excepcionImpuestoAdicional = this.util.formatMonetario(this.objetoDetalle['excepcionImpuestoAdicional']);

      //this.paises = this.objetoDetalle['paises'];
     
      // Refresh tables
      this.refresh('#MercaderiaTable', 'dtTriggerMercaderia');
      this.refresh('#ManejosTable', 'dtTriggerManejos');
      this.refresh('#ManejosTable2', 'dtTriggerManejos2');
      this.refresh('#SegurosTable', 'dtTriggerSeguros');
      this.overlayService.show(this.overlaysHide);
    } else {
      this.overlayService.show(this.overlaysHide);
    }
  }

  eliminarEmpresa(empresa) {




  }

  editarSucursal(sucursal) {

  }

  async guardarProducto(producto) {
    let isAllow = true;
    let idEmpresa = this.productoForm.controls['empresanombre'].value;
    let idPais = this.productoForm.controls['paisnombre'].value;
    let nombreP = this.productoForm.controls['productonombre'].value; 
    
    //if (producto.id <= 0) {
    //  this.message.text = 'Ingrese el código del producto';
    //  this.message.type = 'Alert';
    //  isAllow = false;
    //  this.servMessage.showAlert(this.message);
    //}
    if (idEmpresa === null) {
      idEmpresa = producto.empresa_id;
    }
   
    if (idPais === null) {
      idPais = producto.CodigoPais;
    }

    if (nombreP === null) {
      nombreP = producto.nombre;
    }


    if (isAllow) {
      this.dataProducto = {
        producto_id: producto.id,
        empresa_id: idEmpresa,
        pais: idPais,
        multiPais: this.productoForm.controls['multipais'].value,
        nombre: nombreP
      };

      this.overlays.message = 'Actualizando Producto...';
      this.overlayService.show(this.overlays);
      this.url = AppConfigService.settings.server + 'parametros/producto-actualizar';
      this.jdata = { jdata: this.dataProducto, jSessionId: this.user.token };
      this.data = 'jdata=' + encodeURIComponent(JSON.stringify(this.jdata));
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        }),
      };
      await this.serv.ObtenerProductos(this.data, this.url, httpOptions)
        .then((result: []) => this.resultado = result)
        .catch(catchError(this.handleError));
      if (this.util.vResultado(this.resultado)) {
        this.overlayService.show(this.overlaysHide);
        await this.cargarProductos();
        await this.limpiarData();
        this.mostrarMensaje('<p>Proceso ejecutado correctamente.</p>', this.iconoSuccess);
        this.overlayService.show(this.overlaysHide);
      } else {
        this.overlayService.show(this.overlaysHide);
      }
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

  add(tableName: string, selector: string, trigger: string) {
    this.idfalso++;
    const falsafila = {};
    falsafila['id'] = this.idfalso;
    falsafila['codigoPais'] = 188;
    falsafila['empresa'] = 20;
    falsafila['desde'] = this.falsoFila['desde'];
    falsafila['hasta'] = this.falsoFila['hasta'];
    falsafila['costo'] = this.falsoFila['costo'];
    falsafila['valor'] = this.falsoFila['valor'];
    this[tableName].push(falsafila);
    this.refresh(selector, trigger);
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
    this.triggerClick(this.bntIdBotonModalCerrarTrigger);

  }

  triggerClick(idElementoHTML) {
    let boton: HTMLElement = document.getElementById(idElementoHTML) as HTMLElement;
    boton.click();
  }

  async limpiarData() {
    this.dataProducto.producto_id = 0;
    this.dataProducto.nombre = '';

  }

}
