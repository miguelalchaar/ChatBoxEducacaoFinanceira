export interface Usuario {
  id: string;
  nome: string;
  email: string;
  cnpj: string;
  nomeFantasia?: string;
  razaoSocial?: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresIn: number;
  usuario: Usuario;
}

export interface RegisterPayload {
  nome: string;
  email: string;
  senha: string;
  cnpj: string;
  razaoSocial?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}
