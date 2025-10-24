# API Reference

VaultHub provides a comprehensive RESTful API with OpenAPI 3.0 specification. All API endpoints use JSON for data exchange and require proper authentication.

## OpenAPI Specification

The complete API specification is available in OpenAPI 3.0 format:

**Location:** [`packages/api/openapi/api.bundled.yaml`](https://github.com/lwshen/vault-hub/blob/main/packages/api/api.bundled.yaml)

## Authentication

VaultHub uses two types of authentication depending on the endpoint:

### JWT Authentication (Web/Dashboard)

Used for web interface and user management endpoints.

```bash
# Login to get JWT token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "your-password"}'

# Response
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com"
  }
}

# Use token in subsequent requests
curl -X GET http://localhost:3000/api/vaults \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### API Key Authentication (CLI/Programmatic)

Used for CLI and programmatic access to vaults.

```bash
# Create API key via web interface or API
# Then use it for CLI endpoints
curl -X GET http://localhost:3000/api/cli/vaults \
  -H "Authorization: Bearer vhub_your_api_key_here"
```

**Important:**
- JWT tokens are for `/api/*` endpoints (except `/api/cli/*`)
- API keys are for `/api/cli/*` endpoints only
- Mixing authentication types will result in errors

## Base URL

All API requests should be made to:
```
http://localhost:3000  # Development
https://your-server.com  # Production
```

## Status Endpoint

### GET /api/status

Get comprehensive system status (no authentication required).

**Response:**
```json
{
  "version": "v1.4.3",
  "commit": "abc1234",
  "systemStatus": "healthy",
  "databaseStatus": "healthy"
}
```

**Status Values:** `healthy`, `degraded`, `unavailable`

## Authentication Endpoints

### POST /api/auth/login

Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "your-password"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

### POST /api/auth/signup

Register a new user account.

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "secure-password"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid",
    "email": "newuser@example.com",
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

### POST /api/auth/magic-link/request

Request a magic link for passwordless authentication.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "If an account exists, a magic link has been sent"
}
```

**Rate Limiting:**
- 429 response if too many requests (3 per 15 minutes)
- `Retry-After` header indicates seconds until next allowed request

### GET /api/auth/magic-link/token

Consume magic link token (called automatically when user clicks email link).

**Query Parameters:**
- `token` (required): Magic link token from email

**Response (302):**
- Redirects to frontend with JWT token in URL fragment

### POST /api/auth/password/reset/request

Request a password reset email.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "If an account exists, a password reset link has been sent"
}
```

**Rate Limiting:**
- 429 response if too many requests (3 per 15 minutes)

### POST /api/auth/password/reset/confirm

Confirm password reset with token.

**Request:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "new-secure-password"
}
```

**Response (200):**
```json
{
  "message": "Password updated successfully"
}
```

## User Endpoints

### GET /api/user

Get current user information (requires JWT).

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response (200):**
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "createdAt": "2025-01-01T00:00:00Z"
}
```

## Vault Endpoints (JWT Authentication)

### GET /api/vaults

List all vaults for the authenticated user with pagination.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Query Parameters:**
- `pageSize` (optional): Number of items per page (default: 10)
- `pageIndex` (optional): Page number, 0-indexed (default: 0)

**Response (200):**
```json
{
  "items": [
    {
      "uniqueId": "vault-uuid",
      "name": "production-secrets",
      "value": "DATABASE_URL=postgres://...\nAPI_KEY=secret123",
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T12:00:00Z"
    }
  ],
  "totalCount": 42,
  "pageSize": 10,
  "pageIndex": 0
}
```

### POST /api/vaults

Create a new vault.

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request:**
```json
{
  "name": "production-secrets",
  "value": "DATABASE_URL=postgres://localhost/myapp\nAPI_KEY=secret123"
}
```

**Response (201):**
```json
{
  "uniqueId": "vault-uuid",
  "name": "production-secrets",
  "value": "DATABASE_URL=postgres://localhost/myapp\nAPI_KEY=secret123",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

### GET /api/vaults/{uniqueId}

Get a specific vault by ID.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response (200):**
```json
{
  "uniqueId": "vault-uuid",
  "name": "production-secrets",
  "value": "DATABASE_URL=postgres://localhost/myapp\nAPI_KEY=secret123",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T12:00:00Z"
}
```

### PUT /api/vaults/{uniqueId}

Update a vault's name or value.

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request:**
```json
{
  "name": "production-secrets-updated",
  "value": "DATABASE_URL=postgres://localhost/myapp\nAPI_KEY=newsecret456"
}
```

**Response (200):**
```json
{
  "uniqueId": "vault-uuid",
  "name": "production-secrets-updated",
  "value": "DATABASE_URL=postgres://localhost/myapp\nAPI_KEY=newsecret456",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T13:00:00Z"
}
```

### DELETE /api/vaults/{uniqueId}

Delete a vault.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response (204):**
No content

## CLI Vault Endpoints (API Key Authentication)

These endpoints are designed for CLI and programmatic access using API keys.

### GET /api/cli/vaults

List accessible vaults (returns VaultLite format without decrypted values).

**Headers:**
```
Authorization: Bearer vhub_your_api_key_here
```

**Response (200):**
```json
[
  {
    "uniqueId": "vault-uuid",
    "name": "production-secrets",
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T12:00:00Z"
  }
]
```

**Note:** This endpoint returns VaultLite objects without the `value` field for security and performance.

### GET /api/cli/vault/{uniqueId}

Get a specific vault by unique ID with decrypted value.

**Headers:**
```
Authorization: Bearer vhub_your_api_key_here
X-Enable-Client-Encryption: true  # Optional, enables additional encryption layer
```

**Response (200):**
```json
{
  "uniqueId": "vault-uuid",
  "name": "production-secrets",
  "value": "DATABASE_URL=postgres://localhost/myapp\nAPI_KEY=secret123",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T12:00:00Z"
}
```

**Client-Side Encryption:**
When `X-Enable-Client-Encryption: true` header is sent:
- Server applies additional encryption layer to the value
- Encryption key derived using PBKDF2 from API key + vault unique ID
- Client must decrypt using the same derivation
- Provides defense-in-depth security

### GET /api/cli/vault/name/{name}

Get a specific vault by name with decrypted value.

**Headers:**
```
Authorization: Bearer vhub_your_api_key_here
X-Enable-Client-Encryption: true  # Optional
```

**Path Parameters:**
- `name`: Vault name (URL-encoded if contains special characters)

**Response (200):**
```json
{
  "uniqueId": "vault-uuid",
  "name": "production-secrets",
  "value": "DATABASE_URL=postgres://localhost/myapp\nAPI_KEY=secret123",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T12:00:00Z"
}
```

## API Key Management Endpoints

### GET /api/api-keys

List all API keys for the authenticated user.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Query Parameters:**
- `pageSize` (optional): Number of items per page (default: 10)
- `pageIndex` (optional): Page number, 0-indexed (default: 0)

**Response (200):**
```json
{
  "items": [
    {
      "id": "key-uuid",
      "name": "Production CLI Key",
      "keyPrefix": "vhub_abc...",
      "vaultAccess": ["vault-uuid-1", "vault-uuid-2"],
      "createdAt": "2025-01-01T00:00:00Z",
      "lastUsedAt": "2025-01-15T10:30:00Z"
    }
  ],
  "totalCount": 5,
  "pageSize": 10,
  "pageIndex": 0
}
```

### POST /api/api-keys

Create a new API key.

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request:**
```json
{
  "name": "Production CLI Key",
  "vaultAccess": ["vault-uuid-1", "vault-uuid-2"]
}
```

**Response (201):**
```json
{
  "id": "key-uuid",
  "name": "Production CLI Key",
  "key": "vhub_full_key_shown_only_once",
  "keyPrefix": "vhub_abc...",
  "vaultAccess": ["vault-uuid-1", "vault-uuid-2"],
  "createdAt": "2025-01-01T00:00:00Z"
}
```

**Important:** The full API key is shown only once during creation. Store it securely.

### DELETE /api/api-keys/{id}

Delete an API key.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response (204):**
No content

## Audit Log Endpoints

### GET /api/audit-logs

Get audit logs with filtering and pagination.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Query Parameters:**
- `pageSize` (optional): Number of items per page (default: 10)
- `pageIndex` (optional): Page number, 0-indexed (default: 0)
- `action` (optional): Filter by action type
- `startDate` (optional): Filter by start date (ISO 8601)
- `endDate` (optional): Filter by end date (ISO 8601)

**Response (200):**
```json
{
  "items": [
    {
      "id": "log-uuid",
      "userId": "user-uuid",
      "action": "vault.read",
      "resource": "vault-uuid",
      "ipAddress": "192.168.1.100",
      "userAgent": "vault-hub-cli/1.4.3",
      "timestamp": "2025-01-15T10:30:00Z",
      "metadata": {
        "vaultName": "production-secrets",
        "accessMethod": "api-key"
      }
    }
  ],
  "totalCount": 234,
  "pageSize": 10,
  "pageIndex": 0
}
```

### GET /api/audit-logs/metrics

Get audit log metrics and statistics.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response (200):**
```json
{
  "totalLogs": 1234,
  "actionCounts": {
    "vault.read": 856,
    "vault.create": 123,
    "vault.update": 234,
    "vault.delete": 21
  },
  "recentActivity": [
    {
      "date": "2025-01-15",
      "count": 45
    }
  ]
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Invalid request parameters",
  "details": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required",
  "message": "Invalid or missing authentication token"
}
```

### 403 Forbidden
```json
{
  "error": "Access denied",
  "message": "You don't have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found",
  "message": "The requested resource does not exist"
}
```

### 429 Too Many Requests
```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again later."
}
```

**Headers:**
```
Retry-After: 900  # Seconds until next request allowed
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

## Rate Limiting

Certain endpoints have rate limiting to prevent abuse:

| Endpoint | Limit | Window | Status Code |
|----------|-------|--------|-------------|
| Magic Link Request | 3 requests | 15 minutes | 429 |
| Password Reset Request | 3 requests | 15 minutes | 429 |

When rate limited, the response includes a `Retry-After` header indicating seconds until the next request is allowed.

## Pagination

List endpoints support pagination with the following parameters:

- **pageSize**: Number of items per page (default: 10, max: 100)
- **pageIndex**: Zero-based page number (default: 0)

**Response includes:**
- `items`: Array of results
- `totalCount`: Total number of items
- `pageSize`: Items per page
- `pageIndex`: Current page number

**Example:**
```bash
# Get page 2 with 20 items per page
curl -X GET "http://localhost:3000/api/vaults?pageSize=20&pageIndex=1" \
  -H "Authorization: Bearer {jwt_token}"
```

## Code Examples

### Python

```python
import requests

# Login
response = requests.post(
    "http://localhost:3000/api/auth/login",
    json={"email": "user@example.com", "password": "password"}
)
token = response.json()["token"]

# Get vaults
response = requests.get(
    "http://localhost:3000/api/vaults",
    headers={"Authorization": f"Bearer {token}"}
)
vaults = response.json()["items"]

# CLI: Get vault with API key
response = requests.get(
    "http://localhost:3000/api/cli/vault/name/production-secrets",
    headers={
        "Authorization": "Bearer vhub_your_api_key_here",
        "X-Enable-Client-Encryption": "true"
    }
)
vault = response.json()
```

### JavaScript/TypeScript

```javascript
// Login
const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password'
  })
});
const { token } = await loginResponse.json();

// Get vaults
const vaultsResponse = await fetch('http://localhost:3000/api/vaults', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { items: vaults } = await vaultsResponse.json();

// CLI: Get vault with API key
const vaultResponse = await fetch(
  'http://localhost:3000/api/cli/vault/name/production-secrets',
  {
    headers: {
      'Authorization': 'Bearer vhub_your_api_key_here',
      'X-Enable-Client-Encryption': 'true'
    }
  }
);
const vault = await vaultResponse.json();
```

### Go

```go
package main

import (
    "bytes"
    "encoding/json"
    "net/http"
)

// Login
type LoginRequest struct {
    Email    string `json:"email"`
    Password string `json:"password"`
}

loginBody, _ := json.Marshal(LoginRequest{
    Email:    "user@example.com",
    Password: "password",
})

resp, _ := http.Post(
    "http://localhost:3000/api/auth/login",
    "application/json",
    bytes.NewBuffer(loginBody),
)

var loginResp struct {
    Token string `json:"token"`
}
json.NewDecoder(resp.Body).Decode(&loginResp)

// Get vaults
req, _ := http.NewRequest("GET", "http://localhost:3000/api/vaults", nil)
req.Header.Set("Authorization", "Bearer "+loginResp.Token)

client := &http.Client{}
vaultsResp, _ := client.Do(req)
```

## Client Libraries

Official client libraries are available:

- **TypeScript/JavaScript**: `@lwshen/vault-hub-ts-fetch-client` (npm)
- **Go**: `github.com/lwshen/vault-hub-go-client`

These libraries provide type-safe access to all API endpoints with automatic authentication handling.
