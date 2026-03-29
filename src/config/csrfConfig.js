import { doubleCsrf } from 'csrf-csrf';

const doubleCsrfOptions = {
  getSecret: () => process.env.SECRET || 'csrf-secret',
  getSessionIdentifier: (req) => req.ip ?? '',
  cookieName: 'x-csrf-token',
  cookieOptions: {
    httpOnly: false,
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  },
  getCsrfTokenFromRequest: (req) => {
    if (process.env.NODE_ENV !== 'production') {
      return req.headers['x-csrf-token'] || req.cookies['x-csrf-token'];
    }
    return req.headers['x-csrf-token'];
  },
  ignoredMethods: [],
};

const { generateCsrfToken, doubleCsrfProtection } = doubleCsrf(doubleCsrfOptions);

export { doubleCsrfProtection, generateCsrfToken };
