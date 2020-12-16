export interface IAppConfig {
  server: string;
  server_localhost: string;
  server_jetbox: string;
  app_name: string;
  pais_suffix: string;
  pais_name: string;
  pais_flag: string;
  pais_tarjetas: string;
  cookies_expiration: number;
  contrato_gold: number;
  producto_pobox: number;
  producto_agencia_aduanal: number;
  division0: string;
  division1: string;
  cedula_juridica: string;
  zonas_bloqueadas: string;
  contrato_default: number;
  contrato_economy_default: number;
  mostrar_contrato_economy: boolean;
  paises: {
    '188': {
      pais_suffix: string;
      pais_name: string;
      pais_flag: string;
      cookies_expiration: string;
    },
  };
}
