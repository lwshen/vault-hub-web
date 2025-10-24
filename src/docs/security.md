# Security

VaultHub implements multiple layers of security to protect your sensitive data.

## Encryption

### AES-256-GCM Encryption

All vault values are encrypted using AES-256-GCM before being stored in the database. This provides both confidentiality and authenticity.

**Key Features:**
- 256-bit encryption key
- Galois/Counter Mode (GCM)
- Authenticated encryption
- Unique IV per encryption

**Security Benefits:**
- Data confidentiality
- Data integrity
- Authentication
- Resistance to tampering

> **⚠️ Important**  
> Keep your `ENCRYPTION_KEY` secure and backed up.  
> Without it, encrypted vault data cannot be recovered.

### Encryption Process

1. **Key Generation**: Use a cryptographically secure random key
   ```bash
   # Generate a secure encryption key
   openssl rand -base64 32
   ```

2. **Data Encryption**: Each vault value is encrypted individually
   - Unique initialization vector (IV) per encryption
   - AEAD (Authenticated Encryption with Associated Data)
   - Integrity verification through authentication tags

3. **Storage**: Only encrypted data is stored in the database
   - Original plaintext is never persisted
   - Encryption keys are never stored with data

### Client-Side Encryption (CLI/API)

In addition to server-side AES-256-GCM encryption, VaultHub supports **optional client-side encryption** for CLI and programmatic access, providing defense-in-depth security.

**How It Works:**

1. **Server-Side Layer** (always active):
   - All vault values encrypted with AES-256-GCM
   - Encryption key from `ENCRYPTION_KEY` environment variable
   - Stored encrypted in database

2. **Client-Side Layer** (optional, enabled by default in CLI):
   - Additional encryption applied before transmission
   - Key derived using PBKDF2 from: API key + vault unique ID (as salt)
   - Each vault gets unique client-side encryption key
   - No key exchange required - deterministic derivation

**Security Benefits:**

- **Defense in Depth**: Two independent encryption layers
- **Per-Vault Keys**: Each vault has unique client-side encryption key
- **Network Protection**: Even if HTTPS fails, data remains encrypted
- **API Key Derivation**: Client-side keys derived from API keys
- **Zero Trust**: Server never sees plaintext with client-side encryption

**Usage:**

```bash
# CLI enables client-side encryption by default
vault-hub get --name production-secrets

# Server applies both encryptions:
# 1. Server-side AES-256-GCM (always)
# 2. Client-side encryption (if header present)

# Disable client-side encryption if needed
vault-hub get --name production-secrets --no-client-encryption
```

**API Header:**

```bash
# Enable client-side encryption via API
curl -X GET http://localhost:3000/api/cli/vault/name/production-secrets \
  -H "Authorization: Bearer vhub_your_api_key_here" \
  -H "X-Enable-Client-Encryption: true"
```

**When to Use:**

- **Maximum Security**: Enable for production environments
- **Untrusted Networks**: Protection even if TLS is compromised
- **Compliance**: Additional layer for regulatory requirements
- **Defense in Depth**: Multiple independent security controls

**When to Disable:**

- **Debugging**: Easier to inspect server responses
- **Custom Clients**: If implementing own decryption
- **Performance**: Slight overhead from additional encryption layer (minimal)

**Key Derivation Details:**

```
Client Key = PBKDF2(
  password: API Key,
  salt: Vault Unique ID,
  iterations: 10000,
  keyLength: 32 bytes
)
```

This ensures:
- Same API key + same vault = same derived key (deterministic)
- Different vaults = different keys (even with same API key)
- No key storage or transmission needed
- Computationally expensive to brute force

## Access Control

### Authentication Methods

VaultHub supports multiple authentication mechanisms for different use cases:

#### Email/Password Authentication

Traditional authentication with email and password.

- **Registration**: Users create accounts with email and password
- **Password Hashing**: Bcrypt with salt for password storage
- **Session Management**: JWT tokens with configurable expiration
- **Security**: Passwords never stored in plaintext

#### Magic Link Authentication (Passwordless)

Secure, passwordless authentication via email.

**How It Works:**
1. User enters email address
2. Server generates one-time token
3. Email sent with magic link
4. User clicks link to authenticate
5. JWT token returned for session

**Security Features:**
- **One-time tokens**: Single use only, expire after use
- **Time-limited**: Tokens expire after configured period
- **Rate limiting**: Maximum 3 requests per 15 minutes per email
- **Email verification**: Confirms user has access to email account

**Benefits:**
- No password to remember or compromise
- Mobile-friendly authentication
- Reduces password fatigue
- Eliminates password-related attacks (brute force, credential stuffing)

#### Password Reset

Secure password reset via email verification.

**Security Features:**
- **One-time tokens**: Single use, expire after configured period
- **Rate limiting**: 3 requests per 15 minutes per email
- **Token invalidation**: Previous tokens invalidated on password change
- **Email confirmation**: Only sent if account exists (privacy)

#### OpenID Connect (OIDC)

Enterprise authentication integration.

- **Single Sign-On (SSO)**: Integration with corporate identity providers
- **Supported Providers**: Auth0, Okta, Azure AD, Google, and others
- **Standard Protocol**: OpenID Connect 1.0 compliant
- **User Provisioning**: Automatic account creation on first login

#### API Key Authentication

Programmatic access for CLI and integrations.

- **Long-lived Credentials**: No expiration unless revoked
- **Vault Scoping**: Keys can be scoped to specific vaults
- **Prefix System**: `vhub_` prefix for easy identification
- **Revocable**: Keys can be deleted to immediately revoke access
- **Audit Trail**: All API key usage logged
- **Client-Side Encryption**: Supports optional encryption layer (see Encryption section)

### Route Protection

**Public Routes:**
- Login, registration, static assets

**JWT Protected:**
- Web interface, user management

**API Key Protected:**  
- CLI endpoints, vault access

### Permission Model

- **User-based access**: Each user has access to their own vaults
- **API key scoping**: API keys can be scoped to specific vaults
- **Fine-grained permissions**: Read/write access control
- **Session management**: Secure session handling with expiration

## Security Best Practices

### Rate Limiting

VaultHub implements rate limiting to prevent abuse and protect against attacks:

**Email-Based Authentication:**
- Magic link requests: 3 per 15 minutes per email
- Password reset requests: 3 per 15 minutes per email
- Returns HTTP 429 with `Retry-After` header when exceeded

**Purpose:**
- **Prevent Abuse**: Limits email flooding and spam
- **Resource Protection**: Reduces email service costs
- **Attack Mitigation**: Slows down enumeration attacks
- **Privacy**: Rate limits apply even for non-existent accounts

**Implementation:**
```bash
# Rate limit response
HTTP/1.1 429 Too Many Requests
Retry-After: 900

{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again later."
}
```

### Key Management

```bash
# Generate secure keys
JWT_SECRET=$(openssl rand -base64 64)
ENCRYPTION_KEY=$(openssl rand -base64 32)

# Store securely (example with AWS Secrets Manager)
aws secretsmanager create-secret \
  --name "vaulthub/encryption-key" \
  --secret-string "$ENCRYPTION_KEY"
```

### Environment Variables

Never expose sensitive configuration:

```bash
# ❌ Don't do this
export ENCRYPTION_KEY=my-simple-key

# ✅ Use secure random keys
export ENCRYPTION_KEY=$(openssl rand -base64 32)

# ✅ Use external secret management
export ENCRYPTION_KEY=$(aws secretsmanager get-secret-value \
  --secret-id "vaulthub/encryption-key" \
  --query SecretString --output text)
```

### Database Security

- **Encrypted connections**: Use TLS for database connections
- **Access control**: Limit database access to VaultHub service
- **Regular backups**: Encrypted backup strategy
- **Monitoring**: Database access logging

### Network Security

```nginx
# Use HTTPS in production
server {
    listen 443 ssl http2;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

## Audit Logs

VaultHub maintains comprehensive audit logs of all operations for security monitoring and compliance.

### Logged Events

**Vault Operations:**
- Vault creation and deletion
- Vault value updates  
- Vault access (read operations)
- Permission changes

**Authentication Events:**
- User login and logout
- API key creation and usage
- Failed authentication attempts
- Session management

**System Events:**
- Configuration changes
- System startup/shutdown
- Error conditions

### Audit Log Format

```json
{
  "timestamp": "2025-01-01T12:00:00Z",
  "userId": "user-uuid",
  "action": "vault.read",
  "resource": "vault-uuid",
  "ipAddress": "192.168.1.100",
  "userAgent": "vault-hub-cli/1.2.9",
  "result": "success",
  "metadata": {
    "vaultName": "production-secrets",
    "accessMethod": "api-key"
  }
}
```

### Audit Log Query

Access audit logs through the web interface or API:

```http
GET /api/audit-logs
Authorization: Bearer jwt_token_here

Query Parameters:
- action: Filter by action type
- userId: Filter by user
- startDate: Start date filter
- endDate: End date filter
- limit: Result limit
- offset: Pagination offset
```

## Compliance

### Standards Compliance

VaultHub is designed to help organizations meet security and compliance requirements:

- **SOC 2 Type II**: Security, availability, and confidentiality
- **GDPR**: Data protection and privacy
- **HIPAA**: Healthcare data protection (when properly configured)
- **ISO 27001**: Information security management

### Data Protection

- **Data minimization**: Only necessary data is collected
- **Right to deletion**: Complete data removal capability
- **Data portability**: Export functionality
- **Breach notification**: Audit trail for incident response

### Security Controls

| Control | Implementation |
|---------|----------------|
| Encryption at Rest | AES-256-GCM for all vault data (server-side, always active) |
| Client-Side Encryption | Optional PBKDF2-derived per-vault encryption (CLI/API) |
| Encryption in Transit | TLS 1.3 for all connections |
| Authentication | Email/password, magic links, password reset, OIDC, API keys |
| Multi-Factor | Support via OIDC providers |
| Authorization | Role-based access control with vault scoping |
| Rate Limiting | 3 requests per 15 minutes for email-based auth |
| Audit Logging | Complete operation trail with IP and user agent tracking |
| Session Management | JWT tokens with expiration, API keys with revocation |
| Backup & Recovery | Encrypted backup procedures with key backup |
| Incident Response | Monitoring, alerting, and comprehensive audit logs |

## Security Reporting

### Vulnerability Disclosure

If you discover a security vulnerability in VaultHub:

1. **Do not** disclose the vulnerability publicly
2. Email security details to the maintainers
3. Include steps to reproduce the issue
4. Allow reasonable time for response and fix

### Security Updates

- Subscribe to release notifications for security updates
- Monitor the [GitHub repository](https://github.com/lwshen/vault-hub) for security advisories
- Test security updates in staging environments before production deployment

### Security Monitoring

Implement monitoring for:

```bash
# Failed authentication attempts
grep "authentication failed" /var/log/vaulthub.log

# Unusual access patterns
grep "vault.read" /var/log/vaulthub.log | awk '{print $4}' | sort | uniq -c

# API key usage
grep "api-key" /var/log/vaulthub.log | grep -v "success"
```