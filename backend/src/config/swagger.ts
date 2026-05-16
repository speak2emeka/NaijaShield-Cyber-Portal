export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'NaijaShield Cyber Portal API',
    version: '1.0.0',
    description: 'Secure API for NaijaShield public site, client portal, and admin portal.'
  },
  servers: [{ url: '/api' }],
  tags: [
    { name: 'Auth' },
    { name: 'Public' },
    { name: 'Client' },
    { name: 'Admin' }
  ],
  paths: {
    '/auth/register': { post: { tags: ['Auth'], summary: 'Register a client user and company' } },
    '/auth/login': { post: { tags: ['Auth'], summary: 'Login and receive an access token plus refresh cookie' } },
    '/auth/refresh': { post: { tags: ['Auth'], summary: 'Rotate refresh token and issue a new access token' } },
    '/auth/logout': { post: { tags: ['Auth'], summary: 'Revoke refresh token' } },
    '/auth/me': { get: { tags: ['Auth'], summary: 'Return current authenticated user' } },
    '/public/contact': { post: { tags: ['Public'], summary: 'Submit a public contact message' } },
    '/public/blog': { get: { tags: ['Public'], summary: 'List public blog posts' } },
    '/public/pricing': { get: { tags: ['Public'], summary: 'List product pricing plans' } },
    '/client/dashboard': { get: { tags: ['Client'], summary: 'Client dashboard overview' } },
    '/client/reports': { get: { tags: ['Client'], summary: 'List client reports' } },
    '/client/reports/{id}': { get: { tags: ['Client'], summary: 'Get report detail' } },
    '/client/tickets': { get: { tags: ['Client'], summary: 'List tickets' }, post: { tags: ['Client'], summary: 'Create ticket' } },
    '/client/tickets/{id}': { patch: { tags: ['Client'], summary: 'Client comment or close ticket' } },
    '/client/requests': { get: { tags: ['Client'], summary: 'List service requests' }, post: { tags: ['Client'], summary: 'Create service request' } },
    '/client/security-score/history': { get: { tags: ['Client'], summary: 'Security score history' } },
    '/client/subscription': { get: { tags: ['Client'], summary: 'Current subscription' } },
    '/admin/dashboard': { get: { tags: ['Admin'], summary: 'Admin dashboard metrics' } },
    '/admin/clients': { get: { tags: ['Admin'], summary: 'List clients' } },
    '/admin/clients/{id}': { get: { tags: ['Admin'], summary: 'Client profile' } },
    '/admin/clients/{id}/reports': { get: { tags: ['Admin'], summary: 'Client reports' }, post: { tags: ['Admin'], summary: 'Upload PDF report' } },
    '/admin/tickets': { get: { tags: ['Admin'], summary: 'List all tickets' } },
    '/admin/tickets/{id}': { patch: { tags: ['Admin'], summary: 'Update ticket' } },
    '/admin/requests': { get: { tags: ['Admin'], summary: 'List service requests' } },
    '/admin/requests/{id}': { patch: { tags: ['Admin'], summary: 'Update service request' } },
    '/admin/audit-logs': { get: { tags: ['Admin'], summary: 'View audit logs' } }
  }
};
