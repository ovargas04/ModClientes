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
@Component({
  selector: 'app-empresa',
  templateUrl: './paises.component.html',
  styleUrls: ['./paises.component.html'],
})
export class PaisesComponent implements OnInit, OnDestroy, AfterViewInit {
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
      paisID: "",
      paisNombre: ''
    };
  zonaForm = new FormGroup({
    zonaId: new FormControl(),
    zonaNombre: new FormControl()
  });

  constructor(
    public router: Router,
    private servUser: UsuarioService,
    private cookieService: CookieService,
    private overlayService: OverlayService,
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

  async cargarDataeliminarPais(request) {
    this.PaisId = request.id;
  }


  async eliminar() {
    let respuestaEliminarPais = await this.llamadaGenerica({ pais_id: this.PaisId}, "eliminando...", "parametros/pais-borrar");

    if (respuestaEliminarPais.success) {
      this.triggerClick("BtnCerrarModalEliminar");
      this.cargarPaises();
    }
    else {
      await this.mostrarMensaje("No se ha podido eliminar el pais. Esta siendo usado.", this.iconoError);
    }

  }

  async ngOnInit() {
    
    this.cargarPaises();
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
      await this.servPais.ObtenerPaises(this.data, this.url, httpOptions)
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

  async cargarPaises()
  {
    this.userNameCookie = this.cookieService.get('username') === '' ? null : this.cookieService.get('username'); // To Get Cookie
    if (this.userNameCookie === '' || UtilApp.isNullOrUndefined(this.userNameCookie) || this.user.token === '') {
      this.redirectLogin();
    } else {
      let empresasParse: IEmpresa[];
      empresasParse = [];
      this.overlayService.show(this.overlays);
     
      this.url = AppConfigService.settings.server + 'parametros/paises';
      this.jdata = { jdata: this.jdata, jSessionId: this.user.token };
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
        console.log(JSON.parse(this.resultado.values));
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

  PaisId = "";
  levantarModalZona()
  {
    this.PaisId = "";
    this.limpiarData();
  }

  async actualizarPais() {

    debugger;
    let id:string = this.PaisId == "" ? "" : this.PaisId.toString();
    let nombrePais = $("#NombrePais").val();

    if (nombrePais == "") {
      await this.mostrarMensaje('<p>El nombre del pais no puede quedar en blanco.</p>', this.iconoError);
      return;
    }


    var data = { "pais_id": id, "nombre": nombrePais };

      var respuesta = await this.llamadaGenerica(data, 'Actualizando Pais...', 'parametros/pais-actualizar');

      if (respuesta.success) {
        await this.cargarPaises();
        this.triggerClick('BtnCerrarModal');
        await this.limpiarData();
      }
      else {
        await this.mostrarMensaje('<p>No se ha podido completar la operación </p>', this.iconoError);
      }
  }


  async llamadaGenerica(data, mensajeOverlay,nombreMetodo)
  {
    var objetoRespuesta =
    {
      success: false,
      Data: {}
    };
    try {
      
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
      await this.servPais.ObtenerPaises(this.data, this.url, httpOptions)
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
    }
    catch (e) {

    }

    return objetoRespuesta;
  }


  async editarPaises(request) {

    try {

      this.PaisId = request.id;

      await this.limpiarData();
      let editarMultiPaisData = await this.llamadaGenerica(
        { "pais_id": request.id },
        "cargando data...",
        "parametros/pais-cargar");

      if (editarMultiPaisData.success) {

        let values = editarMultiPaisData.Data;

        this.zonaObject.paisID = values[0];
        this.zonaObject.paisNombre = values[1];

      }
      else {
        await this.mostrarMensaje("<p>No se han podido cargar los datos del pais </p>", this.iconoError);
      }

    } catch (e) {
      await this.mostrarMensaje('<p>Ha sucedido un error mientras procesabamos la solicitud,' +
        'si este mensaje persiste por favor contacte a TI </p>', this.iconoError);
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
   this.zonaObject.paisID = "";
    this.zonaObject.paisNombre = ''
  }


}
