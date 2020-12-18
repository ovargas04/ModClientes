import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppConfigService } from '../app-configuration.service';
// servicios
import { DropDownMenuService } from '../dropdownmenu.service';
// Modelo
import { IDropDownMenu } from '../model/IDropDownMenu';
import { IMenu } from '../model/IMenu';
import { Usuario } from '../model/Usuario';
import { UsuarioService } from '../usuario.service';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css'],
})
export class NavMenuComponent implements OnInit, OnDestroy {
  private destroy$: Subject < void> = new Subject<void>();
  _dropdown: IDropDownMenu = { show: false };
  menu: IMenu = {};
  isExpanded = false;
  user: Usuario = new Usuario();
  bandera = 'images/no-pais.png';
  opcionesMenu: string[];

  constructor(
    private drodownService: DropDownMenuService,
    private servUser: UsuarioService,
  ) {
    this.drodownService.model$
      .pipe(takeUntil(this.destroy$))
      .subscribe(
      (drop) => {
        this._dropdown = drop;
      });
    this.servUser.model$
    .pipe(takeUntil(this.destroy$))
    .subscribe(
      (model: Usuario) => {
        this.user = model;
        this.bandera = "images/" +
        (this.user.codigoPais > 0 ? AppConfigService.settings.paises[this.user.codigoPais]['pais_flag'] : 'no-pais.png');
        this.opcionesMenu = this.user.menuItems;
        if (this.opcionesMenu !== undefined) {
          if (this.opcionesMenu.length > 0) {
            console.log("opciones del menu : ", this.opcionesMenu);
            if (this.opcionesMenu.indexOf('MNU_PAR') >= 0) {
              this.menu.Parametros = {
                tieneEmpresa: false,
                tieneProductos: false,
                tieneZonas: false,
                tieneEjecutivos: false,
                tieneContratos: false,
                tieneAlienzas: false,
                tienePaises: false,
                tieneRutas: false,
                tieneMensajeros: false,
                tienePreferencias: false,
                tieneMultiPais: false,
                tieneManejo: false,
              };
              if (this.opcionesMenu.indexOf('PAR_Empresas') > 0) {
                this.menu.Parametros.tieneEmpresa = true;
              }
              if (this.opcionesMenu.indexOf('PAR_Productos') > 0) {
                this.menu.Parametros.tieneProductos = true;
              }
              if (this.opcionesMenu.indexOf('PAR_Zonas') > 0) {
                this.menu.Parametros.tieneZonas = true;
              }
              if (this.opcionesMenu.indexOf('PAR_Ejecutivos') > 0) {
                this.menu.Parametros.tieneEjecutivos = true;
              }
              if (this.opcionesMenu.indexOf('PAR_Contratos') > 0) {
                this.menu.Parametros.tieneContratos = true;
              }
              if (this.opcionesMenu.indexOf('PAR_Alianzas') > 0) {
                this.menu.Parametros.tieneAlienzas = true;
              }
              if (this.opcionesMenu.indexOf('PAR_Paises') > 0) {
                this.menu.Parametros.tienePaises = true;
              }
              if (this.opcionesMenu.indexOf('PAR_Rutas') > 0) {
                this.menu.Parametros.tieneRutas = true;
              }
              if (this.opcionesMenu.indexOf('PAR_Mensajeros') > 0) {
                this.menu.Parametros.tieneMensajeros = true;
              }
              if (this.opcionesMenu.indexOf('PAR_Preferencias') > 0) {
                this.menu.Parametros.tienePreferencias = true;
              }
              if (this.opcionesMenu.indexOf('PAR_MultiPais') > 0) {
                this.menu.Parametros.tieneMultiPais = true;
              }
              if (this.opcionesMenu.indexOf('PAR_Manejos') > 0) {
                this.menu.Parametros.tieneManejo = true;
              }
            }


            //if (this.opcionesMenu.indexOf('MNU_SEG') >= 0) {
            //}

            let tieneUsuarios = false;
            if (this.opcionesMenu.indexOf('SEG_Usuarios') > 0) {
              tieneUsuarios = true;
            }

            let tienePerfiles = false;
            if (this.opcionesMenu.indexOf('SEG_Perfiles') > 0) {
              tienePerfiles = true;
            }


            if (tieneUsuarios || tienePerfiles) {
              this.menu.Seguridad = {
                tieneUsuarios: tieneUsuarios,
                tienePerfiles: tienePerfiles,
              };
            }


            //if (this.opcionesMenu.indexOf('MNU_CLI') >= 0) {
             
              
            //}

            if (this.opcionesMenu.includes('CLI_mostrar') || this.opcionesMenu.includes('MNU_CLI')) {
              this.menu.Clientes = {
                tieneClientes: true,
              };
            }

            if (this.opcionesMenu.indexOf('MNU_RPT') >= 0) {
              this.menu.Reportes = {
                tieneClientePO: false,
                tieneClienteCarga: false,
                tieneTarjetas: false,
                tieneGrafica: false,
                tieneBitacora: false,
              };
              if (this.opcionesMenu.indexOf('RPT_Clientes_pobox') > 0) {
                this.menu.Reportes.tieneClientePO = true;
              }
              if (this.opcionesMenu.indexOf('RPT_Clientes_carga') > 0) {
                this.menu.Reportes.tieneClienteCarga = true;
              }
              if (this.opcionesMenu.indexOf('RPT_Tarjetas') > 0) {
                this.menu.Reportes.tieneTarjetas = true;
              }
              if (this.opcionesMenu.indexOf('RPT_Graficas') > 0) {
                this.menu.Reportes.tieneGrafica = true;
              }
              if (this.opcionesMenu.indexOf('RPT_Bitacoras') > 0) {
                this.menu.Reportes.tieneBitacora = true;
              }
            }
          }
        }
      });
  }

  toggle() {
    this.isExpanded = !this.isExpanded;
  }

  ngOnInit() {
    // this.opcionesMenu.length === 0 ? null : this.opcionesMenu
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
