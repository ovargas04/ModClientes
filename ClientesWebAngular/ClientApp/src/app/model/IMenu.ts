export interface IMenu  {
  // propiedades normales de la interface
  Parametros?: {
    tieneEmpresa: boolean;
    tieneProductos: boolean;
    tieneZonas: boolean;
    tieneEjecutivos: boolean;
    tieneContratos: boolean;
    tieneAlienzas: boolean;
    tienePaises: boolean;
    tieneRutas: boolean;
    tieneMensajeros: boolean;
    tienePreferencias: boolean;
    tieneMultiPais: boolean;
    tieneManejo: boolean;
  };
  Seguridad?: {
    tieneUsuarios: boolean;
    tienePerfiles: boolean;
  };
  Clientes?: {
    tieneClientes: boolean;
  };
  Reportes?: {
    tieneClientePO: boolean;
    tieneClienteCarga: boolean;
    tieneTarjetas: boolean;
    tieneGrafica: boolean;
    tieneBitacora: boolean;
  };
}
