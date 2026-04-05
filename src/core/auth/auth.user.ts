export type AuthUser = {
  id: number;
  username: string;
  email?: string | null;
  password: Buffer;
  salt: Buffer;
};
