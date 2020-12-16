export class Usuario {

  constructor(codigoPais?, password?, username?, name?, email?, token?) {
    this.codigoPais = codigoPais;
    this.username = username;
    this.name = name;
    this.email = email;
    this.token = token;
    this.password = password;
  }

  codigoPais: number;
  password: string;
  username: string;
  name: string;
  email: string;
  token: string;
  menuItems: string[];
  values: any;
}
