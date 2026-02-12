export type UserColors = {
  primary: string;
  secondary: string;
  tertiary: string;
};

export type AuthUser = {
  id: number | string;
  email: string;
  name?: string;
  roleIds?: number[];
  colors?: UserColors;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
};
