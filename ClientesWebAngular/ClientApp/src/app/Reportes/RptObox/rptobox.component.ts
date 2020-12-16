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
import { ITarjeta } from '../../model/Reportes/Tarjetas/ITarjeta';
import { IRptObox } from '../../model/Reportes/Rptobox/IRptobox';
import { RptOboxService } from '../../Servicios/Reportes/ReportePOBox/rptpobox.service';
import { IProducto } from '../../model/Parametros/Productos/IProducto';
import { ProductosService } from '../../Servicios/Parametros/Productos/productos.service';
import { IContrato } from '../../model/Parametros/InterfacesParametros';
import { strict } from 'assert';
import { forEachChild } from 'typescript';
@Component({
  selector: 'app-empresa',
  templateUrl: './rptobox.component.html',
  styleUrls: ['./rptobox.component.html'],
})
export class RptOboxComponent implements OnInit, OnDestroy, AfterViewInit {
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

  reporteSeleccionado = 0;

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

  rptoboxList: IRptObox[];



  rptoboxObject: IRptObox = {
    autorizaciones: "",
    codigopromocion: "",
    columnas: "",
    comoconocio: "",
    contratos: "",
    cumplea_os: "",
    empresas: "",
    estados: "",
    fechadesde: "",
    fechahasta: "",
    guardar: false,
    nombre: "",
    productos: "",
    reporte: "",
    sucursales: "",
    tipo: "",
    zonas: "",
    id: 0
  }
  manejos: IManejo[];
  manejos2: IManejo2[];
  seguros: ISeguro[];
  mercaderias: IMercaderia[];
  empresa: IEmpresa = { id: 0, name: '' };
  objConocimientoJetbox = [
    { "value": "Internet", "text": "Internet" },
    { "value": "Sucursal", "text": "Sucursal" },
    { "value": "Períódico", "text": "Períódico" },
    { "value": "Prensa", "text": "Prensa" },
    { "value": "Televisión", "text": "Televisión" },
    { "value": "Radio", "text": "Radio" },
    { "value": "Recomendación", "text": "Recomendación" },
    { "value": "Red Social", "text": "Red Social" },
    { "value": "Otro", "text": "Otro" },
  ]
  objEstados = [
    { "value": "10", "text": "Activo" },
    { "value": "20", "text": "Moroso" },
    { "value": "30", "text": "Cancelado" },
    { "value": "40", "text": "Fallecido" },
    { "value": "50", "text": "No Localizable" },
  ]
  objMeses = [
    { "value": "1", "text": "Enero" },
    { "value": "2", "text": "Febrero" },
    { "value": "3", "text": "Marzo" },
    { "value": "4", "text": "Abril" },
    { "value": "5", "text": "Mayo" },
    { "value": "6", "text": "Junio" },
    { "value": "7", "text": "Julio" },
    { "value": "8", "text": "Agosto" },
    { "value": "9", "text": "Setiembre" },
    { "value": "10", "text": "Octubre" },
    { "value": "11", "text": "Noviembre" },
    { "value": "12", "text": "Diciembre" },
  ]
  objAutorizaciones = [
    { "value": "2", "text": "Recibir notificaciones de paquetes en mis dispositivos móviles" },
    { "value": "3", "text": "Recibir boletines electrónicos y promociones de parte de JetBox" }
  ]
  objColumnas = [
    { "value": "sjo", "text": "SJO" },
    { "value": "nombre_completo", "text": "Nombre Completo" },
    { "value": "nombre_corto", "text": "Nombre Corto" },
    { "value": "sucursal", "text": "Sucursal" },
    { "value": "zona", "text": "Zona" },
    { "value": "tipo_cliente", "text": "Tipo Cliente" },
    { "value": "estado", "text": "Estado" },
    { "value": "razon_social", "text": "Razón Social" },
    { "value": "cedula_juridica", "text": "Cédula Jurídica" },
    { "value": "fecha_ingreso", "text": "Fecha Ingreso" },
    { "value": "lugar_afiliacion", "text": "Lugar Afiliación" },
    { "value": "lugar_afiliacion_res", "text": "Lugar Afiliación Resumido" },
    { "value": "miami_direccion1", "text": "Miami Dirección Linea1" },
    { "value": "miami_direccion2", "text": "Miami Dirección Linea2" },
    { "value": "miami_telefono", "text": "Miami Teléfono" },
    { "value": "tipo_identificacion", "text": "Tipo Identificación" },
    { "value": "identificacion", "text": "Identificación" },
    { "value": "nombre", "text": "Nombre" },
    { "value": "primer_apellido", "text": "Primer Apellido" },
    { "value": "segundo_apellido", "text": "Segundo Apellido" },
    { "value": "tipo_persona", "text": "Tipo Persona" },
    { "value": "fecha_nacimiento", "text": "Fecha Nacimiento" },
    { "value": "idioma", "text": "Idioma" },
    { "value": "sexo", "text": "Sexo" },
    { "value": "nacionalidad", "text": "Nacionalidad" },
    { "value": "estado_civil", "text": "Estado Civil" },
    { "value": "profesion", "text": "Profesión" },
    { "value": "como_conocio", "text": "Cómo Conoció JetBox" },
    { "value": "codigo_promo", "text": "Codigo Promoción" },
    { "value": "nombre_alianza", "text": "Nombre Alianza" },
    { "value": "contrato_normal", "text": "Contrato Normal" },
    { "value": "contrato_economy", "text": "Contrato Economy" },
    { "value": "ejecutivo_cuenta", "text": "Ejecutivo Cuenta" },
    { "value": "pago_tarjeta", "text": "Pago Tarjeta" },
    { "value": "cargo_mensajeria", "text": "Cargo Mensajeria" },
    { "value": "recibo_conforme", "text": "Recibido Conforme" },
    { "value": "autorizaciones", "text": "Autorizaciones" },
    { "value": "productos", "text": "Productos" },
    { "value": "parentezco", "text": "Autorizados - Parentezco" },
    { "value": "tipo_autorizado", "text": "Autorizados - Tipo" },
    { "value": "tramite_de", "text": "Contactos - Trámite de" },
    { "value": "departamento", "text": "Contactos - Departamento" },
    { "value": "puesto", "text": "Contactos - Puesto" },
    { "value": "celular", "text": "Celular" },
    { "value": "d1pais", "text": "Direccion #1 - Pais" },
    { "value": "d1provincia", "text": "Direccion #1 - Provincia" },
    { "value": "d1canton", "text": "Direccion #1 - Cantón" },
    { "value": "d1direccion", "text": "Direccion #1 - Señas" },
    { "value": "d1telefono_1", "text": "Direccion #1 - Teléfono 1" },
    { "value": "d1telefono_2", "text": "Direccion #1 - Teléfono 2" },
    { "value": "d1telefono_3", "text": "Direccion #1 - Teléfono 3" },
    { "value": "d1telefono_4", "text": "Direccion #1 - Teléfono 4" },
    { "value": "d1email_uno", "text": "Direccion #1 - Correo" },
    { "value": "d2pais", "text": "Direccion #2 - Pais" },
    { "value": "d2provincia", "text": "Direccion #2 - Provincia" },
    { "value": "d2canton", "text": "Direccion #2 - Cantón" },
    { "value": "d2direccion", "text": "Direccion #2 - Señas" },
    { "value": "d2telefono_1", "text": "Direccion #2 - Teléfono 1" },
    { "value": "d2telefono_2", "text": "Direccion #2 - Teléfono 2" },
    { "value": "d2email_uno", "text": "Direccion #2 - Correo" }
    ]
  sucursales: IEmpresa[];
  empresas: IEmpresa[];
  zonas: IZona[];
  productos: IProducto[];
  productosObj: IProducto[] = [];
  contratos: IContrato[];
  selectedMulti: [];
  selectedConocio: [];
  selectedConocioStr = '';
  selectedMultiSucursales: any;
  selectedMultiSucursalesStr = "";
  selectedEstados: any;
  selectedEstadosStr = "";
  selectedZonas: any;
  selectedZonasStr = "";
  selectedMeses: any;
  selectedMesesStr = "";
  selectedProductos: any;
  selectedProductosStr = '';
  selectedAutorizacione: [];
  selectedAutorizacioneStr = "";
  selectedContratos: any;
  selectedContratosStr = "";
  selectedColumnas: [];
  selectedColumnasStr = "";
  selectedEmpresas: any;
  selectedEmpresasStr = ""



  user: Usuario = new Usuario();
  url = '';
  userNameCookie: string = null;
  overlaysReportes: IOverlay = { message: 'Generando reporte...', show: true };
  overlays: IOverlay = { message: 'Cargando reporte...', show: true };
  overlaysHide: IOverlay = { message: '', show: false };
  tarjetaObject: ITarjeta =
    {
      cuenta: '',
      desde: '',
      hasta: ''
    };


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
   
    await this.serv.ObtenerReportes(this.data, this.url, httpOptions)
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

  buscarIdColumnas(objSplit, items) {
    var valor = "";

    objSplit.forEach(function (term) {

      term = term.toLocaleLowerCase();
      var objeto = items.find(element => element.value == term);
      if (valor == "") {
        valor = objeto["value"] + ",";
      }
      else {
        valor = valor + objeto["value"];
      }
    });
    return valor;
  }

  buscarIdModel(objSplit, items) {

    var valor = "";

    objSplit.forEach(function (term) {

      term = term.toLocaleLowerCase();
      var objeto = items.find(element => element.id == term);
      if (valor == "") {
        valor = objeto["id"] + ",";
      }
      else {
        valor = valor + objeto["id"];
      }
    });
    return valor;
  }

  buscarTextoModel(objSplit, items) {

    var valor = "";

    objSplit.forEach(function (term) {

      term = term.toLocaleLowerCase();
      var objeto = items.find(element => element.id == term);
      if (valor == "") {
        valor = objeto["name"] + ",";
       
        if (valor.includes("undefined")) {
          valor = objeto["nombre"] + ",";
        }
      }
      else {
        valor = valor + objeto["name"];
        if (valor.includes("undefined")) {
          valor = valor + objeto["nombre"];
        }
      }
    });
    return valor;
  }

  buscarTextoColumnas(objSplit, items) {

    var valor = "";

    objSplit.forEach(function (term) {
      
      term = term.toLocaleLowerCase();
      var objeto = items.find(element => element.value == term);
      if (valor == "") {
        valor = objeto["text"] + ",";
      }
      else {
        valor = valor + objeto["text"];
      }
    });
    return valor;
  }


  async onChange(deviceValue) {
    
    if (deviceValue != -1) {
      var respuesta = await this.llamadaGenerica({ "reporte_id": deviceValue }, "", "reportes/rmercadeo-cargar");
      if (respuesta.success) {

        this.reporteSeleccionado = 0;
        var obj = JSON.parse(respuesta.Data.contenido);
        this.rptoboxObject = obj;

        //Precargamos el objeto Columnas
        var colum = obj.columnas;
        if (colum != "") {
          var objColum = colum.split(",");
          var columnasEncontradas: any;
          columnasEncontradas = this.buscarTextoColumnas(objColum, this.objColumnas).split(",");
          this.selectedColumnas = columnasEncontradas;
          this.selectedColumnasStr = this.buscarIdColumnas(objColum, this.objColumnas);
        }

        //Precargamos el objeto Contratos
        var contrat = obj.contratos;
        if (contrat != "") {
          var objContrat = contrat.split(",");
          var contratosEncontradas: any;
          contratosEncontradas = this.buscarTextoColumnas(objContrat, this.contratos).split(",");
          this.selectedContratos = contratosEncontradas;
          this.selectedContratosStr = this.buscarIdColumnas(objContrat, this.contratos);
        }

        //Precargamos el objeto del mes de cumpleaños
        var mesCump = obj.cumplea_os
        if (mesCump != "") {
          var objMes = mesCump.split(",");
          var mesesEncontrados: any;
          mesesEncontrados = this.buscarTextoColumnas(objMes, this.objMeses).split(",");
          this.selectedMeses = mesesEncontrados;
          this.selectedMesesStr = this.buscarIdColumnas(objMes, this.objMeses);
        }

        //Precargamos el objeto del mes de empresas
        var emp = obj.empresas
        if (emp != "") {
          var objEmp = emp.split(",");
          var empresasEncontrados: any;
          empresasEncontrados = this.buscarTextoModel(objEmp, this.empresas).split(",");
          const index = empresasEncontrados.indexOf("");
          if (index > -1) {
            empresasEncontrados.splice(index, 1);
          }
          this.selectedEmpresas = empresasEncontrados;
          this.selectedEmpresasStr = this.buscarIdModel(objEmp, this.empresas);
        }


        //Precargamos el objeto de estados
        var est = obj.estados;
        if (est != "") {
          var objEst = est.split(",");
          var estadosEncontrados: any;
          estadosEncontrados = this.buscarTextoColumnas(objEst, this.objEstados).split(",");
          const index = estadosEncontrados.indexOf("");
          if (index > -1) {
            estadosEncontrados.splice(index, 1);
          }
          this.selectedEstados = estadosEncontrados;
          this.selectedEstadosStr = this.buscarIdColumnas(objEst, this.objEstados);
        }

        //Precargamos el objeto de productos
        var prod = obj.productos;
        if (prod != "") {
          var objProd = prod.split(",");
          var productosEncontrados: any;
          productosEncontrados = this.buscarTextoModel(objProd, this.productos).split(",");
          const index = productosEncontrados.indexOf("");
          if (index > -1) {
            productosEncontrados.splice(index, 1);
          }
          this.selectedProductos = productosEncontrados;
          this.selectedProductosStr = this.buscarIdModel(objProd, this.productos);
        }
        this.reporteSeleccionado = obj.reporte;

        //Precargamos el objeto de sucursales
        var suc = obj.sucursales;
        if (suc != "") {
          var objSuc = suc.split(",");
          var sucursalesEncontrados: any;
          sucursalesEncontrados = this.buscarTextoModel(objSuc, this.sucursales).split(",");
          const index = sucursalesEncontrados.indexOf("");
          if (index > -1) {
            sucursalesEncontrados.splice(index, 1);
          }
          this.selectedMultiSucursales = sucursalesEncontrados;
          this.selectedMultiSucursalesStr = this.buscarIdModel(objSuc, this.sucursales);
        }

        //Precargamos el objeto de zonas

        var zon = obj.zonas
        if (zon != "") {
          var objZon = zon.split(",");
          var zonasEncontrados: any;
          zonasEncontrados = this.buscarTextoModel(objZon, this.zonas).split(",");
          const index = zonasEncontrados.indexOf("");
          if (index > -1) {
            zonasEncontrados.splice(index, 1);
          }
          this.selectedZonas = zonasEncontrados;
          this.selectedZonasStr = this.buscarIdModel(objZon, this.zonas);
        }
      }
      else {
        await this.mostrarMensaje('<p>No se ha podido completar la operación </p>', this.iconoError);
      }

    }
    else {
      this.tarjetaFormPrincipal.controls['rptoboxnamenew'].value("");
    }
  }



  getValuesProductos(event): void {
    
    this.selectedProductosStr = ""
    for (var i = 0; i < event.length; i++) {
      if (this.selectedProductosStr == "") {
        if (i < event.length - 1) {
          this.selectedProductosStr = this.selectedProductosStr + event[i].id + ",";
        }
        else {
          this.selectedProductosStr = this.selectedProductosStr + event[i].id;
        }
      }
      else {
        if (i < event.length-1) {
          this.selectedProductosStr = this.selectedProductosStr + event[i].id + ",";
        }
        else {
          this.selectedProductosStr = this.selectedProductosStr + event[i].id;
        }
      }
    }
  }

  getValuesConocio(event): void {
    this.selectedConocioStr = ""
    for (var i = 0; i < event.length; i++) {
      if (this.selectedConocioStr == "") {
        if (i < event.length - 1) {
          this.selectedConocioStr = this.selectedConocioStr + "'" + event[i].value + "',";
        }
        else {
          this.selectedConocioStr = this.selectedConocioStr + "'" + event[i].value + "'";
        }
      }
      else {
        if (i < event.length - 1) {
          this.selectedConocioStr = this.selectedConocioStr + "'" + event[i].value + "',";
        }
        else {
          this.selectedConocioStr = this.selectedConocioStr + "'" + event[i].value + "'";
        }
      }
    }
  }

  getValuesSucursales(event): void {
    this.selectedMultiSucursalesStr = ""
    for (var i = 0; i < event.length; i++) {
      if (this.selectedMultiSucursalesStr == "") {
        if (i < event.length - 1) {
          this.selectedMultiSucursalesStr = this.selectedMultiSucursalesStr + event[i].id + ",";
        }
        else {
          this.selectedMultiSucursalesStr = this.selectedMultiSucursalesStr + event[i].id;
        }
      }
      else {
        if (i < event.length - 1) {
          this.selectedMultiSucursalesStr = this.selectedMultiSucursalesStr + event[i].id + ",";
        }
        else {
          this.selectedMultiSucursalesStr = this.selectedMultiSucursalesStr + event[i].id;
        }
      }
    }
  }

  getValuesEstados(event): void {
    this.selectedEstadosStr = ""
    for (var i = 0; i < event.length; i++) {
      if (this.selectedEstadosStr == "") {
        if (i < event.length - 1) {
          this.selectedEstadosStr = this.selectedEstadosStr + event[i].value + ",";
        }
        else {
          this.selectedEstadosStr = this.selectedEstadosStr + event[i].value;
        }
      }
      else {
        if (i < event.length - 1) {
          this.selectedEstadosStr = this.selectedEstadosStr + event[i].value + ",";
        }
        else {
          this.selectedEstadosStr = this.selectedEstadosStr + event[i].value;
        }
      }
    }
  }

  getValuesZonas(event): void {
    this.selectedZonasStr = ""
    for (var i = 0; i < event.length; i++) {
      if (this.selectedZonasStr == "") {
        if (i < event.length - 1) {
          this.selectedZonasStr = this.selectedZonasStr + event[i].id + ",";
        }
        else {
          this.selectedZonasStr = this.selectedZonasStr + event[i].id;
        }
      }
      else {
        if (i < event.length - 1) {
          this.selectedZonasStr = this.selectedZonasStr + event[i].id + ",";
        }
        else {
          this.selectedZonasStr = this.selectedZonasStr + event[i].id;
        }
      }
    }
  }

  getValuesMeses(event): void {
    this.selectedMesesStr = ""
    for (var i = 0; i < event.length; i++) {
      if (this.selectedMesesStr == "") {
        if (i < event.length - 1) {
          this.selectedMesesStr = this.selectedMesesStr + event[i].value + ",";
        }
        else {
          this.selectedMesesStr = this.selectedMesesStr + event[i].value;
        }
      }
      else {
        if (i < event.length - 1) {
          this.selectedMesesStr = this.selectedMesesStr + event[i].value + ",";
        }
        else {
          this.selectedMesesStr = this.selectedMesesStr + event[i].value;
        }
      }
    }
  }

  getValuesAutorizaciones(event): void {
   
    this.selectedAutorizacioneStr = ""
    for (var i = 0; i < event.length; i++) {
      if (this.selectedAutorizacioneStr == "") {
        if (i < event.length - 1) {
          this.selectedAutorizacioneStr = this.selectedAutorizacioneStr + event[i].value + ",";
        }
        else {
          this.selectedAutorizacioneStr = this.selectedAutorizacioneStr + event[i].value;
        }
      }
      else {
        if (i < event.length - 1) {
          this.selectedAutorizacioneStr = this.selectedAutorizacioneStr + event[i].value + ",";
        }
        else {
          this.selectedAutorizacioneStr = this.selectedAutorizacioneStr + event[i].value;
        }
      }
    }
  }

  getValuesContratos(event): void {
    this.selectedContratosStr = ""
    for (var i = 0; i < event.length; i++) {
      if (this.selectedContratosStr == "") {
        if (i < event.length - 1) {
          this.selectedContratosStr = this.selectedContratosStr + event[i].costo + ",";
        }
        else {
          this.selectedContratosStr = this.selectedContratosStr + event[i].costo;
        }
      }
      else {
        if (i < event.length - 1) {
          this.selectedContratosStr = this.selectedContratosStr + event[i].costo + ",";
        }
        else {
          this.selectedContratosStr = this.selectedContratosStr + event[i].costo;
        }
      }
    }
  }

  getValuesColumna(event): void {
    this.selectedColumnasStr = ""
    for (var i = 0; i < event.length; i++) {
      if (this.selectedColumnasStr == "") {
        if (i < event.length - 1) {
          this.selectedColumnasStr = this.selectedColumnasStr + event[i].value + ",";
        }
        else {
          this.selectedColumnasStr = this.selectedColumnasStr + event[i].value;
        }
      }
      else {
        if (i < event.length - 1) {
          this.selectedColumnasStr = this.selectedColumnasStr + event[i].value + ",";
        }
        else {
          this.selectedColumnasStr = this.selectedColumnasStr + event[i].value;
        }
      }
    }
  }

  getValuesEmpresas(event): void {
    this.selectedEmpresasStr = ""
    for (var i = 0; i < event.length; i++) {
      if (this.selectedEmpresasStr== "") {
        if (i < event.length - 1) {
          this.selectedEmpresasStr = this.selectedEmpresasStr + event[i].id + ",";
        }
        else {
          this.selectedEmpresasStr = this.selectedEmpresasStr + event[i].id;
        }
      }
      else {
        if (i < event.length - 1) {
          this.selectedEmpresasStr = this.selectedEmpresasStr + event[i].id + ",";
        }
        else {
          this.selectedEmpresasStr = this.selectedEmpresasStr + event[i].id;
        }
      }
    }
  }



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




  tarjetaFormPrincipal = new FormGroup({
    rptoboxname: new FormControl(),
    rptoboxnamenew: new FormControl()
  });

  tarjetaFormDos = new FormGroup({
    rptDesde: new FormControl(),
    rptHasta: new FormControl(),
    rptPromocion: new FormControl(),
    rptConocio : new FormControl(),
    rptEmpresa : new FormControl(),
    rptSucursal: new FormControl(),
  });


  tarjetaFormTres = new FormGroup({
    rptEstados: new FormControl(),
    rptZonas: new FormControl(),
    rptMeses: new FormControl()
  });

  tarjetaFormCuatro = new FormGroup({
    rptProductos: new FormControl(),
    rptAutorizaciones: new FormControl(),
    rptContratos: new FormControl()
  });

  tarjetaFormCinco = new FormGroup({
    rptColumnas: new FormControl()
  });

  



 
  constructor(
    public router: Router,
    private servUser: UsuarioService,
    private cookieService: CookieService,
    private overlayService: OverlayService,
    private serv: RptOboxService,
    private serEmpresas: EmpresasService,
    private serProducto: ProductosService,
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

    this.cargarReportes();
  }

  ngOnDestroy(): void {

  }

  empresaAgregar() {

  }

  sucursalAgregar() {

  }

  ngAfterViewInit(): void {

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

  async cargarReportes() {
    
    this.userNameCookie = this.cookieService.get('username') === '' ? null : this.cookieService.get('username'); // To Get Cookie
    if (this.userNameCookie === '' || UtilApp.isNullOrUndefined(this.userNameCookie) || this.user.token === '') {
      this.redirectLogin();
    } else {
      var data = {
        "tipo": "POBOX"
      }
      let empresasParse: IRptObox[];
      empresasParse = [];
      this.overlayService.show(this.overlays);
      this.url = AppConfigService.settings.server + 'reportes/rmercadeo';
      this.jdata = { jdata: data, jSessionId: this.user.token };
      this.data = 'jdata=' + encodeURIComponent(JSON.stringify(this.jdata));
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        }),
      };      

      try {


        await this.serv.ObtenerReportes(this.data, this.url, httpOptions)
          .then((result: []) => this.resultado = result)
          .catch(catchError(this.handleError));
        if (this.util.vResultado(this.resultado)) {
          console.log(JSON.parse(this.resultado.values));
          JSON.parse(this.resultado.values).forEach((a, b) => {
            empresasParse.push({
              id: a[0],
              nombre: a[1],
              autorizaciones: "",
              codigopromocion: "",
              columnas: "",
              comoconocio: "",
              contratos: "",
              cumplea_os: "",
              empresas: "",
              estados: "",
              fechadesde: "",
              fechahasta: "",
              guardar: false,
              productos: "",
              reporte: "",
              sucursales: "",
              tipo: "",
              zonas: ""
             
              
            });
          });
          let newReport: IRptObox[];
          newReport = [];
          newReport.push({
            id: -1,
            nombre: "Crear un reporte nuevo",
            autorizaciones: "",
            codigopromocion: "",
            columnas: "",
            comoconocio: "",
            contratos: "",
            cumplea_os: "",
            empresas: "",
            estados: "",
            fechadesde: "",
            fechahasta: "",
            guardar: false,
            productos: "",
            reporte: "",
            sucursales: "",
            tipo: "",
            zonas: ""
          });
          this.rptoboxList = newReport.concat(empresasParse);
          this.overlayService.show(this.overlaysHide);
          this.cargarSucursales();
        } else {
          this.overlayService.show(this.overlaysHide);
        }
      }
      catch (ex) {
        var xx = ex;
      }
    }
  }


  async cargarSucursales() {
    
    this.userNameCookie = this.cookieService.get('username') === '' ? null : this.cookieService.get('username'); // To Get Cookie
    if (this.userNameCookie === '' || UtilApp.isNullOrUndefined(this.userNameCookie) || this.user.token === '') {
      this.redirectLogin();
    } else {
      var data = {
        "tipo": "POBOX"
      }
      let empresasParse: IEmpresa[];
      empresasParse = [];
      this.overlayService.show(this.overlays);
      this.url = AppConfigService.settings.server + 'parametros/sucursales';
      this.jdata = { jdata: data, jSessionId: this.user.token };
      this.data = 'jdata=' + encodeURIComponent(JSON.stringify(this.jdata));
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        }),
      };

      await this.serEmpresas.ObtenerSucursales(this.data, this.url, httpOptions)
        .then((result: []) => this.resultado = result)
        .catch(catchError(this.handleError));
      if (this.util.vResultado(this.resultado)) {
        console.log(JSON.parse(this.resultado.values));
        JSON.parse(this.resultado.values).forEach((a, b) => {
          empresasParse.push({
            id: a[0],
            name: a[1]
          });
        });
        this.sucursales = empresasParse;
        this.overlayService.show(this.overlaysHide);
        this.cargarContratos();
      } else {
        this.overlayService.show(this.overlaysHide);
      }
    }
  }


  async cargarEmpresas() {
    
    this.userNameCookie = this.cookieService.get('username') === '' ? null : this.cookieService.get('username'); // To Get Cookie
    if (this.userNameCookie === '' || UtilApp.isNullOrUndefined(this.userNameCookie) || this.user.token === '') {
      this.redirectLogin();
    } else {
      var data = {
        "tipo": "POBOX"
      }
      let empresasParse: IEmpresa[];
      empresasParse = [];
      this.overlayService.show(this.overlays);
      this.url = AppConfigService.settings.server + 'parametros/empresas';
      this.jdata = { jdata: data, jSessionId: this.user.token };
      this.data = 'jdata=' + encodeURIComponent(JSON.stringify(this.jdata));
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        }),
      };

      await this.serEmpresas.ObtenerSucursales(this.data, this.url, httpOptions)
        .then((result: []) => this.resultado = result)
        .catch(catchError(this.handleError));
      if (this.util.vResultado(this.resultado)) {
        console.log(JSON.parse(this.resultado.values));
        JSON.parse(this.resultado.values).forEach((a, b) => {
          empresasParse.push({
            id: a[0],
            name: a[1]
          });
        });
        this.empresas = empresasParse;

        this.overlayService.show(this.overlaysHide);
      } else {
        this.overlayService.show(this.overlaysHide);
      }
    }
  }

  async cargarZonas() {
    
    this.userNameCookie = this.cookieService.get('username') === '' ? null : this.cookieService.get('username'); // To Get Cookie
    if (this.userNameCookie === '' || UtilApp.isNullOrUndefined(this.userNameCookie) || this.user.token === '') {
      this.redirectLogin();
    } else {
      var data = {
        "tipo": "POBOX"
      }
      let empresasParse: IZona[];
      empresasParse = [];
      this.overlayService.show(this.overlays);
      this.url = AppConfigService.settings.server + 'parametros/zonas';
      this.jdata = { jdata: data, jSessionId: this.user.token };
      this.data = 'jdata=' + encodeURIComponent(JSON.stringify(this.jdata));
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        }),
      };

      await this.serEmpresas.ObtenerSucursales(this.data, this.url, httpOptions)
        .then((result: []) => this.resultado = result)
        .catch(catchError(this.handleError));
      if (this.util.vResultado(this.resultado)) {
        console.log(JSON.parse(this.resultado.values));
        JSON.parse(this.resultado.values).forEach((a, b) => {
          empresasParse.push({
            id: a[0],
            nombre: a[1]
          });
        });
        this.zonas = empresasParse;
        this.overlayService.show(this.overlaysHide);
        this.cargarEmpresas();
      } else {
        this.overlayService.show(this.overlaysHide);
      }
    }
  }

  async cargarProductos() {
    
    this.userNameCookie = this.cookieService.get('username') === '' ? null : this.cookieService.get('username'); // To Get Cookie
    if (this.userNameCookie === '' || UtilApp.isNullOrUndefined(this.userNameCookie) || this.user.token === '') {
      this.redirectLogin();
    } else {
      var data = {
        "tipo": "POBOX"
      }
      let empresasParse: IProducto[];
      empresasParse = [];
      this.overlayService.show(this.overlays);
      this.url = AppConfigService.settings.server + 'parametros/productos';
      this.jdata = { jdata: data, jSessionId: this.user.token };
      this.data = 'jdata=' + encodeURIComponent(JSON.stringify(this.jdata));
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        }),
      };

      await this.serProducto.ObtenerProductos(this.data, this.url, httpOptions)
        .then((result: []) => this.resultado = result)
        .catch(catchError(this.handleError));
      if (this.util.vResultado(this.resultado)) {
        console.log(JSON.parse(this.resultado.values));
        JSON.parse(this.resultado.values).forEach((a, b) => {
          empresasParse.push({
            id: a[0],
            nombre: a[1],
            empresa_id: a[2],
            MultiPais: a[3],
            CodigoPais: a[4]
          });
        });
        this.productos = empresasParse;
        this.productosObj = this.productos;
        this.overlayService.show(this.overlaysHide);
        this.cargarZonas();
      } else {
        this.overlayService.show(this.overlaysHide);
      }
    }
  }

  async cargarContratos() {
    
    this.userNameCookie = this.cookieService.get('username') === '' ? null : this.cookieService.get('username'); // To Get Cookie
    if (this.userNameCookie === '' || UtilApp.isNullOrUndefined(this.userNameCookie) || this.user.token === '') {
      this.redirectLogin();
    } else {
      var data = {
        "tipo": "POBOX"
      }
      let empresasParse: IContrato[];
      empresasParse = [];
      this.overlayService.show(this.overlays);
      this.url = AppConfigService.settings.server + 'parametros/contratos';
      this.jdata = { jdata: data, jSessionId: this.user.token };
      this.data = 'jdata=' + encodeURIComponent(JSON.stringify(this.jdata));
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        }),
      };

      await this.serProducto.ObtenerProductos(this.data, this.url, httpOptions)
        .then((result: []) => this.resultado = result)
        .catch(catchError(this.handleError));
      if (this.util.vResultado(this.resultado)) {
        console.log(JSON.parse(this.resultado.values));
        JSON.parse(this.resultado.values).forEach((a, b) => {
          empresasParse.push({
            costo: a[0],
            valor: a[1],
            desde: a[2],
            hasta: a[3]
          });
        });
        this.contratos = empresasParse;
        this.overlayService.show(this.overlaysHide);
        this.cargarProductos();
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

  async MostrarDivPrincipal() {
    
    console.log(this.selectedProductos);
    var divP = document.getElementById("divPrincipal");
    divP.style.display = 'block';
    var divD = document.getElementById("divPrincipalDos");
    divD.style.display = 'none';
    var divT = document.getElementById("divPrincipalTres");
    divT.style.display = 'none';
    var divC = document.getElementById("divPrincipalCuatro");
    divC.style.display = 'none';
    var divCi = document.getElementById("divPrincipalCinco");
    divCi.style.display = 'none';
  }

  async MostrarDivDos() {
    var divP = document.getElementById("divPrincipal");
    divP.style.display = 'none';
    var divD = document.getElementById("divPrincipalDos");
    divD.style.display = 'block';
    var divT = document.getElementById("divPrincipalTres");
    divT.style.display = 'none';
    var divC = document.getElementById("divPrincipalCuatro");
    divC.style.display = 'none';
    var divCi = document.getElementById("divPrincipalCinco");
    divCi.style.display = 'none';
  }

  async MostrarDivTres() {
    var divP = document.getElementById("divPrincipal");
    divP.style.display = 'none';
    var divD = document.getElementById("divPrincipalDos");
    divD.style.display = 'none';
    var divT = document.getElementById("divPrincipalTres");
    divT.style.display = 'block';
    var divC = document.getElementById("divPrincipalCuatro");
    divC.style.display = 'none';
    var divCi = document.getElementById("divPrincipalCinco");
    divCi.style.display = 'none';
  }

  async MostrarDivCuatro() {
    var divP = document.getElementById("divPrincipal");
    divP.style.display = 'none';
    var divD = document.getElementById("divPrincipalDos");
    divD.style.display = 'none';
    var divT = document.getElementById("divPrincipalTres");
    divT.style.display = 'none';
    var divC = document.getElementById("divPrincipalCuatro");
    divC.style.display = 'block';
    var divCi = document.getElementById("divPrincipalCinco");
    divCi.style.display = 'none';
  }

  async MostrarDivCinco() {
    var divP = document.getElementById("divPrincipal");
    divP.style.display = 'none';
    var divD = document.getElementById("divPrincipalDos");
    divD.style.display = 'none';
    var divT = document.getElementById("divPrincipalTres");
    divT.style.display = 'none';
    var divC = document.getElementById("divPrincipalCuatro");
    divC.style.display = 'none';
    var divCi = document.getElementById("divPrincipalCinco");
    divCi.style.display = 'block';
  }


  async generarReporte() {
    debugger;
    if (this.selectedColumnasStr != "") {
      var desde = this.tarjetaFormDos.controls['rptDesde'].value;
      var hasta = this.tarjetaFormDos.controls['rptHasta'].value;
      var codigoPromocional = this.tarjetaFormDos.controls['rptPromocion'].value;
      if (codigoPromocional == null) {
        codigoPromocional = "";
      }
      this.rptoboxObject.fechadesde = desde;
      this.rptoboxObject.fechahasta = hasta;

      var nombreR = this.tarjetaFormPrincipal.controls['rptoboxnamenew'].value;
      if (nombreR == null) {
        nombreR = this.rptoboxObject.nombre;
      }

      this.userNameCookie = this.cookieService.get('username') === '' ? null : this.cookieService.get('username'); // To Get Cookie
      if (this.userNameCookie === '' || UtilApp.isNullOrUndefined(this.userNameCookie) || this.user.token === '') {
        this.redirectLogin();
      } else {
        var data = {
          "reporte": this.rptoboxObject.reporte,
          "nombre": nombreR,
          "fecha-desde": this.rptoboxObject.fechadesde,
          "fecha-hasta": this.rptoboxObject.fechahasta,
          "empresas": this.selectedEmpresasStr,
          "codigo-promocion": codigoPromocional,
          "como-conocio": this.selectedConocioStr,
          "sucursales": this.selectedMultiSucursalesStr,
          "estados": this.selectedEstadosStr,
          "zonas": this.selectedZonasStr,
          "cumplea_os": this.selectedMesesStr,
          "productos": this.selectedProductosStr,
          "autorizaciones": this.selectedAutorizacioneStr,
          "contratos": this.selectedContratosStr,
          "columnas": this.selectedColumnasStr,
          "tipo": "POBOX",
          "guardar": false,
        }
        let empresasParse: IRptObox[];
        empresasParse = [];
        this.overlayService.show(this.overlaysReportes);
        this.url = AppConfigService.settings.server + 'reportes/pobox-reporte';
        this.jdata = { jdata: data, jSessionId: this.user.token };
        this.data = 'jdata=' + encodeURIComponent(JSON.stringify(this.jdata));
        const httpOptions = {
          headers: new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          }),
        };

        await this.serProducto.ObtenerProductos(this.data, this.url, httpOptions)
          .then((result: []) => this.resultado = result)
          .catch(catchError(this.handleError));
        if (this.util.vResultado(this.resultado)) {
          console.log(JSON.parse(this.resultado.values));
          var Data = JSON.parse(this.resultado.values)
          var rptname = Data[0];
          window.open(
            AppConfigService.settings.server + 'reportes/shwxls/' + rptname,
            'JetBox Mercadeo'
          )

          this.overlayService.show(this.overlaysHide);

        } else {
          this.overlayService.show(this.overlaysHide);
        }
      }
    }
    else {
      await this.mostrarMensaje("Debe seleccionar al menos una columna! ", this.iconoError);
    }
  }

  async generarGuardarReporte() {
    if (this.selectedColumnasStr != "") {
      var desde = this.tarjetaFormDos.controls['rptDesde'].value;
      var hasta = this.tarjetaFormDos.controls['rptHasta'].value;
      var codigoPromocional = this.tarjetaFormDos.controls['rptPromocion'].value;
      if (codigoPromocional == null) {
        codigoPromocional = "";
      }
      this.rptoboxObject.fechadesde = desde;
      this.rptoboxObject.fechahasta = hasta;

      var nombreR = this.tarjetaFormPrincipal.controls['rptoboxnamenew'].value;
      if (nombreR == null) {
        nombreR = this.rptoboxObject.nombre;
      }

      this.userNameCookie = this.cookieService.get('username') === '' ? null : this.cookieService.get('username'); // To Get Cookie
      if (this.userNameCookie === '' || UtilApp.isNullOrUndefined(this.userNameCookie) || this.user.token === '') {
        this.redirectLogin();
      } else {
        var data = {
          "reporte": this.rptoboxObject.reporte,
          "nombre": nombreR,
          "fecha-desde": this.rptoboxObject.fechadesde,
          "fecha-hasta": this.rptoboxObject.fechahasta,
          "empresas": this.selectedEmpresasStr,
          "codigo-promocion": codigoPromocional,
          "como-conocio": this.selectedConocioStr,
          "sucursales": this.selectedMultiSucursalesStr,
          "estados": this.selectedEstadosStr,
          "zonas": this.selectedZonasStr,
          "cumplea_os": this.selectedMesesStr,
          "productos": this.selectedProductosStr,
          "autorizaciones": this.selectedAutorizacioneStr,
          "contratos": this.selectedContratosStr,
          "columnas": this.selectedColumnasStr,
          "tipo": "POBOX",
          "guardar": true,
        }
        let empresasParse: IRptObox[];
        empresasParse = [];
        this.overlayService.show(this.overlays);
        this.url = AppConfigService.settings.server + 'reportes/pobox-reporte';
        this.jdata = { jdata: data, jSessionId: this.user.token };
        this.data = 'jdata=' + encodeURIComponent(JSON.stringify(this.jdata));
        const httpOptions = {
          headers: new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          }),
        };

        await this.serProducto.ObtenerProductos(this.data, this.url, httpOptions)
          .then((result: []) => this.resultado = result)
          .catch(catchError(this.handleError));
        if (this.util.vResultado(this.resultado)) {
          console.log(JSON.parse(this.resultado.values));
          var Data = JSON.parse(this.resultado.values)
          var rptname = Data[0];
          window.open(
            AppConfigService.settings.server + 'reportes/shwxls/' + rptname,
            'JetBox Mercadeo'
          )

          this.overlayService.show(this.overlaysHide);

        } else {
          this.overlayService.show(this.overlaysHide);
        }
      }
    }
    else {
      await this.mostrarMensaje("Debe seleccionar al menos una columna! ", this.iconoError);
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





}
