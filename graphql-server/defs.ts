export interface ServerArguments {
  host: string
  password: string
};

export interface TokenData {
  password: string
  secret: string
  host: string
};

export interface CreateTokenArguments {
  password: string
  host: string
};
