export interface JwtPayload {
  id: string;
  is_active: boolean;
  is_creator: boolean;
  full_name: string;
  email: string;
  refreshToken?:string
}
