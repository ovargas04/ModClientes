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
import { forEachChild } from 'typescript';
@Component({
  selector: 'app-empresa',
  templateUrl: './rutas.component.html',
  styleUrls: ['./rutas.component.html'],
})
export class RutasComponent implements OnInit, OnDestroy, AfterViewInit {
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
  dtOptions: DataTables.Settings = {};
  isselected = false;
  id = 0;
  dtTrigger: Subject<any> = new Subject();
  jdata: {};
  data = '';
  resultado: any;
  empresas: IEmpresa[];
  empresa: IEmpresa = { id: 0, name: '' };
  sucursales: IEmpresa[];
  user: Usuario = new Usuario();
  url = '';
  userNameCookie: string = null;
  overlays: IOverlay = { message: 'Buscando zonas...', show: true };
  overlaysHide: IOverlay = { message: '', show: false };

  rutasForm = new FormGroup({
    ruta_id: new FormControl(),
    nombre: new FormControl(),
    detalle: new FormControl(),
    pais_id: new FormControl(),
    subdivisiones: new FormControl()
  });

  rutasObject =
    {
      ruta_id: '',
      nombre: '',
      detalle: '',
      pais_id: 0,
      pais_IdOriginal:0,
      subdivisiones: ''
    };

  asignadosArray = [];
  disponiblesArray = [];

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
    
    this.cargarRutas();
  }

  async cargarDataeliminarRuta(request) {
    let rutaObject = await this.llamadaGenerica({ ruta_id: request.id }, "", "parametros/ruta-cargar");
    this.rutasObject.nombre = rutaObject.Data["nombre"];
    this.id = request.id;
  }


  async eliminar() {
    let respuestaEliminarRuta = await this.llamadaGenerica({ ruta_id: this.id }, "eliminando la ruta " + this.rutasObject.nombre, "parametros/ruta-borrar");

    if (respuestaEliminarRuta.success) {
      this.mostrarMensaje("Se ha eliminado correctamente la ruta " + this.rutasObject.nombre, this.iconoSuccess);
      this.cargarRutas();
    }
    else {
      await this.mostrarMensaje("No se ha podido eliminar la ruta " + this.rutasObject.nombre + ". Esta siendo usada.", this.iconoError);
    }

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

  async levantarModalAgregarRuta()
  {
    await this.rutasDivisionesCargar(0);
    await this.limpiarData();

  }

  async asignar()
  {
    var disponiblesSeleccionados = [];
    $('#_Disponibles option:selected').each(function ()
    {
      disponiblesSeleccionados.push($(this).val());
    });

    for (var i = 0; i < disponiblesSeleccionados.length; i++) {

      var id = disponiblesSeleccionados[i];
      var obj = this.disponiblesArray.filter(x => x.id == id)[0];
      this.disponiblesArray.splice(this.disponiblesArray.indexOf(obj), 1);
      obj['seleccionado'] = true;
      this.asignadosArray.unshift(obj);
    }

    await this.cargarDivisiones(this.asignadosArray, this.disponiblesArray);

  }

  async desasignar()
  {
    console.log('asignados -> disponibles:', $("#_Asignados").val());

    var asignadosSeleccionados = [];
    $('#_Asignados option:selected').each(function () {
      asignadosSeleccionados.push($(this).val());
    });

    for (var i = 0; i < asignadosSeleccionados.length; i++) {

      var id = asignadosSeleccionados[i];
      var obj = this.asignadosArray.filter(x => x.id == id)[0];
      this.asignadosArray.splice(this.asignadosArray.indexOf(obj), 1);
      obj['seleccionado'] = true;
      this.disponiblesArray.unshift(obj);
    }

    await this.cargarDivisiones(this.asignadosArray, this.disponiblesArray);

  }


  async cargarPais() {
    //SE CARGA OBJETO DE PAISES
    let paisesParse: IPais[];
    paisesParse = [];
    var resultado = await this.llamadaGenerica(null, 'Buscando paises...', 'parametros/paises');
    if (resultado.success) {
      JSON.parse(resultado.DataJson).forEach((a, b) => {
        paisesParse.push({
          id: a[0],
          nombre: a[1],
        });
      });
      this.paises = paisesParse;
    } else {
      this.mostrarMensaje("<p>Ha ocurrido un error al cargar los paises</p>", this.iconoError);
    }

  }


  async cargarRutas()
  {

    
    this.userNameCookie = this.cookieService.get('username') === '' ? null : this.cookieService.get('username'); // To Get Cookie
    if (this.userNameCookie === '' || UtilApp.isNullOrUndefined(this.userNameCookie) || this.user.token === '') {
      this.redirectLogin();
    } else {
      let empresasParse: IEmpresa[];
      empresasParse = [];
      this.overlayService.show(this.overlays);
      
      this.url = AppConfigService.settings.server + 'parametros/rutas';
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

  public async editarRutas(request) {

    try {

      await this.limpiarData();

      if (request.id == undefined || request.id == null) {
        await this.mostrarMensaje("<p>No se pudo cargar los datos. No se pudo obtener el identificador de la ruta</p>", this.iconoError);
        return false;
      }

      let data =
      {
        "ruta_id": request.id
      };
      var resultadoRutas = await this.llamadaGenerica(data, 'Cargando datos...', 'parametros/ruta-cargar');

      if (resultadoRutas.success) {
        let values = JSON.parse(resultadoRutas.DataJson);

        this.rutasObject.ruta_id = values['id'];
        this.rutasObject.nombre = values['nombre'];
        this.rutasObject.detalle = values['detalle'];
        this.rutasObject.pais_id = this.paises.findIndex(x => x.id === values["codigoPais"]);
        this.rutasObject.pais_IdOriginal = values["codigoPais"];



        
        await this.rutasDivisionesCargar(data.ruta_id);

      } else {
        await this.mostrarMensaje("<p>No se pudo cargar los datos del contrato.Si el mensaje persiste, consulte a TI</p>", this.iconoError);
      }
    } catch (e) {
      await this.mostrarMensaje('<p>Ha sucedido un error mientras procesabamos la solicitud,' +
        'si este mensaje persiste por favor contacte a TI </p>', this.iconoError);
      this.overlayService.show(this.overlaysHide);
    }


  }

  async rutasDivisionesCargar(rutaId)
  {
    var divisiones = [];
   
    var resultado = await this.llamadaGenerica(null, 'cargando divisiones...', 'parametros/ruta-cargar-divisiones');
    if (resultado.success) {
      JSON.parse(resultado.DataJson).forEach((a, b) => {

        if (a[0] != null) {
          divisiones.push(
            {
              id: a[0],
              nombre: a[1],
              rutaId: a[2]
            });
        }

      });


      let asignados = divisiones.filter(x => x.rutaId == rutaId);
      let disponibles = divisiones.filter(x => x.rutaId != rutaId);

      this.cargarDivisiones(asignados, disponibles);




    } else {
      this.mostrarMensaje("<p>Ha ocurrido un error al cargar las divisiones</p>", this.iconoError);
    }

  }


  async cargarDivisiones(asignados, disponibles)
  {
    this.asignadosArray = asignados;
    this.disponiblesArray = disponibles;
    let asignadosSelect: HTMLElement = document.getElementById('_Asignados') as HTMLElement;
    let disponiblesSelect: HTMLElement = document.getElementById('_Disponibles') as HTMLElement;

    var options = '';
    var selected = '';
    for (var i = 0; i < asignados.length; i++) {
      selected = '';
      if (asignados[i].seleccionado != undefined) {
        if (asignados[i].seleccionado == true) {
          selected = 'selected';
        }
      }
      options += `<option ${selected} value='${asignados[i].id}'>${asignados[i].nombre}</option>`;
    }

    asignadosSelect.innerHTML = options;

    options = '';
    selected = '';

    for (var i = 0; i < disponibles.length; i++) {
      selected = '';
      if (disponibles[i].seleccionado != undefined) {
        if (disponibles[i].seleccionado == true) {
          selected = 'selected';
        }
      }
      options += `<option ${selected} value='${disponibles[i].id}'>${disponibles[i].nombre} #${(disponibles[i].rutaId == null ? '?' : disponibles[i].rutaId)}</option>`;
    }

    disponiblesSelect.innerHTML = options;

  }


  async actualizarRuta()
  {
    try {

      var subdivisiones = [];
      this.asignadosArray.forEach((val) => {
        subdivisiones.push(val.id);
      });

      var ruta_id = this.rutasObject.ruta_id;
      var esEdicion = (ruta_id != '' && parseInt(ruta_id) > 0) ? true : false;
      var nombre = this.rutasForm.controls['nombre'].value;
      var detalle = $("#detalleTextArea").val() == undefined ? '' : $("#detalleTextArea").val().toString();
      var pais_id = parseInt($("#pais").val() == undefined ? '0' : $("#pais").val().toString());
      this.rutasObject.subdivisiones = subdivisiones.join(',');
      this.rutasObject.pais_id = this.rutasObject.pais_IdOriginal;

      if (esEdicion) {

        if (nombre != null && nombre != undefined) {
          this.rutasObject.nombre = nombre;
        }


        if (detalle != null && detalle != undefined) {
          this.rutasObject.detalle = detalle;
        }


        if (pais_id != null && pais_id != undefined) {
          this.rutasObject.pais_id = pais_id;
        }


      }
      else {
        this.rutasObject.nombre = nombre;
        this.rutasObject.detalle = detalle;
        this.rutasObject.pais_id = parseInt($("#pais").val().toString());
        this.rutasObject.ruta_id = "";
      }

      
      delete this.rutasObject.pais_IdOriginal;
      var datarespuesta = await this.llamadaGenerica(this.rutasObject, "actualizando datos...", "parametros/ruta-actualizar")
      if (datarespuesta.success) {
            await this.mostrarMensaje('<p>Se ha actualizado correctamente la ruta "' + this.rutasObject.nombre + '"</p>', this.iconoSuccess);
            await this.cargarRutas();
          }
          else {
            await this.mostrarMensaje('<p>No se ha actualizado la ruta "' + this.rutasObject.nombre + '". Intente de nuevo.</p>', this.iconoError);
          }

    } catch (e) {
       await this.mostrarMensaje("<p>No se ha podido actualizar la ruta, si este mensaje persiste por favor contacte a TI</p>", this.iconoError);
    }


  }


  async llamadaGenerica(data, mensajeOverlay, nombreMetodo) {

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

      this.overlays.message = mensajeOverlay;
      this.overlayService.show(this.overlays);
      this.url = AppConfigService.settings.server + nombreMetodo;
      this.jdata = { jdata: data, jSessionId: this.user.token };
      debugger;
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
      objetoRespuesta.success = false;
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


  private obtenerElementoHTML(idElementoHTML)
  {
    let elemento: HTMLElement = document.getElementById(idElementoHTML) as HTMLElement;
    return elemento;
  }

 async limpiarData()
  {
   this.rutasObject.detalle = '';
   this.rutasObject.nombre = '';
   this.rutasObject.pais_id = this.paises.findIndex(x => x.nombre.toLowerCase() === 'costa rica');
   this.rutasObject.ruta_id = '';
   this.rutasObject.pais_IdOriginal = 0;
  }


}
