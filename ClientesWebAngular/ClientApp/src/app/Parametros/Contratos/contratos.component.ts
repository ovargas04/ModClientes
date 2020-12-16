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
import { IContrato } from '../../model/Parametros/InterfacesParametros';
import { IEmpresaSelect } from '../../model/Parametros/InterfacesParametros';
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


//Util
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-empresa',
  templateUrl: './contratos.component.html',
  styleUrls: ['./contratos.component.html'],
})
export class ContratosComponent implements OnInit, OnDestroy, AfterViewInit {
  paises: IPais[] = [];

  @ViewChildren(DataTableDirective)

  dtElements: QueryList<DataTableDirective>;
  @ViewChildren('ContratosTable') contratosTable: DataTableDirective;
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


  //NUEVO AGREGADO

  objContrato =
    {
      contrato_id: 0,
      empresa: '',
      nombre: '',
      pais_id: 0,
      tipo: 0,
      cupo: '',
      pesoMinimo: '',
      montoMensual: '',
      kiloAdicional: '',
      contado: false, //checkbox
      usaJumping: false,
      publicado: false,
      data_excel: null,
      paisIdReal: null,
      tipoReal: 0
    };

  contratosForm = new FormGroup({
    contrato_id: new FormControl(),
    empresa: new FormControl(),
    nombre: new FormControl(),
    pais_id: new FormControl(),
    tipo: new FormControl(),
    cupo: new FormControl(),
    pesoMinimo: new FormControl(),
    montoMensual: new FormControl(),
    kiloAdicional: new FormControl(),
    contado: new FormControl(), //checkbox
    usaJumping: new FormControl(),
    publicado: new FormControl(),
    data_excel: new FormControl()
  });


  columnsContrato = [
    { name: 'desde', prop: 'desde' },
    { name: 'hasta', prop: 'hasta' },
    { name: 'costo', prop: 'costo' },
    { name: 'valor', prop: 'valor' }];


  file: any;
  arrayBuffer: any;
  dataExcel: any;


  //NUEVO AGREGADO

  dtOptions: DataTables.Settings = {};
  isselected = false;
  id = 0;
  dtTrigger: Subject<any> = new Subject();
  jdata: {};
  data = '';
  resultado: any;
  empresas: IEmpresa[];
  contratos: IContrato[];
  contratosModificar: IContrato[];
  EmpresaSelect: IEmpresaSelect[] = [];
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
    this.cargarContratos();
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
    // to prevent leak memory
    this.destroy$.next();
    this.destroy$.complete();
  }

  async cargarDataeliminarContrato(request) {
   
    let contratoObject = await this.llamadaGenerica({ contrato_id: request.id }, "", "parametros/contrato-cargar");
    this.objContrato.nombre = contratoObject.Data[0].descripcion;
    this.id = request.id;
  }

  async eliminar() {
    let respuestaEliminarContrato = await this.llamadaGenerica({ contrato_id: this.id }, "eliminando el contrato " + this.objContrato.nombre, "parametros/contrato-borrar");

    if (respuestaEliminarContrato.success) {
      this.mostrarMensaje("Se ha eliminado correctamente el contrato " + this.objContrato.nombre, this.iconoSuccess);
      this.cargarContratos();
    }
    else {
      await this.mostrarMensaje("No se ha podido eliminar el contrato " + this.objContrato.nombre + ". Esta siendo usado.", this.iconoError);
    }

  }

  empresaAgregar() {

  }

  sucursalAgregar() {

  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();

    this.cargarPais();
    this.empresasCargar();

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


  async empresasCargar() {

    let empresasSelectParse: IEmpresaSelect[];
    empresasSelectParse = [];
    let respuestaEmpresa = await this.llamadaGenerica(null, 'cargando empresas...', 'parametros/empresas');
    if (respuestaEmpresa.success) {
      JSON.parse(respuestaEmpresa.DataJson).forEach((a, b) => {
        empresasSelectParse.push({
          id: a[0],
          name: a[1],
        });
      });
      this.EmpresaSelect = empresasSelectParse;
    } else {
      this.mostrarMensaje("<p>Ha ocurrido un error al cargar las empresas</p>", this.iconoError);
    }


  }


  async cargarContratos() {
    let empresasParse: IEmpresa[];
    empresasParse = [];
    var resultado = await this.llamadaGenerica(null, 'Cargando contratos...', 'parametros/contratos');

    if (resultado.success) {
      JSON.parse(resultado.DataJson).forEach((a, b) => {
        empresasParse.push({
          id: a[0],
          name: a[1],
        });
      });
      this.empresas = empresasParse;
    }
    else {
      this.mostrarMensaje("<p>Ha ocurrido un error al cargar los contratos</p>", this.iconoError);
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

  async editarContrato(request) {

    try {

      if (request.id == undefined || request.id == null) {
        await this.mostrarMensaje("<p>No se pudo cargar los datos del contrato. No se pudo obtener el identificador del contrato</p>", this.iconoError);
        return;
      }

      let data =
      {
        "contrato_id": request.id
      };
      var resultadoAlianza = await this.llamadaGenerica(data, 'Cargando datos...', 'parametros/contrato-cargar');

      if (resultadoAlianza.success) {
        let values = JSON.parse(resultadoAlianza.DataJson);

        var empresa_id = (values[0]["empresa"] != null)
          ? (values[0]["empresa"]['id'])
          : (null);

        this.objContrato.contrato_id = values[0]['codigoContrato'];
        this.objContrato.empresa = empresa_id;
        this.objContrato.nombre = values[0]["descripcion"];
        this.objContrato.pais_id = this.paises.findIndex(x => x.id === values[0]["codigoPais"]);
        this.objContrato.paisIdReal = values[0]["codigoPais"];
        this.objContrato.tipo = values[0]["tipo"] == "AEREO" ? 0 : 1;
        this.objContrato.tipoReal = values[0]["tipo"] == "AEREO" ? 1 : 2;
        this.objContrato.cupo = values[0]['cupo'];
        this.objContrato.pesoMinimo = values[0]['pesoMinimo'];
        this.objContrato.montoMensual = values[0]['montoMensual'];
        this.objContrato.kiloAdicional = values[0]['kiloAdicional'];
        this.objContrato.contado = values[0]["contado"]; //checkbox
        this.objContrato.usaJumping = values[0]["usaJumping"];
        this.objContrato.publicado = values[0]["publicado"];
        this.dataExcel = values[1];

        this.llenarTablaExcel(false);


      } else {
        await this.mostrarMensaje("<p>No se pudo cargar los datos del contrato.Si el mensaje persiste, consulte a TI</p>", this.iconoError);
      }
    } catch (e) {
      await this.mostrarMensaje('<p>Ha sucedido un error mientras procesabamos la solicitud,' +
        'si este mensaje persiste por favor contacte a TI </p>', this.iconoError);
      this.overlayService.show(this.overlaysHide);
    }


  }




  async levantarModalContratos() {
    await this.limpiarData();
  }

  async actualizarContratos(contratoForm) {

   

    var esEdicion = this.objContrato.contrato_id > 0 ? true : false;
    var contratoId = this.objContrato.contrato_id;
    var accion = this.objContrato.contrato_id > 0 ? "actualizado" : "guardado";
    var empresa = this.contratosForm.controls["empresa"].value;
    var nombre = this.contratosForm.controls["nombre"].value;
    var pais_id = this.contratosForm.controls["pais_id"].value;
    var tipo = this.contratosForm.controls["tipo"].value;
    var cupo = this.contratosForm.controls["cupo"].value;
    var pesoMinimo = this.contratosForm.controls["pesoMinimo"].value;
    var montoMensual = this.contratosForm.controls["montoMensual"].value;
    var kiloAdicional = this.contratosForm.controls["kiloAdicional"].value;
    var contado = this.contratosForm.controls["contado"].value;
    var usaJumping = this.contratosForm.controls["usaJumping"].value;
    var publicado = this.contratosForm.controls["publicado"].value;


    /***Validaciones***/
    let existeContrato = this.empresas.filter(function (contrato) {
      return contrato.name == nombre;
    }).length;


    if (existeContrato > 0) {
      await this.mostrarMensaje("<p>Este nombre se encuentra en uso para otro contrato</p>", this.iconoError);
      return false;
    }

    if (esEdicion) {

      if (nombre == '' && this.objContrato.nombre != '') {
        await this.mostrarMensaje("<p>El nombre del contrato no puede quedar en blanco</p>", this.iconoError);
        return false;
      }

    } else {

      if (nombre == '' || nombre == undefined || nombre == null) {
        await this.mostrarMensaje("<p>Digite un nombre para el contrato</p>", this.iconoError);
        return false;
      }


    }


    /***Fin Validaciones***/



    if (esEdicion) {

      this.objContrato.pais_id = this.objContrato.paisIdReal;
      this.objContrato.tipo = this.objContrato.tipoReal;

      this.objContrato.contrato_id = contratoId;

      if (empresa != null && empresa != undefined)
        this.objContrato.empresa = empresa;

      if (nombre != null && nombre != undefined)
        this.objContrato.nombre = nombre;

      if (pais_id != null && pais_id != undefined)
        this.objContrato.pais_id = pais_id;

      if (tipo != null && tipo != undefined)
        this.objContrato.tipo = tipo;


      if (cupo != null && cupo != undefined)
        this.objContrato.cupo = cupo;


      if (pesoMinimo != null && pesoMinimo != undefined)
        this.objContrato.pesoMinimo = pesoMinimo;

      if (montoMensual != null && montoMensual != undefined)
        this.objContrato.montoMensual = montoMensual;


      if (kiloAdicional != null && kiloAdicional != undefined)
        this.objContrato.kiloAdicional = kiloAdicional;

      if (contado != null && contado != undefined)
        this.objContrato.contado = contado;

      if (usaJumping != null && usaJumping != undefined)
        this.objContrato.usaJumping = usaJumping;

      if (publicado != null && publicado != undefined)
        this.objContrato.publicado = publicado;


    }
    else {

      this.objContrato.contrato_id = contratoId;
      this.objContrato.empresa = empresa;
      this.objContrato.nombre = nombre;
      this.objContrato.pais_id = pais_id;
      this.objContrato.tipo = tipo;
      this.objContrato.cupo = cupo;
      this.objContrato.pesoMinimo = pesoMinimo;
      this.objContrato.montoMensual = montoMensual;
      this.objContrato.kiloAdicional = kiloAdicional;
      this.objContrato.contado = contado;
      this.objContrato.usaJumping = usaJumping;
      this.objContrato.publicado = publicado;
    }

    this.objContrato["costos"] = this.contratosModificar;
    var respuesta = await this.llamadaGenerica(this.objContrato, 'Actualizando contratos...', 'parametros/contrato-actualizar');

    if (respuesta.success) {
      await this.cargarContratos();
      this.triggerClick('BtnCerrarModal');
      await this.limpiarData();
      await this.mostrarMensaje('<p>Se ha ' + accion + ' correctamente el contrato ' + this.objContrato.nombre + '</p>', this.iconoSuccess);
    }
    else {
      await this.mostrarMensaje('<p>No se ha podido completar la operación </p>', this.iconoError);
    }


  }

  async onUserEvent(e) {
    if (e.type == "click") {
      console.log(e.row);
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
    this.mostrarMensaje('<p>Ha sucedido el siguiente error: ' + errorMessage + '</p>', this.iconoError);
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
    this.objContrato.contrato_id = 0;
    this.objContrato.empresa = '';
    this.objContrato.nombre = '';
    this.objContrato.pais_id = this.paises.findIndex(x => x.nombre.toLowerCase() === 'costa rica');
    this.objContrato.tipo = 0;
    this.objContrato.cupo = '0';
    this.objContrato.pesoMinimo = '0';
    this.objContrato.montoMensual = '0';
    this.objContrato.kiloAdicional = '0';
    this.objContrato.contado = false; //checkbox
    this.objContrato.usaJumping = false;
    this.objContrato.publicado = false;
    this.objContrato.data_excel = null;
    this.objContrato.tipoReal = 0;
    this.objContrato.paisIdReal = 0;

  }



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
      let tablaContratos: IContrato[];
      tablaContratos = [];
      this.contratos = tablaContratos;
      this.refresh('#ContratosTable', 'dtTrigger');
      await this.mostrarMensaje("<p>Ha ocurrido un error procesando el archivo</p>", this.iconoError);
    }

  }


  llenarTablaExcel(esArchivo) {
    let tablaContratos: IContrato[];
    tablaContratos = [];

    if (esArchivo) {
      for (var i = 0; i < this.dataExcel.length; i++) {
        tablaContratos.push(
          {
            desde: this.dataExcel[i].Desde,
            hasta: this.dataExcel[i].Hasta,
            costo: this.dataExcel[i].Costo,
            valor: this.dataExcel[i].Valor

          });
      }
    }
    else {
      for (var i = 0; i < this.dataExcel.length; i++) {
        tablaContratos.push(
          {
            desde: this.dataExcel[i][0],
            hasta: this.dataExcel[i][1],
            costo: this.dataExcel[i][2],
            valor: this.dataExcel[i][3]

          });
      }
    }

    this.contratos = tablaContratos;
    this.contratosModificar = tablaContratos;
    this.refresh('#MercaderiaTable', 'dtTrigger');
  }



}
