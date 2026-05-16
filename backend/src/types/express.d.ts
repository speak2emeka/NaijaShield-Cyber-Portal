import { UserRole } from '@prisma/client';

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: UserRole;
      name: string;
      clientCompanyId?: string | null;
    }

    interface Request {
      user?: User;
      correlationId?: string;
    }
  }
}

export {};
