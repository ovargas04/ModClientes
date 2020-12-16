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
import { IAlianza } from '../../model/Parametros/Alianzas/IAlianza';
import { AlianzasService } from '../../Servicios/Parametros/Alianzas/alianzas.services';
import { IRptBitacora } from '../../model/Reportes/Bitacoras/IRptbitacora';
@Component({
  selector: 'app-empresa',
  templateUrl: './bitacoras.component.html',
  styleUrls: ['./bitacoras.component.html'],
})
export class BitacoraComponent implements OnInit, OnDestroy, AfterViewInit {
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
  columnsBitacora = [
    { name: 'ID', prop: 'id' },
    { name: 'Usuario', prop: 'name' },
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
  alianzas: IAlianza[];
  bitacoras: IRptBitacora[];
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
  bitacoraObject: IRptBitacora=
    {
      cuenta: "",
      usuario: "",
      actividades: "",
      fechadesde: "",
      fechahasta: "",
      id: "",
      fecha: "",
      cliente: "",
      detalle: ""
    };


  dataAlianza:
    {
      id: 0,
      name: '',
      codigoPais: 0,
      tarjetaRequerida: false,
      monDescuento: 0,
      conContrato: '',
      monJetBillete: 0,
      monKiloBox: 0,
      monBanco: '',
      bines: ''
    };
 

  zonaForm = new FormGroup({
    alianzaid: new FormControl(),
    bitacoraCuenta: new FormControl(),
    paisnombre: new FormControl(),
    tarjetaReq: new FormControl(),
    alianzaDescuento: new FormControl(),
    alianzaContrato: new FormControl(),
    alianzaBillete: new FormControl(),
    alianzaKiloBox: new FormControl(),
    alianzaBanco: new FormControl(),
    alianzaBines: new FormControl(),
    bitacoraDesde: new FormControl(),
    bitacoraHasta: new FormControl()
  });

  constructor(
    public router: Router,
    private servUser: UsuarioService,
    private cookieService: CookieService,
    private overlayService: OverlayService,
    private serv: AlianzasService,
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
    this.cargarPais();
    
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

  //async cargarDataeliminarContrato(request) {
  //  debugger;
  //  let contratoObject = await this.llamadaGenerica({ alianza_id: request.id }, "", "parametros/alianza-cargar");
  //  debugger;
  //  this.alianzaObject.name = contratoObject.Data.descripcion;
  //  this.id = request.id;
  //}


  //async eliminar() {
  //  debugger;
  //  let respuestaEliminarContrato = await this.llamadaGenerica({ alianza_id: this.id }, "eliminando la alianza " + this.alianzaObject.name, "parametros/alianza-borrar");

  //  if (respuestaEliminarContrato.success) {
  //    this.mostrarMensaje("Se ha eliminado correctamente la alianza " + this.alianzaObject.name, this.iconoSuccess);
  //   // this.cargarAlianzas();
  //  }
  //  else {
  //    await this.mostrarMensaje("No se ha podido eliminar el contrato " + this.alianzaObject.name + ". Esta siendo usado.", this.iconoError);
  //  }

  //}



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
      this.overlays.message = 'Buscando alianzas...';
      this.overlayService.show(this.overlays);
      this.url = AppConfigService.settings.server + 'parametros/alianzas';
      this.jdata = { jdata: { empresa_id: empresa.id }, jSessionId: this.user.token };
      this.data = 'jdata=' + encodeURIComponent(JSON.stringify(this.jdata));
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        }),
      };
      await this.serv.ObtenerAlianzas(this.data, this.url, httpOptions)
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


  async cargarPais() {
    //SE CARGA OBJETO DE PAISES
    let paisesParse: IPais[];
    paisesParse = [];
    this.overlays.message = 'Buscando paises...';
    this.overlayService.show(this.overlays);
    this.url = AppConfigService.settings.server + 'seguridad/usuarios';
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
          id: a[1],
          nombre: a[0],
        });
      });
      this.paises = paisesParse;

      this.overlayService.show(this.overlaysHide);
      this.refresh('#sucursalTable', 'dtTriggerSucursal');


    } else {
      this.overlayService.show(this.overlaysHide);
    }

  }



 

  async Consultar() {
    debugger;
    var fechaDesde = this.zonaForm.controls['bitacoraDesde'].value;
    var fechaHasta = this.zonaForm.controls['bitacoraHasta'].value;
    var cuenta = this.zonaForm.controls['bitacoraCuenta'].value == null ? "" : this.zonaForm.controls['bitacoraCuenta'].value
    var usuario = this.bitacoraObject.usuario;
    var actividad = this.bitacoraObject.actividades;



    var data = {
      "cliente_id": cuenta,
      "usuario": usuario,
      "actividad": actividad,
      "fdesde": fechaDesde.replaceAll('-', ''),
      "fhasta": fechaHasta.replaceAll('-', '')
    }


    var respuesta = await this.llamadaGenerica(data, 'Consultando datos...', 'reportes/bitacoras');
    debugger;
    if (respuesta.success) {
      this.bitacoras = respuesta.Data;
      this.MostrarDivDos();
      debugger;
    }
    else {
      await this.mostrarMensaje('<p>No se ha podido completar la operación </p>', this.iconoError);
    }
  }

  async MostrarDivDos() {
    var divD = document.getElementById("divDos");
    divD.style.display = 'block';
    
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

  //async editarAlianza(alianza) {

  //  try {

  //    const alianzaId = alianza.id;
  //    let alianzaParse: IAlianza[];
  //    alianzaParse = [];
  //    this.overlays.message = 'Cargando alianza...';
  //    this.overlayService.show(this.overlays);
  //    this.url = AppConfigService.settings.server + 'parametros/alianza-cargar';
  //    this.jdata = { jdata: { alianza_id: alianzaId }, jSessionId: this.user.token };
  //    this.data = 'jdata=' + encodeURIComponent(JSON.stringify(this.jdata));
  //    const httpOptions = {
  //      headers: new HttpHeaders({
  //        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
  //      }),
  //    };
  //    await this.serv.ObtenerAlianzas(this.data, this.url, httpOptions)
  //      .then((result: []) => this.resultado = result)
  //      .catch(catchError(this.handleError));
  //    if (this.util.vResultado(this.resultado)) {
  //      let values = JSON.parse(this.resultado.values);

  //      this.alianzaObject.id = values["id"];
  //      this.alianzaObject.name = values['descripcion'];
  //      this.alianzaObject.codigoPais = this.paises.findIndex(x => x.id === values['codigoPais']);
  //      this.alianzaObject.monBanco = values["banco"];
  //      this.alianzaObject.bines = values["bines"];
  //      this.alianzaObject.conContrato = values["contrato"];
  //      this.alianzaObject.monDescuento = values["descuento"];
  //      this.alianzaObject.monJetBillete = values["jetBillete"];
  //      this.alianzaObject.monKiloBox = values["kiloBox"];
  //      this.alianzaObject.tarjetaRequerida = values["tarjetarequerida"];
  //      this.overlayService.show(this.overlaysHide);

  //    } else {
  //      this.overlayService.show(this.overlaysHide);
  //    }
  //  } catch (e) {
  //    this.mostrarMensaje('<p>Ha sucedido un error mientras procesabamos la solicitud,' +
  //      'si este mensaje persiste por favor contacte a TI </p>', this.iconoError);
  //    this.overlayService.show(this.overlaysHide);
  //  }


  //}


  levantarModalZona() {
    //this.limpiarData();
  }


  productoAgregar() {
   // this.limpiarData();
  }



  async guardarAlianza(alianza) {


    var accion = "guardado";
    var nombreAlianza = this.zonaForm.controls['alianzaNombre'].value == null ? alianza.name : this.zonaForm.controls['alianzaNombre'].value;
    var pais = this.zonaForm.controls['paisnombre'].value == null ? alianza.codigoPais : this.zonaForm.controls['paisnombre'].value;;
    var montoDescuento = this.zonaForm.controls['alianzaDescuento'].value == null ? alianza.monDescuento : this.zonaForm.controls['alianzaDescuento'].value;
    var contrato = this.zonaForm.controls['alianzaContrato'].value == null ? alianza.conContrato : this.zonaForm.controls['alianzaContrato'].value;
    var tarjetaRequerida = this.zonaForm.controls['tarjetaReq'].value == null ? alianza.tarjetaRequerida : this.zonaForm.controls['tarjetaReq'].value;
    var jetBillete = this.zonaForm.controls['alianzaBillete'].value == null ? alianza.monJetBillete : this.zonaForm.controls['alianzaBillete'].value;
    var kiloBox = this.zonaForm.controls['alianzaKiloBox'].value == null ? alianza.monKiloBox : this.zonaForm.controls['alianzaKiloBox'].value;
    var banco = this.zonaForm.controls['alianzaBanco'].value == null ? alianza.monBanco : this.zonaForm.controls['alianzaBanco'].value;
    var bines = this.zonaForm.controls['alianzaBines'].value == null ? alianza.bines : this.zonaForm.controls['alianzaBines'].value;

    var id = alianza.id;
    var generarConsulta = true;
    var esEdicion = (id > 0 ? true : false);

    if (id > 0) {
      accion = "actualizado";
    }



    if ((nombreAlianza == '' || nombreAlianza == undefined || nombreAlianza == null) && !esEdicion) {
      await this.mostrarMensaje("<p>Digite un nombre para la alianza</p>", this.iconoError);
      generarConsulta = false;
    } else {


      if (!esEdicion) {
        let existeZona = this.alianzas.filter(function (zona) {
          return zona.name == nombreAlianza;
        }).length;


        if (existeZona > 0) {
          await this.mostrarMensaje("<p>La zona que intenta agregar ya existe</p>", this.iconoError);
          generarConsulta = false;
        }
      }

    }


    if (esEdicion && nombreAlianza == null) {
      generarConsulta = false;
    }

    if (generarConsulta) {
      var data =
      {
        "alianza_id": id,
        "descripcion": nombreAlianza,
        "pais_id": pais,
        "tarjetarequerida": tarjetaRequerida,
        "descuento": montoDescuento,
        "contrato_id": contrato,
        "jetbillete": jetBillete,
        "kilobox": kiloBox,
        "banco": banco,
        "bines": bines
      };

      console.log(data);

      var respuesta = await this.llamadaGenerica(data, 'Actualizando Alianza...', 'parametros/alianza-actualizar');

      if (respuesta.success) {
        //await this.cargarAlianzas();
        this.triggerClick('BtnCerrarModal');
        //await this.limpiarData();
        await this.mostrarMensaje('<p>Se ha ' + accion + ' correctamente la alianza ' + data.alianza_id + '</p>', this.iconoSuccess);
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

    await this.serv.ObtenerAlianzas(this.data, this.url, httpOptions)
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


  //async limpiarData() {
  //  this.alianzaObject.id = 0;
  //  this.alianzaObject.name = '';
  //  this.alianzaObject.codigoPais = this.paises.findIndex(x => x.nombre.toLowerCase() === 'costa rica');
  //  this.alianzaObject.monBanco = '';
  //  this.alianzaObject.bines = '';
  //  this.alianzaObject.conContrato = '';
  //  this.alianzaObject.monDescuento = 0;
  //  this.alianzaObject.monJetBillete = 0;
  //  this.alianzaObject.monKiloBox = 0;
  //  this.alianzaObject.tarjetaRequerida = false;

  //}


}
