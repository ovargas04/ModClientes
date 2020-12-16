import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CounterComponent } from './counter/counter.component';
import { DashboardComponent } from './dashboard/dashboardcomponent';
import { FetchDataComponent } from './fetch-data/fetch-data.component';
import { HeroesComponent } from './heroes/heroes.component';
// Componentes del sistema
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './Login/login.component';

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

//Reportes
import { TarjetasComponent } from './Reportes/Tarjetas/tarjetas.component';
import { RptOboxComponent } from './Reportes/RptObox/rptobox.component';
import { RptCargaComponent } from './Reportes/RptCarga/rptcarga.component';

//Clientes
import { ClientesComponent } from './Clientes/Clientes.component';
import { BitacoraComponent } from './Reportes/Bitacoras/bitacoras.component';


//Seguridad
import { UsuariosComponent } from './Seguridad/Usuarios/Usuarios.component';
import { PerfilesComponent } from './Seguridad/Perfiles/Perfiles.component';
import { CambioClaveComponent } from './Usuarios/CambioClave/cambioclave.component';
import { DatosUsuarioComponent } from './Usuarios/DatosUsuario/datosusuario.component';

const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'counter', component: CounterComponent },
  { path: 'fetch-data', component: FetchDataComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'heroes', component: HeroesComponent },
  { path: 'empresas', component: EmpresasComponent },
  { path: 'productos', component: ProductosComponent },
  { path: 'zonas', component: ZonasComponent },
  { path: 'contratos', component: ContratosComponent },
  { path: 'alianzas', component: AlianzasComponent },
  { path: 'paises', component: PaisesComponent },
  { path: 'rutas', component: RutasComponent },
  { path: 'mensajeros', component: MensajerosComponent },
  { path: 'preferencias', component: PreferenciasComponent },
  { path: 'multipais', component: MultipaisComponent },
  { path: 'tablamanejo', component: TablamanejoComponent },
  { path: 'clientes', component: ClientesComponent },
  { path: 'tarjetas', component: TarjetasComponent },
  { path: 'rptobox', component: RptOboxComponent },
  { path: 'rptcarga', component: RptCargaComponent },
  { path: 'usuarios', component: UsuariosComponent },
  { path: 'perfiles', component: PerfilesComponent },
  { path: 'rbitacoras', component: BitacoraComponent },
  { path: 'cambioclave', component: CambioClaveComponent },
  { path: 'datosusuario', component: DatosUsuarioComponent },
  { path: 'ejecutivos', component: EjecutivosComponent }

];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes),
  ],
  exports: [RouterModule],
})
export class AppRouterModule { }
