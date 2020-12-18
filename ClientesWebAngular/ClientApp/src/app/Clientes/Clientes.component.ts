import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { AfterViewInit, Component, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { DataTableDirective } from 'angular-datatables';
import { CookieService } from 'ngx-cookie-service';
import { Subject, throwError } from 'rxjs';
import { catchError, takeUntil, ignoreElements } from 'rxjs/operators';
import { AppConfigService } from '../app-configuration.service';
import { MessageService } from '../message.service';
// Modelo
import { IOverlay } from '../model/IOverlay';
import { IMessage } from '../model/message';
import { IEmpresa } from '../model/Parametros/Empresas/IEmpresa';
import { IPais } from '../model/Parametros/Productos/IPais';
import { Usuario } from '../model/Usuario';
import { OverlayService } from '../overlay.service';
import { EmpresasService } from '../Servicios/Parametros/Empresas/empresas.service';
import { PaisesService } from '../Servicios/Parametros/Paises/paises.service';
// Servicios
import { UsuarioService } from '../usuario.service';
import { UtilApp } from '../Util/util';
import { element } from 'protractor';

@Component({
  selector: 'app-counter-component',
  templateUrl: './Clientes.component.html',
})
export class ClientesComponent implements OnInit, OnDestroy, AfterViewInit {
  paises: IPais[] = [];

  @ViewChildren(DataTableDirective)
  dtElements: QueryList<DataTableDirective>;
  util: UtilApp = new UtilApp(this.servMessage);
  private destroy$: Subject<void> = new Subject<void>();
  bntIdBotonModalTrigger = 'btnModalMensaje';
  iconoSuccess = 'Success';
  iconoError = 'Error';
  // Properties table empresa ngx
  ColumnMode = ColumnMode;
  loadingIndicator = true;
  reorderable = true
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
      pais_IdOriginal: 0,
      subdivisiones: ''
    };

  asignadosArray = [];
  disponiblesArray = [];




  //Variables cliente

  SUCURSAL_CARGA = 4;
  SUCURSAL_CD = 20;
  SUCURSAL_CARGA_PTY = 79;
  ZONA_DR = 77;

  ESTADO_ACTIVO = 10;
  ESTADO_MOROSO = 20;
  ESTADO_CANCELADO = 30;
  ESTADO_FALLECIDO = 40;
  ESTADO_NO_LOCALIZABLE = 50;

  TIPO_EMPRESA = 10;
  TIPO_PERSONA = 20;
  TIPO_PERSONA_USUARIO = 200;

  INDEX_TIPO_EMPRESA = 0;
  INDEX_TIPO_PERSONA = 1;

  FLAG_ES_EMPLEADO = 1;

  CONTRATO_AEREO = "AEREO";
  CONTRATO_MARITIMO = "MARITIMO";

  CONFECCION_GUIA = "Cargo Guía";
  WAREHOUSE_RECEIPT = "Warehouse Receipt";

  TIPOID_CEDULA = 10;
  TIPOID_PASAPORTE = 20;
  TIPOID_CEDULA_RESIDENCIA = 30;

  SEXO_MASCULINO = 10;
  SEXO_FEMENINO = 20;
  SEXO_FALTA_DEFINIR = 30;

  ESTADO_CIVIL_SOLTERO = 10;
  ESTADO_CIVIL_CASADO = 20;
  ESTADO_CIVIL_UNION_LIBRE = 30;
  ESTADO_CIVIL_VIUDO = 40;
  ESTADO_CIVIL_DIVORCIADO = 50;
  ESTADO_CIVIL_FALTA_DEFINIR = 60;

  FOTO_APODERADO = 0;
  DOCUMENTO_IDENTIFICACION = 1;
  CONFIRMACION_DOMICILIO = 2;
  FORMULARIO_AFILIACION = 3;
  TARJETA_CREDITO_DEBITO = 4;
  OTRA = 5;

  TARJETA_VISA = "Visa";
  TARJETA_MASTER_CARD = "MasterCard";
  TARJETA_AMERICAN_EXPRESS = "AmericanExpress";
  TARJETA_DINERS = "Dinners";
  TARJETA_DISCOVER = "Discover";
  TARJETA_POPULAR = "Popular";
  TARJETA_CREDIX = "Credix";
  TARJETA_CLUB_NACION = "ClubNacion";

  //********BUSQUEDA VARIABLES***** //
  BUSQUEDA_OPTION_ZONA = 220;
  BUSQUEDA_OPTION_TIPO = 210;
  BUSQUEDA_OPTION_EMPRESA = 230;
  BUSQUEDA_OPTION_SUCURSAL = 240;

  clienteSeleccionadoBusqueda =
    {
      Id: "",
      Nombre: "",
      NombreCorto: "",
      Tipo: 0,
      Sucursal: 0,
      Cedula: "",
      Email: "",
      Zona: ""
    };

  //*******BUSQUEDA VARIABLES******** //

  esNuevoCliente = false;

  model = {


    cliente_id: null,
    sucursal: null,

    confeccion_guia: null,

    pa_cliente_sucursal_id: null,

    pa_cliente_persona_id: null,
    pa_cliente_apoderado_id: null,
    pa_cliente_direccion0_id: null,
    pa_cliente_direccion1_id: null,
    pa_cliente_direccion2_id: null,

    pa_cliente_index_tipo_cliente: null,
    pa_cliente_index_cambio_sucursal: null,
    pa_cliente_habilitar: null,
    pa_cliente_clave_web: null,
    pa_cliente_nombre: null,
    pa_cliente_cuenta_empleados: null,
    pa_cliente_fecha_ingreso: null,
    pa_cliente_codigo_promocion: null,
    pa_cliente_index_idioma: null,
    pa_cliente_index_alianza: null,
    pa_cliente_datos_completos: null,
    pa_cliente_index_contrato: null,
    pa_cliente_index_economy: null,
    pa_cliente_index_ejecutivo: null,
    pa_cliente_recomendado_por: null,
    pa_cliente_pago_tarjeta: null,
    pa_cliente_cargo_mensajeria: null,
    pa_cliente_cargo_guia: null,
    pa_cliente_index_estado: null,
    pa_cliente_notas: null,
    pa_cliente_index_zona: null,
    pa_cliente_historial_zona: null,
    pa_cliente_productos: null,
    pa_cliente_index_como_conocio: null,
    pa_cliente_index_tipo_credito: null,
    pa_cliente_recoge_sucursal: null,


    pa_persona_id: null,
    pa_persona_index_tipo_id: null,
    pa_persona_identificacion: null,
    pa_persona_nombre: null,
    pa_persona_primer_apellido: null,
    pa_persona_segundo_apellido: null,
    pa_persona_fecha_nacimiento: null,
    pa_persona_fecha_nacimiento_nodef: null,
    pa_persona_index_sexo: null,
    pa_persona_index_nacionalidad: null,
    pa_persona_index_estado_civil: null,
    pa_persona_index_profesion: null,
    pa_persona_celular: null,
    pa_persona_telefono1: null,
    pa_persona_telefono2: null,
    pa_persona_index_telefono1: null,
    pa_persona_index_telefono2: null,
    pa_persona_email1: null,
    pa_persona_email2: null,
    pa_persona_recibir_boletines_electronicos: null,
    pa_persona_recibir_cupones_descuento: null,
    pa_persona_recibir_promociones: null,


    pa_direccion_id: null,
    pa_direccion_nombre: null,
    pa_direccion_autorizar_dejar_paquete: null,
    pa_direccion_mensaje_error: null,
    pa_direccion_index_ruta: null,
    pa_direccion_index_pais: null,
    pa_direccion_index_provincia: null,
    pa_direccion_index_canton: null,
    pa_direccion_distrito: null,
    pa_direccion_index_distrito: null,
    pa_direccion_direccion: null,
    pa_direccion_celular: null,
    pa_direccion_telefono1: null,
    pa_direccion_telefono2: null,
    pa_direccion_telefono3: null,
    pa_direccion_telefono4: null,
    pa_direccion_index_telefono1: null,
    pa_direccion_index_telefono2: null,
    pa_direccion_index_telefono3: null,
    pa_direccion_index_telefono4: null,
    pa_direccion_coordenadas: null,
    pa_direccion_lunes: null,
    pa_direccion_martes: null,
    pa_direccion_miercoles: null,
    pa_direccion_jueves: null,
    pa_direccion_viernes: null,
    pa_direccion_sabado: null,
    pa_direccion_domingo: null,
    pa_direccion_index_hora1: null,
    pa_direccion_index_hora2: null,

    pa_direccion_imagen: null,


    pa_tarjeta_id: null,
    pa_tarjeta_index_tarjeta: null,
    pa_tarjeta_numero: null,
    pa_tarjeta_nombre: null,
    pa_tarjeta_seguridad: null,
    pa_tarjeta_index_valido_yyyy: null,
    pa_tarjeta_index_valido_mm: null,
    pa_tarjeta_mensaje_error: null,
    pa_tarjeta_placeholder: null,

    pa_autorizados_id: null,
    pa_autorizados_persona_id: null,
    pa_autorizados_dir_id: null,
    pa_autorizados_index_tipo: null,
    pa_autorizados_index_relacion: null,
    pa_autorizados_identificacion: null,
    pa_autorizados_habilitar: null,
    pa_autorizados_index_tipo_id: null,
    pa_autorizados_index_identificacion: null,
    pa_autorizados_nombre: null,
    pa_autorizados_primer_apellido: null,
    pa_autorizados_segundo_apellido: null,
    pa_autorizados_fecha_nacimiento: null,
    pa_autorizados_fecha_nacimiento_nodef: null,
    pa_autorizados_no_ingresada: null,
    pa_autorizados_index_sexo: null,
    pa_autorizados_index_nacionalidad: null,
    pa_autorizados_index_estado_civil: null,
    pa_autorizados_index_profesion: null,
    pa_autorizados_direccion: null,
    pa_autorizados_celular: null,
    pa_autorizados_telefono1: null,
    pa_autorizados_telefono2: null,
    pa_autorizados_telefono3: null,
    pa_autorizados_telefono4: null,
    pa_autorizados_index_telefono1: null,
    pa_autorizados_index_telefono2: null,
    pa_autorizados_index_telefono3: null,
    pa_autorizados_index_telefono4: null,
    pa_autorizados_email1: null,
    pa_autorizados_email2: null,
    pa_autorizados_mensaje_error: null,

    pa_imagenes_id: null,
    pa_imagenes_index_tipo: null,
    pa_imagenes_notas: null,
    pa_imagenes_imagen: null,
    pa_imagenes_mensaje_error: null,


    pa_empresa_nombre_corto: null,
    pa_empresa_cedula_juridica: null,
    pa_empresa_index_pais: null,
    pa_empresa_index_provincia: null,
    pa_empresa_index_canton: null,
    pa_empresa_direccion: null,
    pa_empresa_direccion_id: null,
    pa_empresa_celular: null,
    pa_empresa_telefono1: null,
    pa_empresa_telefono2: null,
    pa_empresa_telefono3: null,
    pa_empresa_telefono4: null,
    pa_empresa_index_telefono1: null,
    pa_empresa_index_telefono2: null,
    pa_empresa_index_telefono3: null,
    pa_empresa_index_telefono4: null,
    pa_empresa_email1: null,
    pa_empresa_email2: null,
    pa_empresa_apoderado_index_tipo_id: null,
    pa_empresa_apoderado_id: null,
    pa_empresa_apoderado_nombre: null,
    pa_empresa_apoderado_primer_apellido: null,
    pa_empresa_apoderado_segundo_apellido: null,
    pa_empresa_apoderado_igual_contacto: null,

    pa_contactos_id: null,
    pa_contactos_persona_id: null,
    pa_contactos_nombre: null,
    pa_contactos_primer_apellido: null,
    pa_contactos_segundo_apellido: null,
    pa_contactos_puesto: null,
    pa_contactos_departamento: null,
    pa_contactos_notas: null,
    pa_contactos_dir_id: null,
    pa_contactos_index_pais: null,
    pa_contactos_index_provincia: null,
    pa_contactos_index_canton: null,
    pa_contactos_direccion: null,
    pa_contactos_celular: null,
    pa_contactos_telefono1: null,
    pa_contactos_telefono2: null,
    pa_contactos_telefono3: null,
    pa_contactos_telefono4: null,
    pa_contactos_index_telefono1: null,
    pa_contactos_index_telefono2: null,
    pa_contactos_index_telefono3: null,
    pa_contactos_index_telefono4: null,
    pa_contactos_email1: null,
    pa_contactos_email2: null,
    pa_contactos_mensaje_error: null
  };



  _lista: any;

  paMenuIds =
    {
      pa_cliente: "#pa_cliente",
      pa_persona: "#pa_persona",
      pa_empresa: "#pa_empresa",
      pa_direccion0: "#pa_direccion0",
      pa_direccion1: "#pa_direccion1",
      pa_direccion2: "#pa_direccion2",
      pa_tarjetas: "#pa_tarjetas",
      pa_contactos: "#pa_contactos",
      pa_autorizados: "#pa_autorizados",
      pa_imagenes: "#pa_imagenes",
    };

  Tipo_Imagen =
    [
      "Foto Apoderado",
      "Documento Identificacion",
      "Confirmación de Domicilio",
      "Formulario Afiliación",
      "Tarjeta Crédito o Débito",
      "Otro"
    ];


  objetoEliminacion =
    {
      seccion: "",
      id: ""
    };



  Tarjeta_Index = [
    { TARJETA_VISA: 1 },
    { TARJETA_MASTER_CARD: 2 },
    { TARJETA_AMERICAN_EXPRESS: 3 },
    { TARJETA_DINERS: 4 },
    { TARJETA_DISCOVER: 5 },
    { TARJETA_POPULAR: 6 },
    { TARJETA_CREDIX: 7 },
    { TARJETA_CLUB_NACION: 8 }
  ];


  Tarjeta_Data = [
    null, //
    [this.TARJETA_VISA, "Visa", "4"], //
    [this.TARJETA_MASTER_CARD, "Master Card", "51,52,53,54,55"], //
    [this.TARJETA_AMERICAN_EXPRESS, "American Express", "34,37"], //
    [this.TARJETA_DINERS, "Diners", "300,301,302,303,304,305,36,54"], //
    [this.TARJETA_DISCOVER, "Discover", "6011,644,645,646,647,648,649,65"], //
    [this.TARJETA_POPULAR, "Popular", "88"], //
    [this.TARJETA_CREDIX, "Credix", ""], //
    [this.TARJETA_CLUB_NACION, "Club Nacion", ""] //
  ];


  objSeccion =
    {
      seccionTarjeta: "tarjeta",
      seccionContacto: "contactos",
      seccionAutorizados: "autorizados",
      seccionImagenes: "imagenes"
    };

  pais_tarjetas =
    [
      "Visa",
      "MasterCard",
      "AmericanExpress",
      "Dinners",
      "Discover"
    ]




  //_PA_URLS = {
  //  { "pa_clienteRuta": "clientes/cliente-actualizar" },
  //  "pa_persona":    "clientes/persona-actualizar",
  //  "pa_empresa":    "clientes/empresa-actualizar",
  //  "pa_direccion0": "clientes/direccion-actualizar0",
  //  "pa_direccion1": "clientes/direccion-actualizar1",
  //  "pa_direccion2": "clientes/direccion-actualizar2",
  //};


  _PA_URLS =
    [
      {
        Url: "clientes/cliente-actualizar",
        NombreSeccion: "pa_cliente"
      },
      {
        Url: "clientes/persona-actualizar",
        NombreSeccion: "pa_persona"
      },
      {
        Url: "clientes/empresa-actualizar",
        NombreSeccion: "pa_empresa"
      },
      {
        Url: "clientes/direccion-actualizar0",
        NombreSeccion: "pa_direccion0"
      },
      {
        Url: "clientes/direccion-actualizar1",
        NombreSeccion: "pa_direccion1"
      }
      ,
      {
        Url: "clientes/direccion-actualizar2",
        NombreSeccion: "pa_direccion2"
      }
    ]


  //Fin Variables staticas cliente









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


    this.aplicarSeguridad();
    this.cargarSucursalesUsuarios();

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


    //Cargas

    this.cargarDropDown("#_Zona", "parametros/zonas", { value: 0, text: 1, secondText: 2 }, '-1', "-- SIN ZONA");
    this.cargarDropDown("#_Alianza", "parametros/alianzas", { value: 0, text: 1, secondText: null }, '-1', "-- SIN ALIANZA COMERCIAL");
    this.cargarDropDown("#_EjecutivoCuenta", "parametros/ejecutivos", { value: 0, text: 1, secondText: 2 }, '-1', "-- SIN EJECUTIVO ASIGNADO");
    this.cargarDropDown("#_ContratoNormal", "parametros/contratos", { value: 2, text: 1, secondText: null }, '-1', "-- SIN CONTRATO");
    this.cargarDropDown("#_ContratoEconomy", "parametros/contratos", { value: 2, text: 1, secondText: null }, '-1', "-- SIN CONTRATO");
    this.cargarDropDown("#_DireccionRuta01", "parametros/rutas", { value: 0, text: 1, secondText: null }, '-1', "-- SIN RUTA");
    this.cargarDropDown("#_DireccionRuta02", "parametros/rutas", { value: 0, text: 1, secondText: null }, '-1', "-- SIN RUTA");
    this.cargarDropDown("#_Nacionalidad", "parametros/paises", { value: 0, text: 1, secondText: null }, '-1', "-- SIN DEFINIR");
    this.cargarDropDown("#_DireccionPais00", "parametros/paises", { value: 0, text: 1, secondText: null }, '-1', "-- SIN DEFINIR");
    this.cargarDropDown("#_DireccionPais01", "parametros/paises", { value: 0, text: 1, secondText: null }, '-1', "-- SIN DEFINIR");
    this.cargarDropDown("#_DireccionPais02", "parametros/paises", { value: 0, text: 1, secondText: null }, '-1', "-- SIN DEFINIR");
    this.cargarDropDown("#_EmpresaPais", "parametros/paises", { value: 0, text: 1, secondText: null }, '-1', "-- SIN DEFINIR");
    this.cargarDropDown("#_ContactoPais", "parametros/paises", { value: 0, text: 1, secondText: null }, '-1', "-- SIN DEFINIR");
    this.cargarDropDown("#_Profesion", "parametros/profesiones", { value: 0, text: 1, secondText: null }, '-1', "-- SIN DEFINIR");
    this.cargarProductos();
    this.llenarCantonProvincia("#_ContactoProvincia", "#_ContactoCanton", "-1", "-1", this.user.codigoPais);
    this.seleccionarOptionSelect("#_ContactoPais", this.user.codigoPais.toString());
    //this.cargarDropDown("#_Productos", "parametros/productos", { value: 0, text: 1, secondText: 2 });
    //chelper.cargar_distritos();


    /*****Carga de dropDowns Busqueda*****/

    this.cargarDropDown("#Busqueda_Zonas_Select", "parametros/zonas", { value: 0, text: 1, secondText: 2 }, '-1');
    this.cargarDropDown("#Busqueda_Sucursales_Select", "parametros/sucursales", { value: 0, text: 1 }, '-1');
    this.cargarDropDown("#_CambioSucursal", "parametros/sucursales", { value: 0, text: 1 }, '-1');

    this.ocultarCamposBusqueda();


    /**************Fin seccion busqueda*********************/


    //Fin Cargas


    /********************Aplicar estilo a todos los elementos*************************************/
    this.aplicarEstilo();


  /********************Aplicar estilo a todos los elementos*************************************/


    this.inhabilitarHabilitar(this.paMenuIds.pa_cliente);
  }


  async levantarModalAgregarRuta() {
    // await this.rutasDivisionesCargar(0);

  }

  async asignar() {
    var disponiblesSeleccionados = [];
    $('#_Disponibles option:selected').each(function () {
      disponiblesSeleccionados.push($(this).val());
    });

    for (var i = 0; i < disponiblesSeleccionados.length; i++) {

      var id = disponiblesSeleccionados[i];
      var obj = this.disponiblesArray.filter(x => x.id == id)[0];
      this.disponiblesArray.splice(this.disponiblesArray.indexOf(obj), 1);
      obj['seleccionado'] = true;
      this.asignadosArray.unshift(obj);
    }

    // await this.cargarDivisiones(this.asignadosArray, this.disponiblesArray);

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
      this.disponiblesArray.unshift(obj);
    }

    // await this.cargarDivisiones(this.asignadosArray, this.disponiblesArray);

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


  async cargarRutas() {


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




        //await this.rutasDivisionesCargar(data.ruta_id);

      } else {
        await this.mostrarMensaje("<p>No se pudo cargar los datos del contrato.Si el mensaje persiste, consulte a TI</p>", this.iconoError);
      }
    } catch (e) {
      await this.mostrarMensaje('<p>Ha sucedido un error mientras procesabamos la solicitud,' +
        'si este mensaje persiste por favor contacte a TI </p>', this.iconoError);
      this.overlayService.show(this.overlaysHide);
    }


  }




  //



  async actualizarRuta() {
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


  async llamadaGenerica(data, mensajeOverlay, nombreMetodo,mostrarOverlay = true) {

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
      console.log("Catch en llamada Generica",e);
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








  // ****************************CLIENTE***************************************** //



  async aplicarEstilo() {
    //$("input").each(function () {
    //  $(this).addClass("form-control");
    //});
    //$("select").each(function () {
    //  $(this).addClass("form-control");
    //});
    //$("label").each(function () {
    //  $(this).addClass("form-control");
    //});
    //$("button").each(function () {
    //  $(this).addClass("form-control");
    //});
  }



  async cargarSucursalesUsuarios() {
    try {

      var ids = [];
      var sucursalesResponse = await this.llamadaGenerica({ empresa_id: this.TIPO_PERSONA_USUARIO }, 'cargando sucursales...', 'parametros/sucursales');
      var liOptions = "";
      var idSucursal = 0;
      JSON.parse(sucursalesResponse.DataJson).forEach((a, b) => {

        liOptions += `<li role="presentation"><a role="menuitem" tabindex="-1" id="sucursal_${a[0]}" href="javascript: void(0);">${a[1]}</a></li>`;
        ids.push(a[0]);
      });

      var dropDownSucursales = this.obtenerElementoHTML("SucursalesJetbox");
      dropDownSucursales.innerHTML = liOptions;

      let liSucursal;
      for (var i = 0; i < ids.length; i++) {
        idSucursal = ids[i];
        liSucursal = this.obtenerElementoHTML(`sucursal_${idSucursal}`);
        liSucursal.addEventListener("click", (e: Event) => this.SelectSucursal(e));
      }




    } catch (e) {
      this.mostrarMensaje("<p>Ha sucedido un error cargando las sucursales del cliente</p>", this.iconoError);
    }
  }

  sucursalIdGlobal: any;
  NombreSucursalGlobal: String;

  async SelectSucursal(Event) {

    this.sucursalIdGlobal = $(Event.srcElement).attr("id").split('_')[1];
    



    try {
 
      var respuestaPoBox = await this.llamadaGenerica({ "sucursal_id": this.sucursalIdGlobal, hint: null }, "cargando...", "clientes/cliente-generar-sjo");

      if (respuestaPoBox.success) {
        await this.limpiarDataNuevo(respuestaPoBox.Data["id"]);
        this.nuevaCuentaGenerica();
        let zonaDefault = (respuestaPoBox.Data["zona"] != null) ? (respuestaPoBox.Data["zona"]["id"]) : (0);
        this.seleccionarOptionSelect("#_Zona", zonaDefault.toString());
        this.seleccionarOptionSelect("#_ContratoNormal", "5000");
        this.seleccionarOptionSelect("#_ContratoEconomy", "6000");


        this.Mostrar_Ocultar_Campos("#pa_cliente div.mostrar_persona", "#pa_cliente div.mostrar_empresa");
        this.Mostrar_Ocultar_Campos("#pa_cliente .cliente_pobox","#pa_cliente .cliente_carga");
        this.Mostrar_Ocultar_Campos("", "#pa_cliente .pa_cliente_cambio_sucursal");
        this.seleccionarOptionSelect("#_TipoCliente", this.TIPO_PERSONA.toString());


        this.CambiarNombreSucursal();
        
        this.inhabilitarHabilitar(this.paMenuIds.pa_cliente, true);
        this.inhabilitarElementoSimple("_TipoCliente", true);
      }
      else {
        await this.mostrarMensaje("<p>Ha ocurrido un error cargando los datos</p>", this.iconoError);
      }


    } catch (e) {
      await this.mostrarMensaje("<p>Ha ocurrido un error cargando los datos " + e.toString() + "</p>", this.iconoError);
    }






  }


  CuentaCarga(): boolean {
    return this._checkRangaClienteId(this.model.cliente_id, 50000, 59999);
  }


  async CambiarNombreSucursal() {

    if (this.CuentaCarga()) {
      this.NombreSucursalGlobal = "JetBox Cargo";
    }
    else {
      var sucursalesResponse = await this.llamadaGenerica({ sucursal_id: this.sucursalIdGlobal }, 'cargando sucursal...', 'clientes/sucursal-cargar');
      this.NombreSucursalGlobal = sucursalesResponse.Data[1];
    }

  }










  //************************************** Metodo de carga de dropDown ************************************//

  async cargarDropDown(HtmlId: string, Ruta, DataCampos, valorDefecto, TextoDefecto = "",DataUrl = null) {
    var elemento = this.obtenerElementoHTML(HtmlId.substring(1, HtmlId.length));
    var options = "";
    if (TextoDefecto != "") {
      options += `<option value='${valorDefecto}'>${TextoDefecto}</option>`;
    }

    var primerElementoValor:any;
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


  async cargarProductos() {
    try {

      var divProductos = await this.obtenerElementoHTML("_Productos");
      this.llamadaGenerica({}, "cargando productos...", "parametros/productos")
        .then(function (data) {




          if (data.success) {
            let html = "";

            JSON.parse(data.DataJson).forEach((a, b) => {

              html += `<div style="display: block;">`;
              if (a[3] == true) {
                html += `<input type="checkbox" checked="checked" id="cliente_producto_${a[0]}" data-ff="cliente_producto_${a[0]}">`;
              } else {
                html += `<input type="checkbox" id="cliente_producto_${a[0]}" data-ff="cliente_producto_${a[0]}">`;
              }
              html += `<span>${a[1]}</span>`;
              html += `</div>`;

            });

            divProductos.innerHTML = html;


          }
          else {
            throw "Ha ocurrido un error mientras se cargaba los productos";
          }


        });



    } catch (e) {
      await this.mostrarMensaje("<p>" + e.toString() + "</p>", this.iconoError);
    }
  }



  //*************************************** Fin Metodos Carga ***************************************//




  //***************************************** NUEVO CARGA *****************************************//
  async nuevaCuenta20000() {
    try {
      if (this.user.codigoPais == 188) {
        this.model.sucursal = "Centro de Distribucion";
        this.sucursalIdGlobal = this.SUCURSAL_CD;
      }
      else {
        this.model.sucursal = "Sucursal Panama";
        this.sucursalIdGlobal = this.SUCURSAL_CARGA_PTY;
      }

      var respuestaNuevaCuenta = await this.llamadaGenerica({ "sucursal_id": -this.sucursalIdGlobal, "cuenta_carga": 20000 }, "cargando...", "clientes/cliente-generar-sjo");

      if (respuestaNuevaCuenta.success) {
        await this.limpiarDataNuevo(respuestaNuevaCuenta.Data["id"]);
        this.nuevaCuentaGenerica();
        this.seleccionarOptionSelect("#_Zona", this.ZONA_DR.toString());
        this.CambiarNombreSucursal();

        
        this.inhabilitarHabilitar(this.paMenuIds.pa_cliente, true);
        this.inhabilitarElementoSimple("_TipoCliente", true);
      }
      else {
        await this.mostrarMensaje("<p>Ha ocurrido un error cargando los datos</p>", this.iconoError);
      }


    } catch (e) {
      await this.mostrarMensaje("<p>Ha ocurrido un error cargando los datos " + e.toString() + "</p>", this.iconoError);
    }

  }



  async nuevaCuenta70000() {

    try {
      if (this.user.codigoPais == 188) {
        this.model.sucursal = "Centro de Distribucion";
        this.sucursalIdGlobal = this.SUCURSAL_CD;
      }
      else {
        this.model.sucursal = "Sucursal Panama";
        this.sucursalIdGlobal = this.SUCURSAL_CARGA_PTY;
      }

      var respuestaNuevaCuenta = await this.llamadaGenerica({ "sucursal_id": -this.sucursalIdGlobal, "cuenta_carga": 70000 }, "cargando...", "clientes/cliente-generar-sjo");

      if (respuestaNuevaCuenta.success) {
        await this.limpiarDataNuevo(respuestaNuevaCuenta.Data["id"]);
        this.nuevaCuentaGenerica();
        this.seleccionarOptionSelect("#_Zona", this.ZONA_DR.toString());
        this.CambiarNombreSucursal();
        this.inhabilitarHabilitar(this.paMenuIds.pa_cliente, true);
        this.inhabilitarElementoSimple("_TipoCliente", true);
        
      }
      else {
        await this.mostrarMensaje("<p>Ha ocurrido un error cargando los datos</p>", this.iconoError);
      }


    } catch (e) {
      await this.mostrarMensaje("<p>Ha ocurrido un error cargando los datos " + e.toString() + "</p>", this.iconoError);
    }
  }



  async nuevaCuentaCarga() {


    try {
      if (this.user.codigoPais == 188) {
        this.model.sucursal = "Centro de Distribucion";
        this.sucursalIdGlobal = this.SUCURSAL_CD;
      }
      else {
        this.model.sucursal = "Sucursal Panama";
        this.sucursalIdGlobal = this.SUCURSAL_CARGA_PTY;
      }

      var respuestaNuevaCuenta = await this.llamadaGenerica({ "sucursal_id": -this.sucursalIdGlobal }, "cargando...", "clientes/cliente-generar-sjo");

      if (respuestaNuevaCuenta.success) {
        await this.limpiarDataNuevo(respuestaNuevaCuenta.Data["id"]);
        this.nuevaCuentaGenerica();
        this.seleccionarOptionSelect("#_Zona", this.ZONA_DR.toString());
        this.CambiarNombreSucursal();
      }
      else {
        await this.mostrarMensaje("<p>Ha ocurrido un error cargando los datos</p>", this.iconoError);
      }


    } catch (e) {
      await this.mostrarMensaje("<p>Ha ocurrido un error cargando los datos " + e.toString() + "</p>", this.iconoError);
    }


  }



  limpiarDataNuevo(nuevoId): void {

    this.limpiarData();
    this.model.cliente_id = nuevoId;
    this.model.confeccion_guia = this.WAREHOUSE_RECEIPT;
    this.model.pa_cliente_sucursal_id = this.sucursalIdGlobal;

    this.cambiarIconoBotonGuardarEditar(false);





  }


  async cambiarIconoBotonGuardarEditar(ponerEdicion: boolean, tipoIconoBoton = "<i class='fa fa-save'></i>")
  {
    if (ponerEdicion) {
      tipoIconoBoton = "<i class='fa fa-edit'></i>";
    }

    let botonGuardar_Editar: HTMLElement = this.obtenerElementoHTML("seg_clientesModificar");
    let htmlButton: string = tipoIconoBoton;
    botonGuardar_Editar.innerHTML = htmlButton;
  }


  cuentaCarga(clienteId): boolean {
    return this._checkRangaClienteId(clienteId, 50000, 59999);;
  }

  _checkRangaClienteId(codigo_sjo, range0, range1): boolean {
    try {
      if (codigo_sjo != null && codigo_sjo.length > 0) {
        let cliente_id = parseInt((codigo_sjo));

        return cliente_id >= range0 && cliente_id < range1;
      }
    } catch (ex) {
      // ignore;
    }
    return false;
  }

  //******************************* FIN NUEVO CARGA **************************************************//





  //************************** Seguridad -> Ocultar - Mostrar Campos *********************************//
  aplicarSeguridad(): void {
    try {

      let ids =
        [
          "#pa_cliente",
          "div#pa_persona",
          "#pa_empresa",
          "div.row.pages",
          "#DivMenuIzquierda ul.nav li",
          this.paMenuIds.pa_direccion0,
          this.paMenuIds.pa_direccion1,
          this.paMenuIds.pa_direccion2,
          this.paMenuIds.pa_tarjetas,
          this.paMenuIds.pa_autorizados,
          this.paMenuIds.pa_contactos,
          this.paMenuIds.pa_imagenes

        ]


      $(ids.join(",")).each(function () {
        $(this).hide("fast");
      });

      ids =
        [
          this.paMenuIds.pa_persona + " div",
          this.paMenuIds.pa_empresa + " div",
          this.paMenuIds.pa_direccion0 + " div",
          this.paMenuIds.pa_direccion1 + " div",
          this.paMenuIds.pa_direccion2 + " div"
        ];


      $(ids.join(",")).each(function () {
        $(this).show("fast");
      });





    } catch (e) {
      this.mostrarMensaje("<p>Ha sucedido un error aplicando la seguridad</p>", this.iconoError);
    }
  }
  async ocultarCamposBusqueda() {
    try {

      var ids =
        [
          "#select_TipoClienteBuscar",
          "#Busqueda_Sucursales",
          "#Busqueda_Sucursales",
          "#Busqueda_Zonas",
          "#TablaClientesResultado"
        ];


      $(ids.join(",")).each(function () {
        $(this).hide("fast");
      });
    } catch (e) {
      this.mostrarMensaje("<p>Ha sucedido un error aplicando la seguridad</p>", this.iconoError);
    }
  }
  Mostrar_Ocultar_Campos(idsMostrarCampos: string, idsocultarCampos: string, camposNOMostrar: string = "", camposNOOcultar: string = ""): void {
    try {

      if (!UtilApp.isNullOrUndefined(camposNOMostrar) && camposNOMostrar != "") {

        if (idsMostrarCampos != "") {
          $(idsMostrarCampos).not(camposNOMostrar).each(function () {
            $(this).show("fast");
          });
        }

      }
      else {
        if (idsMostrarCampos != "") {
          $(idsMostrarCampos).each(function () {
            $(this).show("fast");
          });
        }
      }



      if (!UtilApp.isNullOrUndefined(camposNOOcultar) && camposNOOcultar != "") {
        if (idsocultarCampos != "") {
          $(idsocultarCampos).not(camposNOOcultar).each(function () {
            $(this).hide("fast");
          });
        }
      }
      else {
        if (idsocultarCampos != "") {
          $(idsocultarCampos).each(function () {
            $(this).hide("fast");
          });
        }
      }


    } catch (e) {
      this.mostrarMensaje("<p>Ha sucedido un error aplicando la seguridad de campos</p>", this.iconoError);
    }

  }

  //******************************** Fin de seguridad //Ocultar - Mostrar Campos ***************************//


  //********************** Metodos modal busqueda ******************************//

  async cambiarTipoBusqueda(event) {

    let optionValue = parseInt(event.target.value);
    let idBusquedaZona = "#Busqueda_Zonas";
    let idBusquedaSucursal = "#Busqueda_Sucursales";
    let idBusquedaTipoCliente = "#select_TipoClienteBuscar";
    let idBusquedaDigitada = "#txtContenidoBuscar";


    let camposMostrar = [];
    let camposOcultar = [];

    switch (optionValue) {

      case this.BUSQUEDA_OPTION_ZONA:
        {

          camposOcultar.push(idBusquedaDigitada);
          camposOcultar.push(idBusquedaTipoCliente);
          camposOcultar.push(idBusquedaSucursal);

          camposMostrar.push(idBusquedaZona);

          this.Mostrar_Ocultar_Campos(camposMostrar.join(","), camposOcultar.join(","));

          break;
        }
      case this.BUSQUEDA_OPTION_TIPO:
        {

          camposOcultar.push(idBusquedaDigitada);
          camposOcultar.push(idBusquedaZona);
          camposOcultar.push(idBusquedaSucursal);

          camposMostrar.push(idBusquedaTipoCliente);

          this.Mostrar_Ocultar_Campos(camposMostrar.join(","), camposOcultar.join(","));

          break;
        }
      case this.BUSQUEDA_OPTION_EMPRESA:
        {


          break;
        }
      case this.BUSQUEDA_OPTION_SUCURSAL:
        {
          camposOcultar.push(idBusquedaDigitada);
          camposOcultar.push(idBusquedaZona);
          camposOcultar.push(idBusquedaTipoCliente);

          camposMostrar.push(idBusquedaSucursal);

          this.Mostrar_Ocultar_Campos(camposMostrar.join(","), camposOcultar.join(","));
          break;
        }

      default:
        {
          camposOcultar.push(idBusquedaSucursal);
          camposOcultar.push(idBusquedaZona);
          camposOcultar.push(idBusquedaTipoCliente);

          camposMostrar.push(idBusquedaDigitada);

          this.Mostrar_Ocultar_Campos(camposMostrar.join(","), camposOcultar.join(","));

          break;
        }
    }


  }

  async ValidarBusquedaCliente() {
    try {

      let txtsjoCliente = $("#txtClienteBuscarsjo");
      if (UtilApp.isNullOrUndefined(txtsjoCliente.val()) || txtsjoCliente.val() == "") {
        this.triggerClick("abrirModalBusqueda");
      }
      else {
        this.cargarCliente();
      }



    } catch (e) {

    }
  }

  async buscarCliente() {

    
    let tipo_dato = parseInt(UtilApp.isNullOrUndefined($("#TipoFiltroBusqueda option:selected").val()) == true ? "0" : $("#TipoFiltroBusqueda option:selected").val().toString());
    let BusquedaZona = $("#Busqueda_Zonas_Select");
    let BusquedaSucursal = $("#Busqueda_Sucursales_Select");
    let BusquedaTipoCliente = $("#select_TipoClienteBuscar_Select");
    let BusquedaDigitada = $("#txtContenidoBuscar");
    let BusquedaTipoBusqueda = $("#Busqueda_TipoBusqueda_Select");
    let BusquedaTipoTipoFiltroBusqueda = $("#TipoFiltroBusqueda");
    let valorBuscar = "";


    let TablaClientesResultadoId = "#TablaClientesResultado";
    let contenidoClientesTablaId = "contenidoClientesTabla";

    switch (tipo_dato) {

      case this.BUSQUEDA_OPTION_ZONA:
        {
          valorBuscar = BusquedaZona.val().toString();
          break;
        }
      case this.BUSQUEDA_OPTION_TIPO:
        {
          valorBuscar = BusquedaTipoCliente.val().toString();
          break;
        }
      case this.BUSQUEDA_OPTION_EMPRESA:
        {


          break;
        }
      case this.BUSQUEDA_OPTION_SUCURSAL:
        {
          valorBuscar = BusquedaSucursal.val().toString();
          break;
        }

      default:
        {
          valorBuscar = BusquedaDigitada.val().toString();
          break;
        }
    }

    if (UtilApp.isNullOrUndefined(valorBuscar) || valorBuscar == "") {
      await this.mostrarMensaje("<p>Digite un valor para generar la busqueda de clientes.</p>", this.iconoError);
      return false;
    }

    var clientes = await this.llamadaGenerica({ tipo_busqueda: BusquedaTipoBusqueda.val(), tipo_dato: tipo_dato.toString(), value: valorBuscar }, "buscando clientes...", "clientes/cliente-consultar");


    if (clientes.success) {



      var contenidoClientesTabla = await this.obtenerElementoHTML(contenidoClientesTablaId);

      var html = "";
      var ids = [];
      JSON.parse(clientes.DataJson).forEach((a, b) => {

        html += `<tr id="rowCliente_${a[0]}">`;
        html += `<td>${a[0]}</td>`;
        html += `<td>${a[1]}</td>`;
        html += `<td>${a[2]}</td>`;
        html += `<td>${a[3]}</td>`;
        html += `<td>${a[4]}</td>`;
        html += `<td>${a[5]}</td>`;
        html += `<td>${a[6]}</td>`;
        html += `<td>${a[7]}</td>`;
        html += `</tr>`;
        ids.push(a[0]);
      });

      contenidoClientesTabla.innerHTML = html;


      let rowCliente;
      for (var i = 0; i < ids.length; i++) {
        rowCliente = this.obtenerElementoHTML(`rowCliente_${ids[i]}`);
        rowCliente.addEventListener("dblclick", (e: Event) => this.SeleccionarClienteBusqueda(e));
      }

      this.Mostrar_Ocultar_Campos(TablaClientesResultadoId, "");

    }
    else {
      await this.mostrarMensaje("<p>Ha sucedido un error en la busqueda de clientes</p>", this.iconoError);
    }

  }

  async SeleccionarClienteBusqueda(e) {
    let txtsjoCliente = $("#txtClienteBuscarsjo");
    let data = [];
    $(e.srcElement.parentElement).find("td").each(function () {
      data.push($(this).text());
    });

    this.clienteSeleccionadoBusqueda.Id = data[0];
    this.clienteSeleccionadoBusqueda.Nombre = data[1];
    this.clienteSeleccionadoBusqueda.NombreCorto = data[2];
    this.clienteSeleccionadoBusqueda.Tipo = data[3];
    this.clienteSeleccionadoBusqueda.Sucursal = data[4];
    this.clienteSeleccionadoBusqueda.Cedula = data[5];
    this.clienteSeleccionadoBusqueda.Email = data[6];
    this.clienteSeleccionadoBusqueda.Zona = data[7];

    txtsjoCliente.val(this.clienteSeleccionadoBusqueda.Id);
    this.triggerClick("btnCerrarModalBusqueda");
    this.cargarCliente();




  }

  async keyPressBuscarSJO(event)
  {
    let txtsjoCliente = $("#txtClienteBuscarsjo").val();

    if (txtsjoCliente != "") {
      if (event.keyCode == 13) {
        this.cargarCliente();
      }
    }

  }

  //************************************ Fin metodos modal busqueda ******************************//




  //*********************************** Metodos cliente **************************************//

  async obtenerDataClienteActual() {
    try {

      let txtsjoCliente = "";

      if (!UtilApp.isNullOrUndefined(this.model.cliente_id) && $("#txtClienteBuscarsjo").val() == "") {
        txtsjoCliente = this.model.cliente_id;
      }
      else {
        txtsjoCliente = $("#txtClienteBuscarsjo").val().toString();
      }



      let respuesta = this.llamadaGenerica({ cliente_id: txtsjoCliente }, "cargando datos de " + this.clienteSeleccionadoBusqueda.Nombre, "clientes/cliente-cargar");

      return respuesta;


    } catch (e) {
      return null;
    }
  }


  async cargarCliente() {

    var data: any = await this.obtenerDataClienteActual();

    if (data.success) {
      this.mostrarCliente(data.Data)
    }
    else {
      this.mostrarMensaje("<p>El cliente digitado no existe</p>", this.iconoError);
    }
  }


  
  async imprimirCliente() {

   

    if (this._lista != null) {

      
      let report_name = this._lista[0][3] == "10" ? ("juridico") : ("fisico");
      let orden: string = "1";
      let zona: string = this._lista[0][24];
      let estado: string = this._lista[0][4];
      let sucursal: string = this._lista[0][23];
      let usuario: string = this.user.username;

      let data = {};
      data["zona"] = zona.toString();
      data["orden"] = orden.toString();
      data["estado"] = estado.toString();
      data["cdesde"] = this._lista[0][0].toString();
      data["chasta"] = this._lista[0][0].toString();
      data["nacdesde"] = "1900-01-01";
      data["nachasta"] = "3000-12-31";
      data["usuario"] = usuario.toString();
      data["sucursal"] = sucursal.toString();

      var resultado = await this.llamadaGenerica(data, "mostrando reporte...", "reportes/" + report_name);

      if (resultado.success) {
        var ruta = AppConfigService.settings.server + "reportes/shwpdf/" + resultado.Data[0];
        window.open(ruta, "_blank");

      }
      else {
        this.mostrarMensaje("<p>Hubo un problema al mostrar el reporte</p>", this.iconoError);
      }

    }
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


  restablecerValorElemento(elemento):void {

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
      else if (element.is("input[type='date']")) {
        element.val(this.obtenerFechaActual());
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

  async editar_guardar_click() {
    if (UtilApp.isNullOrUndefined(this.model.cliente_id) || this.model.cliente_id == "") {
      return;
    }




    let botonGuardar_Editar: HTMLElement = this.obtenerElementoHTML("seg_clientesModificar");
    let htmlButton: string = botonGuardar_Editar.innerHTML;
    let esGuardado = htmlButton.includes("fa fa-save");
    let pa_pagina = $("nav li.active a").attr("data-pa");
    pa_pagina = pa_pagina.substring(1, pa_pagina.length);


    
    if (esGuardado) {


      if (pa_pagina == "pa_direccion2" && UtilApp.isNullOrUndefined(this.model.pa_cliente_direccion1_id)) {
        this.mostrarMensaje("<p>Por favor llene primero la direccion 1</p>", this.iconoError);
        return;
      }

      
      var data = {};
      data["lugar-afiliacion"] = "Clientes_Web";
     // $(`div.${pa_pagina} input, div.${pa_pagina} select, div.${pa_pagina} textarea`).each(function () {
      $(`#${pa_pagina} input, #${pa_pagina} select, #${pa_pagina} textarea`).each(function () {
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



      data["tipo_cliente"] = $("#_TipoCliente").find("option:selected").eq(0).val();
      data["pa_data"] = pa_pagina;
      data["cliente_id"] = this.model.cliente_id;
      data["sucursal_id"] = this.sucursalIdGlobal;

      if (this.model.pa_cliente_persona_id != null) {
        data["persona_id"] = this.model.pa_cliente_persona_id;
      }

      if (this.model.pa_cliente_apoderado_id != null) {
        data["apoderado_id"] = this.model.pa_cliente_apoderado_id
      }
      
      data["direccion_id"] = (pa_pagina == "pa_direccion0")
        ? (this.model.pa_cliente_direccion0_id)
        : (pa_pagina == "pa_direccion1" ? this.model.pa_cliente_direccion1_id : this.model.pa_cliente_direccion2_id);


      
      var resultadoObjetoSeccion = this._PA_URLS.filter(x => x.NombreSeccion == pa_pagina)[0];

      if (!UtilApp.isNullOrUndefined(resultadoObjetoSeccion)) {

        let resultadoGuardar = await this.llamadaGenerica(data, "guardando datos...", resultadoObjetoSeccion.Url);

        if (resultadoGuardar.success) {

          if (pa_pagina == "pa_direccion1") {

            let dataClienteResponse: any = await this.obtenerDataClienteActual();
            let cliente = dataClienteResponse["Data"][0];
            this.model.pa_cliente_direccion1_id = cliente[28];
          }


          if (this.esNuevoCliente) {
            this.cargarCliente();
          }

        }
        else {
          await this.mostrarMensaje("<p>No se ha podido actualizar o guardar la informacion</p>", this.iconoError);
        }

      }

      this.cambiarIconoBotonGuardarEditar(true);
      this.inhabilitarHabilitar(pa_pagina, false);



    }
    else {
      //htmlButton = ;
     // botonGuardar_Editar.innerHTML = htmlButton;

      this.cambiarIconoBotonGuardarEditar(false, "<i class='fa fa-save'></i>");
      this.inhabilitarHabilitar(pa_pagina, true);


    }





  }



  validarEliminarCliente(): void
  {
    if (!UtilApp.isNullOrUndefined(this.model.cliente_id)) {

      this.triggerClick("btnEliminarCliente");

    }
  }

  async eliminarCliente() {

    if (!UtilApp.isNullOrUndefined(this.model.cliente_id)) {

      var respuesta = await this.llamadaGenerica({ cliente_id: this.model.cliente_id }, "eliminando...", "clientes/cliente-borrar");

      if (respuesta) {






        this.restablecerTodosLosValores();

        await this.mostrarMensaje("<p>Se ha eliminado correctamente</p>", this.iconoSuccess);
      } else {
        await this.mostrarMensaje("<p>No se ha podido eliminar el cliente</p>", this.iconoError);
      }


    }

  }


  restablecerTodosLosValores(): void
  {

    let d = new Date();
    var datestring = (d.getFullYear().toString() + "-" + (d.getMonth() + 1).toString() + "-" + d.getDate().toString());

    $(`${this.paMenuIds.pa_cliente} input, ${this.paMenuIds.pa_cliente} select, ${this.paMenuIds.pa_cliente} textarea,${this.paMenuIds.pa_persona} input, ${this.paMenuIds.pa_persona} select, ${this.paMenuIds.pa_persona} textarea,${this.paMenuIds.pa_empresa} input, ${this.paMenuIds.pa_empresa} select, ${this.paMenuIds.pa_empresa} textarea,${this.paMenuIds.pa_direccion0} input, ${this.paMenuIds.pa_direccion0} select, ${this.paMenuIds.pa_direccion0} textarea,${this.paMenuIds.pa_direccion1} input, ${this.paMenuIds.pa_direccion1} select, ${this.paMenuIds.pa_direccion1} textarea,${this.paMenuIds.pa_direccion2} input, ${this.paMenuIds.pa_direccion2} select, ${this.paMenuIds.pa_direccion2} textarea`)
      .each(function () {


        let elemento = $(this);

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
          else if (element.is("input[type='date']")) {
            element.val(datestring);
          }

        } catch (e) {

        }
        

    });

    
    this.cargarTabla("pa_tarjetas_bodyTable", null, this.objSeccion.seccionTarjeta, this.user.menuItems.includes("CLI_tarjetas_mostrar"));
    this.cargarTabla("pa_autorizados_bodyTable", null, this.objSeccion.seccionAutorizados, this.user.menuItems.includes("CLI_autorizados_modificar"));
    this.cargarTabla("pa_contactos_bodyTable", null, this.objSeccion.seccionContacto, this.user.menuItems.includes("CLI_contactos_modificar"));
    this.cargarTabla("pa_imagenes_bodyTable", null, this.objSeccion.seccionImagenes, this.user.menuItems.includes("CLI_imagenes_modificar"));
    //this.setearValorFechaDefault();

   // this.aplicarSeguridad();



  }


  async mostrarCliente(dataCliente) {

    this.esNuevoCliente = false;
    this.cambiarIconoBotonGuardarEditar(true);
    this.limpiarData();


    /**** Variables UI ****/
    let classPersona = ".row.pages.pa_cliente.mostrar_persona";
    let classPaCliente = ".row.pages.pa_cliente";
    let classEmpresa = ".row.pages.pa_cliente.mostrar_empresa";
    let classCambioSucursal = ".row.pages.pa_cliente.pa_cliente_cambio_sucursal";
    let classClienteCarga = ".row.pages.pa_cliente.cliente_carga";

    let checkAttribute = "checked";

    /**** Variables UI ****/

    this._lista = dataCliente;
    let cliente = dataCliente[0];
    let correo = dataCliente[1];
    let persona = dataCliente[2];
    let apoderado = dataCliente[3];
    let productos = dataCliente[4];
    let autorizaciones = dataCliente[5];
    //let pais_select = shadowRoot.querySelector("#_EmpresaPais") as SelectElement;
    let tarjetas = dataCliente[6];
    let imagenes = dataCliente[7];
    let contactos = dataCliente[8];
    let autorizados = dataCliente[9];

    let esCuentaCarga = this.cuentaCarga(cliente[0]);
    let esCuentaPobox = !this.cuentaCarga(cliente[0]);

    let esEmpresa = cliente[3] == this.TIPO_EMPRESA ? true : false;

    /*******Seccion cliente PERSONA******/

    this.model.cliente_id = cliente[0];
    this.sucursalIdGlobal = cliente[23];
    this.CambiarNombreSucursal();
    this.model.confeccion_guia = esCuentaCarga == true ? this.WAREHOUSE_RECEIPT : this.CONFECCION_GUIA;


    let boolResult = false;
    let checkbox: HTMLElement;
    this.model.pa_persona_nombre = this.validadorString(persona[9]);
    this.model.pa_persona_primer_apellido = this.validadorString(persona[10]);
    this.model.pa_persona_segundo_apellido = this.validadorString(persona[11]);;
    this.validarCheckCheckbox((this.validadorString(cliente[5]) == "1"), "_CuentaEmpleado");
    this.setearValorElemento("#_FechaIngreso", this.obtenerFechaCustom(this.validadorString(cliente[8])));
    this.model.pa_cliente_codigo_promocion = cliente[20];
    this.validarCheckCheckbox((cliente[9] != null && cliente[9]), "_AlianzaDatosCompletos");


    //****Zona DropDowns***//

    this.seleccionarOptionSelect("#_TipoCliente", cliente[3]);
    this.seleccionarOptionSelect("#_CambioSucursal", "-1");
    this.seleccionarOptionSelect("#_Idioma", cliente[11]);
    this.seleccionarOptionSelect("#_Alianza", cliente[22] == null ? "-1" : cliente[22]);
    this.seleccionarOptionSelect("#_ContratoNormal", correo[1] == null ? "-1" : correo[1]);
    this.seleccionarOptionSelect("#_ContratoEconomy", correo[2] == null ? "-1" : correo[2]);
    this.seleccionarOptionSelect("#_EjecutivoCuenta", correo[3] == null ? "-1" : correo[3]);
    this.seleccionarOptionSelect("#_EstadoCliente", cliente[4]);
    this.seleccionarOptionSelect("#_Zona", cliente[24]);






    this.seleccionarOptionSelect("#_PersonaComoConocio", this.validadorString(cliente[21], true, "0"));
    this.seleccionarOptionSelect("#_EmpresaComoConocio", this.validadorString(cliente[21], true, "0"));
    this.seleccionarOptionSelect("#_TipoCredito", cliente[31]);
    //****Zona DropDowns***//



    this.model.pa_cliente_recomendado_por = cliente[17];
    this.validarCheckCheckbox(correo[4], "_PagoTarjeta");
    this.validarCheckCheckbox(cliente[34], "_CargoMensajeria");
    this.validarCheckCheckbox(cliente[33], "_RecibidoConforme"); //cliente cargo guia 
    this.validarCheckCheckbox((cliente[32] != null && cliente[32]), "_RecogeSucursal"); //cliente cargo guia 


    this.model.pa_cliente_notas = cliente[14];
    this.model.pa_cliente_historial_zona = cliente[15];

    this.Mostrar_Ocultar_Campos(classPaCliente, "");
    this.Mostrar_Ocultar_Campos(this.paMenuIds.pa_cliente, "");
    this.Mostrar_Ocultar_Campos("", classClienteCarga);
    this.Mostrar_Ocultar_Campos("", classEmpresa);


    //Seccion persona Tap


    this.model.pa_cliente_persona_id = persona[0];
    this.seleccionarOptionSelect("#_PersonaTipoId", this.validadorString(persona[7], true));
    this.model.pa_persona_identificacion = this.validadorString(persona[6]);
    this.model.pa_persona_fecha_nacimiento = persona[8];
    this.setearValorElemento("#_PersonaFechaNacimiento", this.obtenerFechaCustom(this.validadorString(persona[8])));
    this.validarCheckCheckbox((persona[8] == null), "check_persona_per_fechaNacimientoNoDefinida");
    this.seleccionarOptionSelect("#_Sexo", this.validadorString(persona[4], true));
    this.seleccionarOptionSelect("#_Nacionalidad", this.validadorString(persona[3], true));
    this.seleccionarOptionSelect("#_EstadoCivil", this.validadorString(persona[5], true));
    this.seleccionarOptionSelect("#_Profesion", this.validadorString(persona[2], true));



    this.model.pa_persona_celular = this.formatoTel(this.validadorString(persona[12], false, null, "")).replace(" ","");
    this.model.pa_persona_telefono1 = this.formatoTel(persona[13]).replace(" ", "");
    this.model.pa_persona_telefono2 = this.formatoTel(persona[14]).replace(" ", "");

    this.seleccionarOptionSelect("#_DireccionTTelefono0111", this.validadorString(persona[15], true, "0"));
    this.seleccionarOptionSelect("#_DireccionTTelefono012", this.validadorString(persona[16], true, "0"));


    this.model.pa_persona_email1 = persona[17];
    this.model.pa_persona_email2 = persona[18];







    /*********Fin Seccion Cliente y persona*******************/




    /*********Seccion Empresa Tab****************************/

    this.model.pa_cliente_nombre = this.validadorString(cliente[1]);
    this.model.pa_empresa_nombre_corto = this.validadorString(cliente[2]);
    this.model.pa_empresa_cedula_juridica = this.validadorString(cliente[7]);
    this.seleccionarOptionSelect("#_EmpresaPais", this.user.codigoPais.toString());
    this.model.pa_empresa_celular = apoderado[12];
    this.model.pa_empresa_email1 = apoderado[17];
    this.seleccionarOptionSelect("#_ApoderadoTipoId", this.validadorString(apoderado[7], true));

    this.model.pa_empresa_apoderado_id = this.validadorString(apoderado[6]);
    this.model.pa_empresa_apoderado_nombre = this.validadorString(apoderado[9]);
    this.model.pa_empresa_apoderado_primer_apellido = this.validadorString(apoderado[10]);
    this.model.pa_empresa_apoderado_segundo_apellido = this.validadorString(apoderado[11]);
    this.model.pa_empresa_apoderado_igual_contacto = this.validarCheckCheckbox((cliente[30] == true ? true : false), "_ApoderadoMismoContacto");




    /*********Seccion Empresa Tab****************************/




    /*********Seccion Direccion Fija Tab****************************/
    this.seleccionarOptionSelect("#_DireccionPais00", this.validadorString(this.user.codigoPais, true));


    /*********Seccion Direccion Fija Tab****************************/











    //*******************Direcciones******************//
    this.model.pa_cliente_direccion0_id = cliente[27];
    this.model.pa_cliente_direccion1_id = cliente[28];
    this.model.pa_cliente_direccion2_id = cliente[29];
    
  
      await this.cargarDireccion(cliente[27], "0","pa_direccion0");
      await this.cargarDireccion(cliente[28], "1", "pa_direccion1");
      await this.cargarDireccion(cliente[29],"2", "pa_direccion2");
    
   
    if (esEmpresa) {
      await this.cargarDireccionEmpresa(this.model.pa_cliente_direccion0_id)
    }


    if (esCuentaCarga) {
      $("#pa_cliente .cliente_carga").show();
    }

    //*******************Direcciones******************//





    this.cargarTabla("pa_tarjetas_bodyTable", tarjetas, this.objSeccion.seccionTarjeta, this.user.menuItems.includes("CLI_tarjetas_mostrar"));
    this.cargarTabla("pa_autorizados_bodyTable", autorizados, this.objSeccion.seccionAutorizados, this.user.menuItems.includes("CLI_autorizados_modificar"));
    this.cargarTabla("pa_contactos_bodyTable", contactos, this.objSeccion.seccionContacto, this.user.menuItems.includes("CLI_contactos_modificar"));
    this.cargarTabla("pa_imagenes_bodyTable", imagenes, this.objSeccion.seccionImagenes, this.user.menuItems.includes("CLI_imagenes_modificar"));






    this.validarCheckBoxProductos(this.model.cliente_id, productos, this.cuentaCarga(this.model.cliente_id));



    //**************** Mostrar menu izquierda y campos en form inicial ********************************88//


    await this.Mostrar_Ocultar_Campos("#DivMenuIzquierda ul.nav li", "");

    let liMenuOcultarEmpresa =
      [
        "#seg_clientesPersonaMostrar"
      ];


    let liMenuOcultarPersona =
      [
        "#seg_clientesEmpresaMostrar",
        "#seg_clientesContactosMostrar"
      ];


    if (cliente[3] == this.TIPO_PERSONA) {
      await this.Mostrar_Ocultar_Campos("", liMenuOcultarPersona.join(","));
    }
    else if (cliente[3] == this.TIPO_EMPRESA) {
      await this.Mostrar_Ocultar_Campos("", liMenuOcultarEmpresa.join(","));
    }


    this.validarCamposTipo(cliente[3]);



    this.pa_Click("#seg_clientesMostrar");
    this.inhabilitarElementoSimple("_TipoCliente");
    this.inhabilitarHabilitar(this.paMenuIds.pa_cliente);

  };


  async cargarDireccionEmpresa(direccion_id)
  {


    var resultado = await this.llamadaGenerica({ cliente_id: this.model.cliente_id, direccion_id: direccion_id }, "", "clientes/direccion-cargar",false);


    if (resultado.success) {

      let values = resultado.Data;

      this.seleccionarOptionSelect("#_EmpresaPais", await this.validadorString(values[4], true, "0"));

      await this.llenarCantonProvincia("#_EmpresaProvincia", "#_EmpresaCanton", values[5], values[6], values[4]);

      this.model.pa_empresa_direccion = values[8];
      this.model.pa_empresa_email1 = values[18];

      this.model.pa_empresa_celular = this.formatoTel(values[9]);
      this.model.pa_empresa_telefono1 = this.formatoTel(values[10]);
      this.model.pa_empresa_telefono2 = this.formatoTel(values[11]);
      this.model.pa_empresa_telefono3 = this.formatoTel(values[12]);
      this.model.pa_empresa_telefono4 = this.formatoTel(values[13]);


      this.seleccionarOptionSelect("#_EmpresaTTelefono1", await this.validadorString(values[14], true, "0"));
      this.seleccionarOptionSelect("#_EmpresaTTelefono2", await this.validadorString(values[15], true, "0"));
      this.seleccionarOptionSelect("#_EmpresaTTelefono3", await this.validadorString(values[16], true, "0"));
      this.seleccionarOptionSelect("#_EmpresaTTelefono4", await this.validadorString(values[17], true, "0"));


    }
    else {
      console.log("cargarDireccionEmpresa", "no se pudo cargar");
    }



  }

  async cargarDireccion(idDireccion, direccionSufijo: string, pa_data:string)
  {
    let dir_suffix = '0' + direccionSufijo;
    let direccion_id = idDireccion;
    var pais_select = "#_DireccionPais" + dir_suffix;
    var DireccionRutaId = "#_DireccionRuta" + dir_suffix;
    var DireccionDistritoId = "#_DireccionDistrito" + dir_suffix;
    var DireccionProvinciaSelect = "#_DireccionProvincia" + dir_suffix;
    var DireccionCantonSelect = "#_DireccionCanton" + dir_suffix;


    var nombreReferencia = "#_DireccionPrimaria0" + direccionSufijo; //text
    var dejarPaqueteCon = "#_DireccionAutorizarDejarPaquete" + direccionSufijo; //text
    var direccionEspecifica = "#_DireccionDireccion" + dir_suffix; //text
    var direccionCelular = "#_DireccionCelular" + dir_suffix; //text
    var tipoTelefono = "_DireccionTTelefono" + dir_suffix + "1"; //select
    var numeroTelefono = "direccion_tel" + dir_suffix;
    var coordenadas = "_DireccionCoordenadas" + dir_suffix; //text
    var desdeSelect = "_selectHoraUno" + dir_suffix;
    var hastaSelect = "_selectHoraDos01" + dir_suffix;

    let checkboxLunesId = "LunesSelect" + dir_suffix;
    let checkboxMartesId = "MartesSelect" + dir_suffix;
    let checkboxMiercolesId = "MiercolesSelect" + dir_suffix;
    let checkboxJuevesId = "JuevesSelect" + dir_suffix;
    let checkboxViernesId = "ViernesSelect" + dir_suffix;
    let checkboxSabadoId = "SabadoSelect" + dir_suffix;
    let checkboxDomingoId = "DomingoSelect" + dir_suffix;


    await this.seleccionarOptionSelect(pais_select, this.user.codigoPais.toString());
    await this.seleccionarOptionSelect(DireccionRutaId, "-1");
    await this.seleccionarOptionSelect(DireccionDistritoId, "-1");

    await this.llenarCantonProvincia(DireccionProvinciaSelect, DireccionCantonSelect, "-1","-1");


    this.model.pa_direccion_nombre = "";
    this.model.pa_direccion_autorizar_dejar_paquete = "";
    this.model.pa_direccion_direccion = "";


    this.model.pa_direccion_celular = "";
    this.model.pa_direccion_telefono1 = "";
    this.model.pa_direccion_telefono2 = "";
    this.model.pa_direccion_telefono3 = "";
    this.model.pa_direccion_telefono4 = "";

    this.setearValorElemento($("." + pa_data + ".direccion_ttel1"), "0");
    this.setearValorElemento($("." + pa_data + ".direccion_ttel2"), "0");
    this.setearValorElemento($("." + pa_data + ".direccion_ttel3"), "0");
    this.setearValorElemento($("." + pa_data + ".direccion_ttel4"), "0");


    this.model.pa_direccion_celular = "";
    this.model.pa_direccion_telefono1 = "";
    this.model.pa_direccion_telefono2 = "";
    this.model.pa_direccion_telefono3 = "";
    this.model.pa_direccion_telefono4 = "";


    this.validarCheckCheckbox(false, checkboxLunesId,       null)
    this.validarCheckCheckbox(false, checkboxMartesId,     null)
    this.validarCheckCheckbox(false, checkboxMiercolesId,  null)
    this.validarCheckCheckbox(false, checkboxJuevesId,     null)
    this.validarCheckCheckbox(false, checkboxViernesId,     null)
    this.validarCheckCheckbox(false, checkboxSabadoId,      null)
    this.validarCheckCheckbox(false, checkboxDomingoId, null)

    this.setearValorElemento(nombreReferencia, "");
    this.setearValorElemento(dejarPaqueteCon, "");
    this.setearValorElemento(direccionEspecifica, "");
    this.setearValorElemento(direccionCelular, "");
    this.seleccionarOptionSelect(tipoTelefono, "0");
    this.setearValorElemento(numeroTelefono, "");
    this.setearValorElemento(coordenadas, "");
    this.seleccionarOptionSelect(desdeSelect, "-1");
    this.seleccionarOptionSelect(hastaSelect, "-1");


    this.seleccionarOptionSelect("#_ContactoPais", this.user.codigoPais.toString());


    if (direccion_id != null) {
      var direccionRespuesta = await this.llamadaGenerica({ cliente_id: this.model.cliente_id, direccion_id: idDireccion }, "", "clientes/direccion-cargar",false);

      if (direccionRespuesta.success) {

        var values = direccionRespuesta.Data;
        

        this.setearValorElemento(nombreReferencia, this.validadorString(values[1], false, "", ""));
        this.setearValorElemento(dejarPaqueteCon, this.validadorString(values[2],false,"",""));
       
        
        
        
        


        this.seleccionarOptionSelect(DireccionRutaId, this.validadorString(values[3], true, "0"));
        if (parseInt(this.validadorString(values[4], false, "", "0")) <= 0) {
          values[4] = this.user.codigoPais;
        }
        this.seleccionarOptionSelect(pais_select, values[4]);
        await this.llenarCantonProvincia(DireccionProvinciaSelect, DireccionCantonSelect, values[5], values[6], values[4]);

        this.setearValorElemento(direccionEspecifica, this.validadorString(values[8], false, "", ""));


        this.setearValorElemento(direccionCelular, this.formatoTel(values[9]));

        this.setearValorElemento(numeroTelefono, this.formatoTel(values[10]));

        this.model.pa_direccion_telefono2 = this.formatoTel(values[11]);
        this.model.pa_direccion_telefono3 = this.formatoTel(values[12]);
        this.model.pa_direccion_telefono4 = this.formatoTel(values[13]);

        this.seleccionarOptionSelect(tipoTelefono, this.validadorString(values[14],true,"0"));
        this.setearValorElemento($("." + pa_data + ".direccion_ttel2"), values[15]);
        this.setearValorElemento($("." + pa_data + ".direccion_ttel3"), values[16]);
        this.setearValorElemento($("." + pa_data + ".direccion_ttel4"), values[17]);

        
        this.setearValorElemento(coordenadas, this.validadorString(values[20]));
        this.model.pa_direccion_imagen = (values[21] != null && values[21].length > 0) ? (values[21]) : ("img/FaltaImagen.jpg");

        
        
          this.validarCheckCheckbox((values[22] == true ? true : false), checkboxLunesId, null);
          this.validarCheckCheckbox((values[23] == true ? true : false), checkboxMartesId, null);
          this.validarCheckCheckbox((values[24] == true ? true : false), checkboxMiercolesId, null);
          this.validarCheckCheckbox((values[25] == true ? true : false), checkboxJuevesId, null);
          this.validarCheckCheckbox((values[26] == true ? true : false), checkboxViernesId, null);
          this.validarCheckCheckbox((values[27] == true ? true : false), checkboxSabadoId, null);
          this.validarCheckCheckbox((values[28] == true ? true : false), checkboxDomingoId, null);
        



        let desde = values[29];
        let hasta = values[30];

        //this.setearValorElemento($(`div.${pa_data} select[data-ff='direccion_dir_hora1']`), desde);
        //this.setearValorElemento($(`div.${pa_data} select[data-ff='direccion_dir_hora2']`), hasta);
        this.seleccionarOptionSelect(desdeSelect, this.validadorString(desde,true,"-1"));
        this.seleccionarOptionSelect(hastaSelect, this.validadorString(hasta, true, "-1"));
  

      }
      else {
        throwError("No se ha podido cargar la data de direccion.Respuesta: ");
      }
    }



  }


  obtenerCheckboxDias(pa_dataClass,dia:number)
  {
    return $(pa_dataClass).find("input[type='checkbox']").eq(dia);
  }

  async llenarCantonProvincia(selectProvincias: string, selectCanton: string,provinciaId,cantonId,paisId:number = 0)
  {
    let url_provincias = "parametros/divisiones";
    let url_cantones = "parametros/subdivisiones";


    var provincias = await this.llamadaGenerica({ pais_id: (paisId == 0 ? this.user.codigoPais : paisId) }, "", url_provincias,false);

    if (provincias.success) {

      let options = "";
      JSON.parse(provincias.DataJson).forEach((a, b) => {
          options += `<option value='${a[0]}'>${a[1]}</option>`;
      });

      $(selectProvincias).html(options);


      if (parseInt(provinciaId) <= 0) {
        provinciaId = provincias.Data[0][0];
    }


      this.seleccionarOptionSelect(selectProvincias, provinciaId);



      var cantones = await this.llamadaGenerica({ pais_id: (paisId == 0 ? this.user.codigoPais : paisId), division_id: provinciaId.toString() },
                                                "", url_cantones,false);

      if (cantones.success) {

        options = "";
        JSON.parse(cantones.DataJson).forEach((a, b) => {
          options += `<option value='${a[0]}'>${a[1]}</option>`;
        });

        $(selectCanton).html(options);


        if (parseInt(cantonId) <= 0) {
          cantonId = cantones.Data[0][0];
        }



        this.seleccionarOptionSelect(selectCanton, cantonId);


      }
      else {

      }

    }
    else {
      
    }




  }


  async validarCamposTipo(idTipo) {
    let camposEmpresa =
      [
        ".pa_cliente.mostrar_empresa"
      ];

    let campoPersona =
      [
        ".pa_cliente.mostrar_persona"

      ];

    if (idTipo == this.TIPO_PERSONA) {
      await this.Mostrar_Ocultar_Campos(campoPersona.join(","), camposEmpresa.join(","));
    }
    else if (idTipo == this.TIPO_EMPRESA) {
      await this.Mostrar_Ocultar_Campos(camposEmpresa.join(","), campoPersona.join(","));
    }

  }



  async validarCheckBoxProductos(cliente_id: any, productos: number[], esCuentaCarga) {
    try {


      $("#_Productos input[type=checkbox]").each(function (i, val) {
        let elemento = $(this);
        let ff = elemento.attr("data-ff");
        let idproducto = parseInt(ff.split("_")[2]);

        var result = productos.includes(idproducto) == true ? "checked" : "false";

        if (result == "false") {
          elemento.removeAttr("checked");
        }
        else {
          elemento.attr("checked", result);
        }


        if (esCuentaCarga) {
          if (ff == "cliente_producto_8") {
            elemento.hide("slow");
          } else {
            elemento.show("slow");
          }
        }
        else {
          if (ff == "cliente_producto_6" || ff == "cliente_producto_7" || ff == "cliente_producto_9" || ff == "cliente_producto_21") {
            elemento.hide("slow");
          }
          else {
            elemento.show("slow");
          }
        }



      });


    } catch (e) {

    }
  }



  async cliente_tipo_change() {

    let comboTipo = $("#_TipoCliente");
    let valorTipoCliente = comboTipo.val();

    this.validarCamposTipo(valorTipoCliente);

  }

  async cliente_tipo_habilitar_click(CheckboxHabilitarTipoCliente) {

  }


  async cliente_clave_web_click() {

    try {


      var respuesta = await this.llamadaGenerica({ cliente_id: this.model.cliente_id }, "", "clientes/claveweb-actualizar");

      if (respuesta.success) {
        await this.mostrarMensaje("<p>Clave web sera enviada por correo!</p>", this.iconoSuccess);
      }
      else {
        await this.mostrarMensaje("<p>No se ha podido enviar la clave por correo. Por favor, intentelo nuevamente.</p>", this.iconoError);
      }


    } catch (e) {
      await this.mostrarMensaje("<p>Ha sucedido un error. Referencia: "+e.toString()+"</p>", this.iconoError);

    }



  }




  async cargarTabla(idTabla, data: any, seccion, habilitarAccion = true) {
    try {


      let ids = [];

      let html = "";

      if (data != null) {
        for (var i = 0; i < data.length; i++) {

          switch (seccion) {

            case this.objSeccion.seccionTarjeta:
              {
                
                html += `<tr data-id="${data[i][0]}">`;
                html += `<td>${this.pais_tarjetas[data[i][1] - 1]}</td>`;
                html += `<td>${data[i][2]}</td>`;
                if (habilitarAccion) {
                  html += `<td class="accion" style='textAlign:center;'><i class='fa fa-trash' id="accion_${data[i][0]}" style='color: red;cursor:pointer;'></i></td>`;
                }
                else {
                  html += `<td class="accion" style='textAlign:center;'><i class='' style='color: red;cursor:pointer;'></i></td>`;
                }
                html += `</tr>`;

                ids.push(data[i][0]);
                continue;
              }

            case this.objSeccion.seccionAutorizados:
              {
                html += `<tr data-id="${data[i][0]}">`;
                html += `<td>${(data[i][1]).toString().replace("_", " ")}</td>`;
                html += `<td>${data[i][2]} ${data[i][3]} ${data[i][4]}</td>`;
                if (habilitarAccion) {
                  html += `<td class="accion" style='textAlign:center;'><i class='fa fa-trash' id="accion_${data[i][0]}" style='color: red;cursor:pointer;'></i></td>`;
                }
                else {
                  html += `<td class="accion" style='textAlign:center;'><i class='' style='color: red;cursor:pointer;'></i></td>`;
                }
                html += `</tr>`;

                ids.push(data[i][0]);
                continue;
              }

            case this.objSeccion.seccionContacto:
              {
                html += `<tr data-id="${data[i][0]}">`;
                html += `<td>${(data[i][1]).toString()}</td>`;
                html += `<td>${data[i][2]} ${data[i][3]} ${data[i][4]}</td>`;
                if (habilitarAccion) {
                  html += `<td class="accion" style='textAlign:center;'><i class='fa fa-trash' id="accion_${data[i][0]}" style='color: red;cursor:pointer;'></i></td>`;
                }
                else {
                  html += `<td class="accion" style='textAlign:center;'><i class='' style='color: red;cursor:pointer;'></i></td>`;
                }
                html += `</tr>`;

                ids.push(data[i][0]);
                continue;
              }


            case this.objSeccion.seccionImagenes:
              {
                html += `<tr data-id="${data[i][0]}">`;
                html += `<td>${(this.Tipo_Imagen[data[i][1] - 1]).toString()}</td>`;
                html += `<td>${this.validadorString(data[i][2])}</td>`;
                if (habilitarAccion) {
                  html += `<td class="accion" style='textAlign:center;'><i class='fa fa-trash' id="accion_${data[i][0]}" style='color: red;cursor:pointer;'></i></td>`;
                }
                else {
                  html += `<td class="accion" style='textAlign:center;'><i class='' style='color: red;cursor:pointer;'></i></td>`;
                }
                html += `</tr>`;

                ids.push(data[i][0]);
                continue;
              }

            default:
          }


        }
      }


      var id = idTabla.split("_");
      var button = $(`#${id[0]}_${id[1]} .trButton`).html();
      let tablaBody: HTMLElement = await this.obtenerElementoHTML(idTabla);
      html += button;
      tablaBody.innerHTML = "";
      tablaBody.innerHTML = html;

      i = 0;
      for (i; i < ids.length; i++) {

        let rowTarjeta = this.obtenerElementoHTML(`accion_${ids[i]}`);
        rowTarjeta.addEventListener("click", (e: Event) => this.eliminarRegistro(seccion, e));
      }
    } catch (e) {

    }
  }

  async eliminarRegistro(seccion: string, event) {

    var id = $(event.srcElement).attr("id").split("_")[1];
    this.objetoEliminacion.seccion = seccion;
    this.objetoEliminacion.id = id;
    let mensajeP = $("#textoEliminar");

    switch (seccion) {

      case this.objSeccion.seccionTarjeta:
        {

          mensajeP.text("Desea eliminar esta tarjeta?");
          break;
        }

      case this.objSeccion.seccionAutorizados:
        {

          mensajeP.text("Desea eliminar el autorizado seleccionado?");
          break;
        }
      case this.objSeccion.seccionContacto:
        {

          mensajeP.text("Desea eliminar el contacto seleccionado?");
          break;
        }
      case this.objSeccion.seccionImagenes:
        {

          mensajeP.text("Desea eliminar la imagen seleccionada?");
          break;
        }


      default:
    }

    this.Mostrar_Ocultar_Campos("", "#footerEliminar button");
    this.Mostrar_Ocultar_Campos("#"+seccion + "_eliminar", "");
    this.triggerClick("LevantarModalEliminarGenerico");

  }

  async eliminarGenerico(idSeccion)
  {
    
    
    let id = this.objetoEliminacion.id.toString();
    let data = {};
    let url = "";
    let posicion: number = -1;
    let idTabla: string = "";
    let idPermisos: string = "";

    switch (this.objetoEliminacion.seccion) {

      case this.objSeccion.seccionTarjeta:
        {

          data = { cliente_id: this.model.cliente_id, tarjeta_id: id };
          url = "clientes/tarjeta-borrar";
          posicion = 6;
          idTabla = "pa_tarjetas_bodyTable";
          idPermisos = "CLI_tarjetas_mostrar";

          break;
        }

      case this.objSeccion.seccionAutorizados:
        {

          data = { autorizado_id: id };
          url = "clientes/autorizado-borrar";
          posicion = 9;
          idTabla = "pa_autorizados_bodyTable";
          idPermisos = "CLI_autorizados_modificar";

          break;
        }
      case this.objSeccion.seccionContacto:
        {
          data = { contacto_id: id };
          url = "clientes/contacto-borrar";
          posicion = 8;
          idTabla = "pa_contactos_bodyTable";
          idPermisos = "CLI_contactos_modificar";

          break;
        }
      case this.objSeccion.seccionImagenes:
        {

          data = { cliente_id: this.model.cliente_id, imagen_id: id };
          url = "clientes/imagen-borrar";
          posicion = 7;
          idTabla = "pa_imagenes_bodyTable";
          idPermisos = "CLI_imagenes_modificar";

          break;
        }


      default:
    }


    var respuestaEliminado = await this.llamadaGenerica(data, "eliminando...", url);


    if (respuestaEliminado.success) {

      var mostrarSuccesmensaje = true;

      try {
        var dataUsuario: any = await this.obtenerDataClienteActual();
        var dataTable = dataUsuario["Data"][posicion];
        this.cargarTabla(idTabla, dataTable, this.objetoEliminacion.seccion, this.user.menuItems.includes(idPermisos));
      } catch (e) {
        await this.mostrarMensaje("<p>Se ha eliminado correctamente el registro pero la tabla no ha podido ser refrescada. Por favor vuelva a buscar el cliente para restablecer los valores de inicio</p>", this.iconoSuccess);
        mostrarSuccesmensaje = false;
      }

      if (mostrarSuccesmensaje) {
        await this.mostrarMensaje("<p>Se ha eliminado correctamente el registro.</p>", this.iconoSuccess);
      }

    }
    else {
      await this.mostrarMensaje("<p>No se ha podido eliminar el registro</p>", this.iconoError);
    }



  }

  async pa_Click(idElemento, usarActivo = true) {

    let seccionMostrar = "";

    try {

      let activeClase = "active";
      let style = "style";
      let colorStyle = "color: maroon";
      let btnClase = "btn-default";
      


      let liSeleccionado = $(idElemento);
      let esActivo = liSeleccionado.attr("class").includes("active");


      if (usarActivo) {
        if (!UtilApp.isNullOrUndefined(esActivo) && !esActivo) {
          let liActivo = $("#DivMenuIzquierda ul li.active");
          let seccionOcultar = liActivo.children().attr("data-pa").toString();
          seccionMostrar = liSeleccionado.children().attr("data-pa").toString();


          liActivo.removeClass(activeClase);
          liActivo.children().removeAttr(style);
          liActivo.children().find("i").eq(0).removeClass(btnClase);

          liSeleccionado.addClass(activeClase);
          liSeleccionado.children().attr(style, colorStyle);
          liSeleccionado.children().find("i").eq(0).addClass(btnClase);


          this.Mostrar_Ocultar_Campos(seccionMostrar, seccionOcultar);


        }
      }
      else {
        if (!UtilApp.isNullOrUndefined(esActivo)) {
          let liActivo = $("#DivMenuIzquierda ul li.active");
          let seccionOcultar = liActivo.children().attr("data-pa").toString();
          let seccionMostrar = liSeleccionado.children().attr("data-pa").toString();


          liActivo.removeClass(activeClase);
          liActivo.children().removeAttr(style);
          liActivo.children().find("i").eq(0).removeClass(btnClase);

          liSeleccionado.addClass(activeClase);
          liSeleccionado.children().attr(style, colorStyle);
          liSeleccionado.children().find("i").eq(0).addClass(btnClase);


          this.Mostrar_Ocultar_Campos(seccionMostrar, seccionOcultar);


        }
      }

      
    } catch (e) {

    }

    if (true) {

    }
    if (seccionMostrar != "") {
      this.inhabilitarHabilitar(seccionMostrar);
    }
    this.cambiarIconoBotonGuardarEditar(true);

  }




  async checkboxHabilitarInhabilitar(id)
  {

    let elemento = $(id);

    if (elemento.attr("class").includes("noHabilitado")) {
      elemento.removeClass("noHabilitado");
    }
    else {
      elemento.addClass("noHabilitado");
    }



  }


  //********************************* Fin metodos cliente ***************************************//




  //*****************************UTILS*****************************************//

  async inhabilitarHabilitar(pa_seccion: string, esHabilitar = false) {

    var custom = "";

    if (!pa_seccion.startsWith("#")) {
      pa_seccion = "#" + pa_seccion;
    }


    if (pa_seccion == this.paMenuIds.pa_cliente) {
      custom = ",#_Productos";
    }

    $(pa_seccion + " input, " + pa_seccion + " select, " + pa_seccion + " textarea" + custom).each(function () {


      let elemento = $(this);

      if (!elemento.is("input[type='button']")) {
        if (esHabilitar) {
          elemento.removeClass("noHabilitado");
        }
        else {
          elemento.addClass("noHabilitado");
        }
      }




    });

    if (pa_seccion == this.paMenuIds.pa_cliente) {
      this.inhabilitarElementoSimple("#_TipoCliente", false);
      this.inhabilitarElementoSimple("#_CambioSucursal", false);
    }

  }


  inhabilitarElementoSimple(elemento:string, habilitar = false) {

    if (!elemento.startsWith("#")) {
      elemento = "#" + elemento;
    }

    let elem = $(elemento);

    if (habilitar) {
      elem.removeClass("noHabilitado");
    }
    else {
      elem.addClass("noHabilitado");
    }
  }

  AccionSessionManager =
    {
      asignarValor: 1,
      obtenerValor: 2,
      eliminarObjeto: 3,
      nombreSession : "nuevaCuenta"
    };

  sessionManager(nombreSession:string, valor:string, tipoAccion: number): string
  {
    // 1 -> asignar Valor
    // 2 -> obtenerValor
    // 3 -> eliminar

    if (tipoAccion == 1) {
      sessionStorage.setItem(nombreSession, valor);
    }
    else if (tipoAccion == 2) {
      return sessionStorage.getItem(nombreSession) ?? null;
    }
    else if (tipoAccion == 3) {
      sessionStorage.removeItem(nombreSession);
    }

    return null;
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


  //Logica tomada del codigo original de Dart
  formatoTel(numeroTelefono: string): string {
    let phone2 = (numeroTelefono != null) ? (numeroTelefono.trim()) : ("");

    if (phone2.length > 0) {
      let value = 0;

      try {
        value = parseInt(phone2);
      } catch (e) {
        value = -999;
      }

      return (value > 0 && phone2.length > 4) ? (phone2.substring(0, 4) + " " +
        phone2.substring(4)) : (phone2);
    }
    return phone2.trim().replace(" ","") ?? "";
  }




  contieneSoloNumeros(param:string): boolean
  {
    
    var numbers = /^[-+]?[0-9]+$/;
    if (param.match(numbers)) {
      return true;
    }
    else {
      return false;
    }
  }


  tarjeta_validar(data) {
    let id = data["tarjeta_id"];
    let tarjeta_index = parseInt(data["tipo"] == null ? "0" : data["tipo"]);
    let nombre = data["nombre"];
    let numero = data["numero"];
    let codigo = data["codigo"];
    let len = numero.length;

    if (tarjeta_index <= 0 || tarjeta_index >= this.Tarjeta_Data.length) {
      return "Tipo de tarjeta " + tarjeta_index+" desconocido";
    }

    if (nombre == "") {
      return "Nombre en la tarjeta no debe ser blanco";
    }

    if (codigo.length < 3 ||
      codigo.length > 5 ||
      !this.contieneSoloNumeros(codigo)) {
      return "Código de seguridad incompleto o no númerico";
    }

    let lprefijos = this.Tarjeta_Data[tarjeta_index][2];
    let prefixes = lprefijos.split(",");
    let nombreTarjeta = this.Tarjeta_Data[tarjeta_index][1];

    // no hay que validar el numero si ya existe la tarjeta y esta en blanco
    if (parseInt(id) > 0 && numero.length == 0) {
      return null;
    }

    if (len > 0 && numero.length < 13) {
      return "Número de tarjeta incompleto";
    }

    if (len == 0) {
      return null;
    }

    if (!this.contieneSoloNumeros(numero)) {
      return "Número de tarjeta debe contener solo números";
    }

    let prefijo_tarjeta = parseInt(numero.substring(0, 6));


    switch (this.pais_tarjetas[tarjeta_index - 1]) {
      case this.TARJETA_VISA:
        if (len < 13 || len > 16) {
          return "No es un número de una Tarjeta Visa.";
        }
        break;
      case this.TARJETA_MASTER_CARD:
        if (len < 16 || len > 19) {
          return "No es un número de una Tarjeta MasterCard.";
        }
        break;
      case this.TARJETA_AMERICAN_EXPRESS:
        if (len != 15) {
          return "No es un número de una Tarjeta american express.";
        }
        break;
      case this.TARJETA_DINERS:
        if (len != 14 && len != 16) {
          return "No es un número de una Tarjeta Diners Club.";
        } else if (len == 16 && !numero.startsWith("54")) {
          return "No es un número de una Tarjeta Diners Club.";
        } else if (len == 14 && numero.startsWith("54")) {
          return "No es un número de una Tarjeta Diners Club.";
        }
        break;
      case this.TARJETA_DISCOVER:
        if (len != 16) {
          return "No es un número de una Tarjeta Discover.";
        }
        //else if (!prefixes.any((x) => numero.startsWith(x)) &&
        //  (prefijo_tarjeta < 622126 || prefijo_tarjeta > 622925))
        //{
        //  return "No es un número de una Tarjeta $nombreTarjeta.";
        //}
        break;
      case this.TARJETA_POPULAR:
        if (len != 16 || !numero.startsWith("88")) {
          return "No es un número de una Tarjeta Popular.";
        }
        break;
      case "Credix":
      case "ClubNacion":
    }

    return null;
  }



  limpiarData(): void {

    this._lista = null;
    this.model.cliente_id= null;
    this.model.sucursal= null;

    this.model.confeccion_guia= null;
    
    this.model.pa_cliente_sucursal_id= null;
    
    this.model.pa_cliente_persona_id= null;
    this.model.pa_cliente_apoderado_id= null;
    this.model.pa_cliente_direccion0_id= null;
    this.model.pa_cliente_direccion1_id= null;
    this.model.pa_cliente_direccion2_id= null;
    
    this.model.pa_cliente_index_tipo_cliente= null;
    this.model.pa_cliente_index_cambio_sucursal= null;
    this.model.pa_cliente_habilitar= null;
    this.model.pa_cliente_clave_web= null;
    this.model.pa_cliente_nombre= null;
    this.model.pa_cliente_cuenta_empleados= null;
    this.model.pa_cliente_fecha_ingreso= null;
    this.model.pa_cliente_codigo_promocion= null;
    this.model.pa_cliente_index_idioma= null;
    this.model.pa_cliente_index_alianza= null;
    this.model.pa_cliente_datos_completos= null;
    this.model.pa_cliente_index_contrato= null;
    this.model.pa_cliente_index_economy= null;
    this.model.pa_cliente_index_ejecutivo= null;
    this.model.pa_cliente_recomendado_por= null;
    this.model.pa_cliente_pago_tarjeta= null;
    this.model.pa_cliente_cargo_mensajeria= null;
    this.model.pa_cliente_cargo_guia= null;
    this.model.pa_cliente_index_estado= null;
    this.model.pa_cliente_notas= null;
    this.model.pa_cliente_index_zona= null;
    this.model.pa_cliente_historial_zona= null;
    this.model.pa_cliente_productos= null;
    this.model.pa_cliente_index_como_conocio= null;
    this.model.pa_cliente_index_tipo_credito= null;
    this.model.pa_cliente_recoge_sucursal= null;


    this.model.pa_persona_id= null;
    this.model.pa_persona_index_tipo_id= null;
    this.model.pa_persona_identificacion= null;
    this.model.pa_persona_nombre= null;
    this.model.pa_persona_primer_apellido= null;
    this.model.pa_persona_segundo_apellido= null;
    this.model.pa_persona_fecha_nacimiento= null;
    this.model.pa_persona_fecha_nacimiento_nodef= null;
    this.model.pa_persona_index_sexo= null;
    this.model.pa_persona_index_nacionalidad= null;
    this.model.pa_persona_index_estado_civil= null;
    this.model.pa_persona_index_profesion= null;
    this.model.pa_persona_celular= null;
    this.model.pa_persona_telefono1= null;
    this.model.pa_persona_telefono2= null;
    this.model.pa_persona_index_telefono1= null;
    this.model.pa_persona_index_telefono2= null;
    this.model.pa_persona_email1= null;
    this.model.pa_persona_email2= null;
    this.model.pa_persona_recibir_boletines_electronicos= null;
    this.model.pa_persona_recibir_cupones_descuento= null;
    this.model.pa_persona_recibir_promociones= null;

    this.model.pa_direccion_id= null;
    this.model.pa_direccion_nombre= null;
    this.model.pa_direccion_autorizar_dejar_paquete= null;
    this.model.pa_direccion_mensaje_error= null;
    this.model.pa_direccion_index_ruta= null;
    this.model.pa_direccion_index_pais= null;
    this.model.pa_direccion_index_provincia= null;
    this.model.pa_direccion_index_canton= null;
    this.model.pa_direccion_distrito= null;
    this.model.pa_direccion_index_distrito= null;
    this.model.pa_direccion_direccion= null;
    this.model.pa_direccion_celular= null;
    this.model.pa_direccion_telefono1= null;
    this.model.pa_direccion_telefono2= null;
    this.model.pa_direccion_telefono3= null;
    this.model.pa_direccion_telefono4= null;
    this.model.pa_direccion_index_telefono1= null;
    this.model.pa_direccion_index_telefono2= null;
    this.model.pa_direccion_index_telefono3= null;
    this.model.pa_direccion_index_telefono4= null;
    this.model.pa_direccion_coordenadas= null;
    this.model.pa_direccion_lunes= null;
    this.model.pa_direccion_martes= null;
    this.model.pa_direccion_miercoles= null;
    this.model.pa_direccion_jueves= null;
    this.model.pa_direccion_viernes= null;
    this.model.pa_direccion_sabado= null;
    this.model.pa_direccion_domingo= null;
    this.model.pa_direccion_index_hora1= null;
    this.model.pa_direccion_index_hora2= null;

    this.model.pa_direccion_imagen= null;

    this.model.pa_tarjeta_id= null;
    this.model.pa_tarjeta_index_tarjeta= null;
    this.model.pa_tarjeta_numero= null;
    this.model.pa_tarjeta_nombre= null;
    this.model.pa_tarjeta_seguridad= null;
    this.model.pa_tarjeta_index_valido_yyyy= null;
    this.model.pa_tarjeta_index_valido_mm= null;
    this.model.pa_tarjeta_mensaje_error= null;
    this.model.pa_tarjeta_placeholder= null;

    this.model.pa_autorizados_id= null;
    this.model.pa_autorizados_persona_id= null;
    this.model.pa_autorizados_dir_id= null;
    this.model.pa_autorizados_index_tipo= null;
    this.model.pa_autorizados_index_relacion= null;
    this.model.pa_autorizados_identificacion= null;
    this.model.pa_autorizados_habilitar= null;
    this.model.pa_autorizados_index_tipo_id= null;
    this.model.pa_autorizados_index_identificacion= null;
    this.model.pa_autorizados_nombre= null;
    this.model.pa_autorizados_primer_apellido= null;
    this.model.pa_autorizados_segundo_apellido= null;
    this.model.pa_autorizados_fecha_nacimiento= null;
    this.model.pa_autorizados_fecha_nacimiento_nodef= null;
    this.model.pa_autorizados_no_ingresada= null;
    this.model.pa_autorizados_index_sexo= null;
    this.model.pa_autorizados_index_nacionalidad= null;
    this.model.pa_autorizados_index_estado_civil= null;
    this.model.pa_autorizados_index_profesion= null;
    this.model.pa_autorizados_direccion= null;
    this.model.pa_autorizados_celular= null;
    this.model.pa_autorizados_telefono1= null;
    this.model.pa_autorizados_telefono2= null;
    this.model.pa_autorizados_telefono3= null;
    this.model.pa_autorizados_telefono4= null;
    this.model.pa_autorizados_index_telefono1= null;
    this.model.pa_autorizados_index_telefono2= null;
    this.model.pa_autorizados_index_telefono3= null;
    this.model.pa_autorizados_index_telefono4= null;
    this.model.pa_autorizados_email1= null;
    this.model.pa_autorizados_email2= null;
    this.model.pa_autorizados_mensaje_error= null;

    this.model.pa_imagenes_id= null;
    this.model.pa_imagenes_index_tipo= null;
    this.model.pa_imagenes_notas= null;
    this.model.pa_imagenes_imagen= null;
    this.model.pa_imagenes_mensaje_error= null;

    this.model.pa_empresa_nombre_corto= null;
    this.model.pa_empresa_cedula_juridica= null;
    this.model.pa_empresa_index_pais= null;
    this.model.pa_empresa_index_provincia= null;
    this.model.pa_empresa_index_canton= null;
    this.model.pa_empresa_direccion= null;
    this.model.pa_empresa_direccion_id= null;
    this.model.pa_empresa_celular= null;
    this.model.pa_empresa_telefono1= null;
    this.model.pa_empresa_telefono2= null;
    this.model.pa_empresa_telefono3= null;
    this.model.pa_empresa_telefono4= null;
    this.model.pa_empresa_index_telefono1= null;
    this.model.pa_empresa_index_telefono2= null;
    this.model.pa_empresa_index_telefono3= null;
    this.model.pa_empresa_index_telefono4= null;
    this.model.pa_empresa_email1= null;
    this.model.pa_empresa_email2= null;
    this.model.pa_empresa_apoderado_index_tipo_id= null;
    this.model.pa_empresa_apoderado_id= null;
    this.model.pa_empresa_apoderado_nombre= null;
    this.model.pa_empresa_apoderado_primer_apellido= null;
    this.model.pa_empresa_apoderado_segundo_apellido= null;
    this.model.pa_empresa_apoderado_igual_contacto= null;

    this.model.pa_contactos_id= null;
    this.model.pa_contactos_persona_id= null;
    this.model.pa_contactos_nombre= null;
    this.model.pa_contactos_primer_apellido= null;
    this.model.pa_contactos_segundo_apellido= null;
    this.model.pa_contactos_puesto= null;
    this.model.pa_contactos_departamento= null;
    this.model.pa_contactos_notas= null;
    this.model.pa_contactos_dir_id= null;
    this.model.pa_contactos_index_pais= null;
    this.model.pa_contactos_index_provincia= null;
    this.model.pa_contactos_index_canton= null;
    this.model.pa_contactos_direccion= null;
    this.model.pa_contactos_celular= null;
    this.model.pa_contactos_telefono1= null;
    this.model.pa_contactos_telefono2= null;
    this.model.pa_contactos_telefono3= null;
    this.model.pa_contactos_telefono4= null;
    this.model.pa_contactos_index_telefono1= null;
    this.model.pa_contactos_index_telefono2= null;
    this.model.pa_contactos_index_telefono3= null;
    this.model.pa_contactos_index_telefono4= null;
    this.model.pa_contactos_email1= null;
    this.model.pa_contactos_email2= null;
    this.model.pa_contactos_mensaje_error= null

  }




  //*****************************UTILS*****************************************//












  //************************************* Modals *****************************************//

  //*********TARJETAS*******//

  async agregarTarjeta() {
    try {
      
      let tipo: string = await this.validadorString(this.obtenerValorElemento("#_TarjetasTipo"), false, "", "0");
      let tipoTarjeta: string = tipo.toString();
      let nombre:string = await this.obtenerValorElemento($("#_TarjetasNombre"));
      let numero: string = await this.obtenerValorElemento($("#_TarjetasNumero"));
      let seguridad: string = await this.obtenerValorElemento($("#_TarjetasSeguridad"));
      let mm: string = await this.obtenerValorElemento($("#_TarjetasExpiracionMM"));
      let yy: string = await this.obtenerValorElemento($("#_TarjetasExpiracionYYYY"));

      let tarjeta_id: string = this.model.pa_tarjeta_id;

      if (UtilApp.isNullOrUndefined(tarjeta_id)) {
        tarjeta_id = "-1";
      }

      let data = { "cliente_id": this.model.cliente_id.toString(), "tarjeta_id": tarjeta_id};
      data["tipo"] = tipoTarjeta;//(this.model.pa_tarjeta_index_tarjeta == null ? 0 : this.model.pa_tarjeta_index_tarjeta) + 1;
      data["nombre"] = nombre.trim().toString();
      data["numero"] = numero.trim().toString();
      data["codigo"] = seguridad.trim().toString();
      data["mm"] = mm.toString();
      data["yyyy"] = yy.toString();


      var validaciones = await this.tarjeta_validar(data);
      
      if (validaciones != null && validaciones != "") {
        this.model.pa_tarjeta_mensaje_error = validaciones;
        return;
      }

      this.model.pa_tarjeta_mensaje_error = "";

      var respuesta = await this.llamadaGenerica(data, "guardando tarjeta...", "clientes/tarjeta-actualizar");
      

      try {

        var dataUsuario: any = await this.obtenerDataClienteActual();
        var tarjetas = dataUsuario["Data"][6];
        this.cargarTabla("pa_tarjetas_bodyTable", tarjetas, this.objSeccion.seccionTarjeta, this.user.menuItems.includes("CLI_tarjetas_mostrar"));
        this.triggerClick("btnCerrarModalTarjeta");
      }
      catch (e) {

      }


    } catch (e) {
      
      this.mostrarMensaje("<p>Ha ocurrido un error mientras guardabamos la tarjeta</p>", this.iconoError);
    }
  }




  //*********TARJETAS*******//





  //*********AUTORIZADOS************//

  async agregarAutorizado()
  {
    try {

      let dataAutorizado = {};

      if (!UtilApp.isNullOrUndefined(this.model.cliente_id)) {
        dataAutorizado["cliente_id"] = this.model.cliente_id;
      }

      if (!UtilApp.isNullOrUndefined(this.model.pa_autorizados_id)) {
        dataAutorizado["autorizado_id"] = this.model.pa_autorizados_id;
      }
      if (!UtilApp.isNullOrUndefined(this.model.pa_autorizados_persona_id)) {
        dataAutorizado["persona_id"] = this.model.pa_autorizados_persona_id;
      }
      if (!UtilApp.isNullOrUndefined(this.model.pa_autorizados_dir_id)) {
        dataAutorizado["direccion_id"] = this.model.pa_autorizados_dir_id;
      }

      

      $("#autorizados_modal input, #autorizados_modal select, #autorizados_modal textarea").each(function () {


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
          else if (elemento.is("textarea")) {
            value = elemento.val();
          }
        } catch (e) { value = null; }


        if (!UtilApp.isNullOrUndefined(value)) {
          dataAutorizado[elemento.attr("data-ff")] = value;
        }
        
      });







      if (dataAutorizado["autorizado_per_nombre"] == "" ||
        dataAutorizado["autorizado_per_primerApellido"] == "" ||
        dataAutorizado["autorizado_per_numeroId"] == "" ||
        dataAutorizado["autorizado_dir_celular"] == "" ||
        dataAutorizado["autorizado_dir_email1"] == ""
      ) {

        this.model.pa_autorizados_mensaje_error = "Por favor verifique los siguientes campos: " + (dataAutorizado["autorizado_per_nombre"] == "" ? "Nombre -" : "") + (dataAutorizado["autorizado_per_primerApellido"] == "" ? "Primer Apellido -" : "") + (dataAutorizado["autorizado_per_numeroId"] == "" ? "Numero Id - " : "") + (dataAutorizado["autorizado_dir_celular"] == "" ? "Celular principal - " : "") + (dataAutorizado["autorizado_dir_email1"] == "" ? "Email" : "");


        if (dataAutorizado["autorizado_dir_celular"] == "") {
          $("[data-ff='autorizado_dir_celular']").css("border-color", "red");
        }
        else {
          $("[data-ff='autorizado_dir_celular']").css("border-color", "green");
        }

        if (dataAutorizado["autorizado_per_primerApellido"] == "") {
          $("[data-ff='autorizado_per_primerApellido']").css("border-color", "red");
        }
        else {
          $("[data-ff='autorizado_per_primerApellido']").css("border-color", "green");
        }

        if (dataAutorizado["autorizado_per_numeroId"] == "") {
          $("[data-ff='autorizado_per_numeroId']").css("border-color", "red");
        }
        else {
          $("[data-ff='autorizado_per_numeroId']").css("border-color", "green");
        }

        if (dataAutorizado["autorizado_dir_celular"] == "") {
          $("[data-ff='autorizado_dir_celular']").css("border-color", "red");
        }
        else {
          $("[data-ff='autorizado_dir_celular']").css("border-color", "green");
        }

        if (dataAutorizado["autorizado_dir_email1"] == "") {
          $("[data-ff='autorizado_dir_email1']").css("border-color", "red");
        }
        else {
          $("[data-ff='autorizado_dir_email1']").css("border-color", "green");
        }
        return;
      }

      this.model.pa_autorizados_mensaje_error = "";
      await this.llamadaGenerica(dataAutorizado, "guardando autorizado...", "clientes/autorizado-actualizar");

      try
      {
        
        var dataUsuario: any = await this.obtenerDataClienteActual();
        var autorizados = dataUsuario["Data"][9];
        this.cargarTabla("pa_autorizados_bodyTable", autorizados, this.objSeccion.seccionAutorizados, this.user.menuItems.includes("CLI_autorizados_modificar"));
        
      }
      catch (e)
      {

      }


      

    } catch (e) {
      await this.mostrarMensaje("<p>Ha ocurrido un error mientras guardabamos el autorizado</p>", this.iconoError);
    }

    await this.triggerClick("btnCerrarModalAutorizado");
  }


  //*********AUTORIZADOS************//





  //*********CONTACTOS************//

  async agregarContacto() {
    try {

      let data = {};

      if (!UtilApp.isNullOrUndefined(this.model.cliente_id)) {
        data["cliente_id"] = this.model.cliente_id;
      }

      
      data["contacto_id"] = this.model.pa_contactos_id == null ? "-1" : this.model.pa_contactos_id;
      data["persona_id"] = this.model.pa_autorizados_persona_id == null ? "-1" : this.model.pa_autorizados_persona_id;
      data["direccion_id"] = this.model.pa_autorizados_dir_id == null ? "-1" : this.model.pa_autorizados_dir_id;



      $("#contactos_modal input, #contactos_modal select, #contactos_modal textarea").each(function () {


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
          else if (elemento.is("textarea")) {
            value = elemento.val();
          }
        } catch (e) { value = null; }


        if (!UtilApp.isNullOrUndefined(value)) {
          data[elemento.attr("data-ff")] = value.toString();
        }

      });


      if (data["contacto_per_nombre"] == "" ||
        data["contacto_per_primerApellido"] == "" ||
        data["contacto_puesto"] == "" ||
        data["contacto_departamento"] == ""
      )
      {
        this.model.pa_contactos_mensaje_error = "Por favor verifique los siguientes campos: " + (data["contacto_per_nombre"] == "" ? "Nombre -" : "") + (data["contacto_per_primerApellido"] == "" ? "Primer Apellido -" : "") + (data["contacto_puesto"] == "" ? "Puesto - " : "") + (data["contacto_departamento"] == "" ? "Departamento" : "");

        if (data["contacto_per_nombre"] == "") {
          $("[data-ff='contacto_per_nombre']").css("border-color", "red");
        }
        else {
          $("[data-ff='contacto_per_nombre']").css("border-color", "green");
        }

        if (data["contacto_per_primerApellido"] == "") {
          $("[data-ff='contacto_per_primerApellido']").css("border-color", "red");
        }
        else {
          $("[data-ff='contacto_per_primerApellido']").css("border-color", "green");
        }


        if (data["contacto_puesto"] == "") {
          $("[data-ff='contacto_puesto']").css("border-color", "red");
        }
        else {
          $("[data-ff='contacto_puesto']").css("border-color", "green");
        }


        if (data["contacto_departamento"] == "") {
          $("[data-ff='contacto_departamento']").css("border-color", "red");
        }
        else {
          $("[data-ff='contacto_departamento']").css("border-color", "green");
        }


        return;
      }

      this.model.pa_contactos_mensaje_error = "";
      

      let datarespuesta = await this.llamadaGenerica(data, "guardando contacto...", "clientes/contacto-actualizar");

      try {

        if (datarespuesta.success) {
          var dataUsuario: any = await this.obtenerDataClienteActual();
          var contactos = dataUsuario["Data"][8];
          this.cargarTabla("pa_contactos_bodyTable", contactos, this.objSeccion.seccionContacto, this.user.menuItems.includes("CLI_contactos_modificar"));
        }
        else {
          await this.mostrarMensaje("<p>No se ha podido guardar el contacto. Por favor intente de nuevo y asegurese de llenar todos los campos necesarios.</p>", this.iconoError);
        }



      }
      catch (e) {
        
      }

    } catch (e) {
      await this.mostrarMensaje("<p>Ha ocurrido un error mientras guardabamos el contacto</p>", this.iconoError);
    }

    await this.triggerClick("btnCerrarModalContacto");
  }



  //*********CONTACTOS************//


  //*********IMAGENES************//




  image_readImage(evt) {
    let uploadInput = $("#FileUploadImagenSeccion");
    var file = $("#_ImagenImagen");
    this.readURL(uploadInput, file);
  }

  readURL(input : any,target:any):void {

      this.model.pa_imagenes_index_tipo = 1;
      var reader = new FileReader();
      var result = "";

    reader.onload = function (e: any) {


        sessionStorage.setItem("cliente_imagen", e.target.result);
        $(target).attr('src', e.target.result);
      }
      reader.readAsDataURL(input[0].files[0]);
     
  }


  async guardarImagen() {
    
    var imagen = sessionStorage.getItem("cliente_imagen");

    if (imagen == "" || UtilApp.isNullOrUndefined(imagen)) {
      this.model.pa_imagenes_mensaje_error = "Por favor seleccione una imagen. *Nota: Si el problema persiste, intente subir otra imagen temporal y luego selecciona la que desea, esto, para que el sistema refresque."
      return false;
    }

    let tipoImagen = await this.obtenerValorElemento("#_ImagenTipo");
    let data = { "cliente_id": this.model.cliente_id, "imagen_id": "-1" };
    data["tipo"] = tipoImagen.toString();
    data["imagen"] = imagen;
    data["notas"] = await this.obtenerValorElemento($("#_ImagenNotas"))



    let datarespuesta = await this.llamadaGenerica(data, "guardando imagen...", "clientes/imagen-actualizar");

    try {

      var dataUsuario: any = await this.obtenerDataClienteActual();
      var imagenes = dataUsuario["Data"][7];
      this.cargarTabla("pa_imagenes_bodyTable", imagenes, this.objSeccion.seccionImagenes, this.user.menuItems.includes("CLI_imagenes_modificar"));
      

    }
    catch (e) {

    }


    if (sessionStorage.getItem("cliente_imagen") != null) {
      sessionStorage.removeItem("cliente_imagen");
    }


    await this.triggerClick("btnCerrarModalImagenes");
    $("#_ImagenImagen").removeAttr("src");
    $("#FileUploadImagenSeccion").val("");
    $("#_ImagenTipo").val("1");
    await this.setearValorElemento("#_ImagenNotas", "");

  }




  //*********IMAGENES************//






  










  //************************************* Modals *****************************************//



  nuevaCuentaGenerica()
  {

    this.restablecerTodosLosValores();

    let idsOcultar =
      [
        "#seg_clientesEmpresaMostrar",
        "#seg_clientesPersonaMostrar",
        "#seg_clientesDireccionMostrar0",
        "#seg_clientesDireccionMostrar1",
        "#seg_clientesDireccionMostrar2",
        "#seg_clientesTarjetasMostrar",
        "#seg_clientesAutorizadosMostrar",
        "#seg_clientesContactosMostrar",
        "#seg_clientesImagenesMostrar",
        
      ];

    this.Mostrar_Ocultar_Campos("#DivMenuIzquierda ul.nav li", "");
    
    this.Mostrar_Ocultar_Campos("", idsOcultar.join(","));
    this.validarCheckCheckbox(true, "#_Habilitar_TipoCliente");
    $("#pa_cliente").show();
    $("#pa_cliente div.pa_cliente").show();
    this.Mostrar_Ocultar_Campos("#pa_cliente div.mostrar_empresa", "#pa_cliente div.mostrar_persona");
   this.Mostrar_Ocultar_Campos("#pa_cliente .cliente_carga", "#pa_cliente .cliente_pobox");
    this.Mostrar_Ocultar_Campos("", "#pa_cliente .pa_cliente_cambio_sucursal");

    this.pa_Click("#seg_clientesMostrar");
    this.cambiarIconoBotonGuardarEditar(false);
    this.esNuevoCliente = true;
    
  }

  


  setearValorElemento(elemento,valor)
  {

    let jqueryElement = $(elemento);

    if (!UtilApp.isNullOrUndefined(jqueryElement)) {
      jqueryElement.val(valor);
    }
    else {
      console.log("elemento invalido. Id = ", elemento);
    }
  }

  obtenerFechaActual():string
  {
    let d = new Date();
    var datestring = (d.getFullYear().toString() + "-" + d.getMonth().toString() + "-" + d.getDate().toString());
    return datestring;
  }

  setearValorFechaDefault()
  {
    this.setearValorElemento("#_FechaIngreso", this.obtenerFechaActual());
  }

  obtenerFechaCustom(fecha: any)
  {
    var d = new Date(fecha);

    var mes = (d.getMonth() + 1);
    var nuevoMes = mes.toString();

    var dia = d.getDate();
    var nuevoDia = dia.toString()


    if (mes < 10) {
      nuevoMes = "0" + nuevoMes;
    }

    if (dia < 10) {
      nuevoDia = "0" + dia.toString();
    }

    var datestring = (d.getFullYear().toString() + "-" + nuevoMes + "-" + nuevoDia);
    return datestring;
  }



  async paisChange(valorPais,provinciaId,cantonId)
  {
    $(provinciaId).html("");
    $(cantonId).html("");
    await this.llenarCantonProvincia(provinciaId, cantonId, "-1", "-1", valorPais);
  }


  async provinciaChange(idPaisSelect,valorProvincia,provinciaIdSelect,cantonIdSelect)
  {
    $(cantonIdSelect).html("");


    let valorPais = await this.obtenerValorElemento(idPaisSelect);

    await this.llenarCantonProvincia(provinciaIdSelect, cantonIdSelect, valorProvincia, "-1", valorPais);
  }

}



