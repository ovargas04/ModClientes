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
  templateUrl: './preferencias.component.html',
  styleUrls: ['./preferencias.component.html'],
})
export class PreferenciasComponent implements OnInit, OnDestroy, AfterViewInit {
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
  objetoDetalle = {};
  isselected = false;
  id = 0;
  dtTrigger: Subject<any> = new Subject();
  jdata: {};
  data = '';
  resultado: any;
  empresas: IEmpresa[];
  user: Usuario = new Usuario();
  url = '';
  userNameCookie: string = null;
  overlays: IOverlay = { message: 'Buscando zonas...', show: true };
  overlaysHide: IOverlay = { message: '', show: false };

  preferenciasObject =
    {
      clientTimeOut: 0,
      serverTimeOut: 0,
      largoMinimoClave: 0,
      largoMaximoClave: 0,
      cantidadDiasEntreCambioDeClave: 0,
      cantidadDiasInactividadPermitido: 0,
      servidorEmail: '',
      userEmail: '',
      claveEmail: '',
      confirmacionClaveEmail: '',


    };

  preferenciasForm = new FormGroup({
    clientTimeOut: new FormControl(),
    serverTimeOut: new FormControl(),
    largoMinimoClave: new FormControl(),
    largoMaximoClave: new FormControl(),
    cantidadDiasEntreCambioDeClave: new FormControl(),
    cantidadDiasInactividadPermitido: new FormControl(),
    servidorEmail: new FormControl(),
    userEmail: new FormControl(),
    claveEmail: new FormControl(),
    confirmacionClaveEmail: new FormControl(),
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
    
    this.cargarPreferencias();
  }

  ngOnDestroy(): void {
    
  }


  ngAfterViewInit(): void {
    this.dtTrigger.next();

  }

  
  async cargarPreferencias()
  {

      let empresasParse: IEmpresa[];
    empresasParse = [];
    var RespuestaPreferencias = await this.llamadaGenerica(null, "Cargando Preferencias...", "parametros/preferencias");
    if ((await RespuestaPreferencias).success) {
      let values = JSON.parse((RespuestaPreferencias).DataJson);

      console.log("cargarPreferencias:",values);
        
        this.preferenciasObject.clientTimeOut = values[1];
        this.preferenciasObject.serverTimeOut = values[2];
        this.preferenciasObject.largoMinimoClave = values[3];
        this.preferenciasObject.largoMaximoClave = values[4];
        this.preferenciasObject.cantidadDiasEntreCambioDeClave = values[5];
        this.preferenciasObject.cantidadDiasInactividadPermitido = values[6];
        this.preferenciasObject.servidorEmail = values[7];
        this.preferenciasObject.userEmail = values[8];
        this.preferenciasObject.claveEmail = values[9];
        this.preferenciasObject.confirmacionClaveEmail = values[10];

        this.empresas = empresasParse;
        
    } else {
      this.mostrarMensaje("<p>Ha sucedido un error cargando las preferencias</p>", this.iconoError); 
      }
    
  }


  async actualizarPreferencias()
  {
    try {


      debugger;
      var clientTimeOut = this.preferenciasForm.controls["clientTimeOut"].value;
      var serverTimeOut = this.preferenciasForm.controls["serverTimeOut"].value;
      var largoMinimoClave = this.preferenciasForm.controls["largoMinimoClave"].value;
      var largoMaximoClave = this.preferenciasForm.controls["largoMaximoClave"].value;
      var cantidadDiasEntreCambioDeClave = this.preferenciasForm.controls["cantidadDiasEntreCambioDeClave"].value;
      var cantidadDiasInactividadPermitido = this.preferenciasForm.controls["cantidadDiasInactividadPermitido"].value;
      var servidorEmail = this.preferenciasForm.controls["servidorEmail"].value;
      var userEmail = this.preferenciasForm.controls["userEmail"].value;
      var claveEmail = this.preferenciasForm.controls["claveEmail"].value;
      var confirmacionClaveEmail = this.preferenciasForm.controls["confirmacionClaveEmail"].value;



      if (claveEmail != null) {
        confirmacionClaveEmail = confirmacionClaveEmail == null ? "" : confirmacionClaveEmail;
        if (claveEmail != confirmacionClaveEmail) {
          await this.mostrarMensaje("<p>Las claves no son iguales</p>", this.iconoError);
          return false;
        }


      }



      if (clientTimeOut != null || clientTimeOut != undefined) {
        this.preferenciasObject.clientTimeOut = clientTimeOut;
      }

      if (serverTimeOut != null || serverTimeOut != undefined) {
        this.preferenciasObject.serverTimeOut = serverTimeOut;
      }
      if (largoMinimoClave != null || largoMinimoClave != undefined) {
        this.preferenciasObject.largoMinimoClave = largoMinimoClave;
      }



      if (largoMaximoClave != null || largoMaximoClave != undefined) {
        this.preferenciasObject.largoMaximoClave = largoMaximoClave;
      }


      if (cantidadDiasEntreCambioDeClave != null || cantidadDiasEntreCambioDeClave != undefined) {
        this.preferenciasObject.cantidadDiasEntreCambioDeClave = cantidadDiasEntreCambioDeClave;
      }


      if (cantidadDiasInactividadPermitido != null || cantidadDiasInactividadPermitido != undefined) {
        this.preferenciasObject.cantidadDiasInactividadPermitido = cantidadDiasInactividadPermitido;
      }


      if (servidorEmail != null || servidorEmail != undefined) {
        this.preferenciasObject.servidorEmail = servidorEmail;
      }


      if (userEmail != null || userEmail != undefined) {
        this.preferenciasObject.userEmail = userEmail;
      }


      if (claveEmail != null || claveEmail != undefined) {
        this.preferenciasObject.claveEmail = claveEmail;
      }

      if (confirmacionClaveEmail != null || confirmacionClaveEmail != undefined) {
        this.preferenciasObject.confirmacionClaveEmail = confirmacionClaveEmail;
      }

      delete this.preferenciasObject.confirmacionClaveEmail;
      var respuestaPreferencias = await this.llamadaGenerica(this.preferenciasObject, "actualizando datos...", "parametros/preferencias-actualizar");


      if (respuestaPreferencias.success) {
        await this.mostrarMensaje("<p>Se ha actualizado correctamente los datos.</p>", this.iconoSuccess);
      }
      else {
        await this.mostrarMensaje("<p>No se ha podido actualizar los datos, si este mensaje persiste contacte a TI.</p>", this.iconoError);
      }



    } catch (e) {
      await this.mostrarMensaje("<p>Ha ocurrido un error mientras se actualizaban los datos, si este mensaje persiste contacte a TI.</p>", this.iconoError);
      console.log(e);
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



      debugger;
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
        objetoRespuesta.DataJson = this.resultado.values;
        objetoRespuesta.Data = JSON.parse(this.resultado.values);
      } else {
        console.log("llamadaGenerica-NoOperacion:", this.resultado);
        objetoRespuesta.success = false;
        this.overlayService.show(this.overlaysHide);
      }
    } catch (e) {
      console.log("llamadaGenerica-Error:", e);
      objetoRespuesta.success = false;
      await this.overlayService.show(this.overlaysHide);
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

}
