declare module 'csurf' {
  import { RequestHandler } from 'express';

  type CookieOptions = {
    httpOnly?: boolean;
    sameSite?: boolean | 'lax' | 'strict' | 'none';
    secure?: boolean;
  };

  function csrf(options?: { cookie?: boolean | CookieOptions }): RequestHandler;
  export default csrf;
}
