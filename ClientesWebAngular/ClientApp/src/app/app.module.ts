// For initializing some actions needed of start up module
import { HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// Modules
import { BrowserModule } from '@angular/platform-browser';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { DataTablesModule } from 'angular-datatables';
import { CookieService } from 'ngx-cookie-service';
import { AppConfigService } from './app-configuration.service';
// import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { AppRouterModule } from './app-router.module';

// Components
import { AppComponent } from './app.component';
import { CounterComponent } from './counter/counter.component';
import { DashboardComponent } from './dashboard/dashboardcomponent';
import { FetchDataComponent } from './fetch-data/fetch-data.component';
import { FooterComponent } from './footer/footer.component';
import { HeroesComponent } from './heroes/heroes.component';
import { HeroesDetailComponent } from './heroesDetail/heroesDetail.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './Login/login.component';
import { MessageComponent } from './message/message.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { OverlayComponent } from './overlay/overlay.component';

//Parametros
import { EmpresasComponent } from './Parametros/Empresas/empresas..component';
import { ProductosComponent } from './Parametros/Productos/productos.component';
import { ZonasComponent } from './Parametros/Zonas/zonas.component';
import { ContratosComponent } from './Parametros/Contratos/contratos.component';
import { AlianzasComponent } from './Parametros/Alianzas/alianzas.component';
import { PaisesComponent } from './Parametros/Paises/paises.component';
import { RutasComponent } from './Parametros/Rutas/rutas.component';
import { MensajerosComponent } from './Parametros/Mensajeros/mensajeros.component';
import { PreferenciasComponent } from './Parametros/Preferencias/preferencias.component';
import { MultipaisComponent } from './Parametros/MultiPais/multipais.component';
import { TablamanejoComponent } from './Parametros/TablaManejo/tablamanejo.component';

import { EjecutivosComponent } from './Parametros/Ejecutivos/ejecutivos.component';
//Fin parametros

//Reportes
import { TarjetasComponent } from './Reportes/Tarjetas/tarjetas.component';
import { RptOboxComponent } from './Reportes/RptObox/rptobox.component';
import { RptCargaComponent } from './Reportes/RptCarga/rptcarga.component';

//Fin Reportes


//Clientes

import { ClientesComponent } from './Clientes/Clientes.component';


//Seguridad

import { UsuariosComponent } from './Seguridad/Usuarios/Usuarios.component';
import { PerfilesComponent } from './Seguridad/Perfiles/Perfiles.component';

import { NgSelectModule } from '@ng-select/ng-select';
import { BitacoraComponent } from './Reportes/Bitacoras/bitacoras.component';
import { CambioClaveComponent } from './Usuarios/CambioClave/cambioclave.component';
import { DatosUsuarioComponent } from './Usuarios/DatosUsuario/datosusuario.component';


//Fin Clientes



// Services
// import { InMemoryDataService } from './in-memory-data.service';
// import { OverlayService } from './overlay.service';
export function initializeApp(appConfig: AppConfigService) {
  return () => appConfig.load();
}
@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    FooterComponent,
    NotificationsComponent,
    OverlayComponent,
    HomeComponent,
    CounterComponent,
    FetchDataComponent,
    HeroesComponent,
    HeroesDetailComponent,
    MessageComponent,
    DashboardComponent,
    LoginComponent,
    EmpresasComponent,
    ProductosComponent,
    ZonasComponent,
    ContratosComponent,
    AlianzasComponent,
    PaisesComponent,
    RutasComponent,
    MensajerosComponent,
    PreferenciasComponent,
    MultipaisComponent,
    TablamanejoComponent,
    ClientesComponent,
    TarjetasComponent,
    RptOboxComponent,
    BitacoraComponent,
    RptCargaComponent,
    UsuariosComponent,
    PerfilesComponent,
    CambioClaveComponent,
    DatosUsuarioComponent,
    EjecutivosComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    ReactiveFormsModule,
    HttpClientModule,
    DataTablesModule,
    FormsModule,
    AppRouterModule,
    NgxDatatableModule,
    NgSelectModule
  ],
  providers: [AppConfigService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AppConfigService], multi: true,
    },
    CookieService],
  bootstrap: [AppComponent],
})
export class AppModule { }
