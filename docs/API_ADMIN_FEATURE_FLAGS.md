# NaijaShield Admin Feature Flag Management API

## Overview

The Admin Feature Flag Management API enables administrators to manage feature availability for tenants (client companies) in the NaijaShield platform. This system implements three-tier feature gating:

1. **Plan-Level Features** - Determined by subscription tier (shield-start, shield-ops, shield-enterprise)
2. **Legacy Feature Flags** - Global toggles managed by NaijaShield operations
3. **Tenant Overrides** - Client-specific feature enablement/disablement

## Authentication

All endpoints require:
- Bearer token in `Authorization` header
- Admin, SUPERADMIN, STAFF, or ANALYST role
- Valid JWT token from authentication service

```
Authorization: Bearer eyJhbGc...
```

## Endpoints

### 1. List All Feature Flags

**GET** `/api/admin/feature-flags`

Returns all feature flags in the system with their configuration.

#### Response
```json
{
  "success": true,
  "data": {
    "flags": [
      {
        "id": "uuid",
        "code": "SECURITY_POSTURE",
        "name": "Security Posture",
        "description": "Real-time security assessment and scoring",
        "enabled": true,
        "createdAt": "2026-05-15T00:00:00Z",
        "updatedAt": "2026-05-15T00:00:00Z"
      },
      {
        "id": "uuid",
        "code": "SECURITY_EVENTS",
        "name": "Security Events",
        "description": "Event monitoring and alerting system",
        "enabled": true,
        "createdAt": "2026-05-16T00:00:00Z",
        "updatedAt": "2026-05-16T00:00:00Z"
      }
    ]
  }
}
```

#### Status Codes
- `200 OK` - Successfully retrieved feature flags
- `401 Unauthorized` - Invalid or missing authentication
- `403 Forbidden` - User lacks admin permissions

---

### 2. List Client Feature Flags

**GET** `/api/admin/clients/{clientCompanyId}/feature-flags`

Returns all feature flags and their override status for a specific client company.

#### Path Parameters
- `clientCompanyId` (required, uuid) - The ID of the client company

#### Response
```json
{
  "success": true,
  "data": {
    "clientCompanyId": "uuid",
    "flags": [
      {
        "id": "uuid",
        "featureFlag": {
          "id": "uuid",
          "code": "SECURITY_EVENTS",
          "name": "Security Events",
          "description": "Event monitoring and alerting system"
        },
        "enabled": true,
        "overrideReason": "Early access program",
        "createdAt": "2026-05-16T00:00:00Z",
        "updatedAt": "2026-05-16T12:00:00Z"
      }
    ]
  }
}
```

#### Status Codes
- `200 OK` - Successfully retrieved client flags
- `400 Bad Request` - Invalid clientCompanyId format
- `404 Not Found` - Client company not found
- `401 Unauthorized` - Invalid authentication
- `403 Forbidden` - Insufficient permissions

---

### 3. Set Client Feature Flag

**PATCH** `/api/admin/clients/{clientCompanyId}/feature-flags/{featureFlagId}`

Enables or disables a specific feature for a client company.

#### Path Parameters
- `clientCompanyId` (required, uuid) - The ID of the client company
- `featureFlagId` (required, uuid) - The ID of the feature flag

#### Request Body
```json
{
  "enabled": true,
  "overrideReason": "Early access program - Q2 2026"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "clientCompanyId": "uuid",
    "featureFlagId": "uuid",
    "enabled": true,
    "overrideReason": "Early access program - Q2 2026",
    "createdAt": "2026-05-16T00:00:00Z",
    "updatedAt": "2026-05-16T12:00:00Z",
    "message": "Feature flag updated successfully"
  }
}
```

#### Status Codes
- `200 OK` - Feature flag successfully updated
- `400 Bad Request` - Invalid request body or parameters
- `404 Not Found` - Client company or feature flag not found
- `401 Unauthorized` - Invalid authentication
- `403 Forbidden` - Insufficient permissions

---

### 4. Set Client Product Plan

**PATCH** `/api/admin/clients/{clientCompanyId}/product-plan`

Changes the product plan/subscription tier for a client company.

#### Path Parameters
- `clientCompanyId` (required, uuid) - The ID of the client company

#### Request Body
```json
{
  "planSlug": "shield-ops"
}
```

#### Valid Plan Slugs
- `shield-start` - Basic tier: ₦120,000/month
- `shield-ops` - Operations tier: ₦350,000/month (includes events, attack-lab, OSINT)
- `shield-enterprise` - Enterprise tier: ₦900,000/month (all features + compliance)

#### Response
```json
{
  "success": true,
  "data": {
    "clientCompanyId": "uuid",
    "planSlug": "shield-ops",
    "planName": "ShieldOps",
    "updatedAt": "2026-05-16T12:00:00Z",
    "message": "Client product plan updated successfully"
  }
}
```

#### Status Codes
- `200 OK` - Plan successfully updated
- `400 Bad Request` - Invalid plan slug or request body
- `404 Not Found` - Client company not found
- `401 Unauthorized` - Invalid authentication
- `403 Forbidden` - Insufficient permissions

---

## Feature Code Reference

### Tier 1: ShieldStart (₦120k/mo)
- `SECURITY_POSTURE` - Real-time security assessment

### Tier 2: ShieldOps (₦350k/mo) - Includes all Tier 1 features
- `SECURITY_EVENTS` - Event monitoring and alerting
- `ATTACK_LAB` - Security awareness training
- `EXTERNAL_SECURITY` - OSINT and threat intelligence (includes OSINT, Threat Intel, Cloud, Phishing, Email Security)

### Tier 3: ShieldEnterprise (₦900k/mo) - Includes all Tier 2 features
- `COMPLIANCE_MANAGEMENT` - Compliance tracking and reporting

---

## Feature Flag Evaluation Logic

The platform evaluates feature availability using the following precedence:

```
1. Tenant Override (ClientFeatureFlag.enabled)
   ↓ (if no override exists)
2. Legacy Global Flag (FeatureFlag.enabled)
   ↓ (if no legacy flag exists)
3. Plan Feature Inclusion (PlanFeature.featureId in Plan.planFeatures)
```

**Example Evaluation Chain:**
```typescript
const enabled = tenantFlagEnabled ?? legacyFlagEnabled ?? planFeatureIncluded;
```

---

## Tier-Based Route Protection

Premium routes are protected by plan tier. Clients attempt access in this order:

1. **No Plan Assigned** → 403 Forbidden: "No active subscription"
2. **Wrong Plan Tier** → 403 Forbidden: "Feature not available for your plan"
3. **Correct Plan Tier** → Proceed to endpoint

### Protected Endpoints by Tier

**ShieldOps+ Required:**
- GET/POST `/client/security/events/*` - Security event management
- GET/POST `/client/security/assets/*` - Asset discovery and tracking
- GET/POST `/client/security-platform/attack-lab/*` - Security awareness drills
- GET/POST `/client/security/osint/*` - OSINT scanning
- GET/POST `/client/security/threat-intel/*` - Threat intelligence
- GET/POST `/client/security/cloud/*` - Cloud asset management
- GET/POST `/client/security/phishing/*` - Phishing campaign management
- GET/POST `/client/security/email/*` - Email security monitoring

**ShieldEnterprise+ Required:**
- GET/POST `/client/compliance/*` - Compliance management

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional context"
    }
  }
}
```

### Common Error Codes
- `INVALID_UUID` - malformed UUID in path
- `NOT_FOUND` - Resource not found
- `UNAUTHORIZED` - Missing/invalid authentication
- `FORBIDDEN` - Insufficient permissions
- `VALIDATION_ERROR` - Invalid request body
- `PLAN_NOT_FOUND` - Plan slug does not exist
- `CLIENT_NOT_FOUND` - Client company not found
- `FEATURE_FLAG_NOT_FOUND` - Feature flag not found

---

## Examples

### Example 1: Enable Attack Lab for Early Access Client

```bash
curl -X PATCH \
  'http://localhost:5000/api/admin/clients/abc123/feature-flags/attack-lab-uuid' \
  -H 'Authorization: Bearer token' \
  -H 'Content-Type: application/json' \
  -d '{
    "enabled": true,
    "overrideReason": "Early access - Product launch partner"
  }'
```

### Example 2: Upgrade Client to ShieldOps

```bash
curl -X PATCH \
  'http://localhost:5000/api/admin/clients/abc123/product-plan' \
  -H 'Authorization: Bearer token' \
  -H 'Content-Type: application/json' \
  -d '{
    "planSlug": "shield-ops"
  }'
```

### Example 3: List All Feature Flags

```bash
curl -X GET \
  'http://localhost:5000/api/admin/feature-flags' \
  -H 'Authorization: Bearer token'
```

---

## Integration with Feature Service

The backend uses the feature service to evaluate feature availability:

```typescript
const enabled = await featureService.isFeatureEnabledForClient(
  clientCompanyId,
  'SECURITY_EVENTS'
);
```

This checks all three evaluation sources and returns the final feature status.

---

## Rate Limiting

Admin endpoints are rate limited to:
- 100 requests per 15 minutes per admin user
- 10,000 requests per hour per admin IP

Exceeding limits returns:
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "retryAfter": 60
  }
}
```

---

## Audit Logging

All feature flag changes are audited:
- User ID performing the change
- Client affected
- Feature flag ID
- Old/new values
- Timestamp
- Change reason (if provided)

View audit logs at: `GET /api/admin/audit-logs?resource=ClientFeatureFlag`

---

## SDK Integration

### TypeScript/JavaScript SDK Usage

```typescript
import { api } from '@naijashield/sdk';

// Check if feature is enabled
const enabled = await api.admin.isFeatureEnabled(
  clientCompanyId,
  'SECURITY_EVENTS'
);

// Update feature for client
await api.admin.setClientFeatureFlag(
  clientCompanyId,
  featureFlagId,
  { enabled: true }
);

// List available features
const features = await api.admin.listFeatureFlags();
```

---

## Support

For API questions or issues:
- Email: api-support@naijashield.ng
- Slack: #naijashield-api
- Docs: https://docs.naijashield.ng/api
