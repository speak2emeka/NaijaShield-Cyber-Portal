export type Role = 'CLIENT' | 'STAFF' | 'ANALYST' | 'ADMIN' | 'SUPERADMIN';

export type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
  clientCompanyId?: string | null;
};

export type Ticket = {
  id: string;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  createdAt: string;
  updatedAt: string;
};

export type Report = {
  id: string;
  title: string;
  description: string;
  filePath: string;
  createdAt: string;
};

export type ServiceRequest = {
  id: string;
  type: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};
