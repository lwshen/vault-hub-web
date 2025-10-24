# CLI Guide

The VaultHub CLI is the primary way to interact with VaultHub. It provides secure, programmatic access to your vaults and is perfect for development workflows, CI/CD pipelines, and automation. Start here to quickly access your secrets without needing to set up a server.

## CLI Installation

### Download Pre-built Binaries

Download the latest CLI binary for your platform from the [GitHub releases page](https://github.com/lwshen/vault-hub/releases/latest).

**Latest Release**

Download the latest version of VaultHub CLI from our GitHub releases page:

[👉 Download Latest Release](https://github.com/lwshen/vault-hub/releases/latest)

**Supported Platforms:**
- **Linux** - amd64, arm64
- **Windows** - amd64  
- **macOS** - amd64, arm64

### Build from Source

```bash
# Clone the repository
git clone https://github.com/lwshen/vault-hub.git
cd vault-hub

# Build the CLI
go build -o vault-hub-cli ./apps/cli/main.go

# Make it executable and move to PATH (Linux/macOS)
chmod +x vault-hub-cli
sudo mv vault-hub-cli /usr/local/bin/vault-hub
```

## Authentication

The CLI uses API keys for authentication. First, create an API key in the web interface:

1. Log into the VaultHub web interface
2. Navigate to Dashboard → API Keys
3. Click "Create API Key" and give it a name
4. Copy the generated API key (starts with `vhub_`)

### Setting Up Authentication

You can configure the CLI using environment variables or command-line flags:

| Variable | Flag Equivalent | Required | Description |
|----------|-----------------|----------|-------------|
| `VAULT_HUB_API_KEY` | `--api-key` | Yes | API key for authentication (starts with `vhub_`) |
| `VAULT_HUB_BASE_URL` | `--base-url` | No | VaultHub server URL (default: `http://localhost:3000`) |
| `VAULT_HUB_DEBUG` or `DEBUG` | `--debug` | No | Enable debug logging (default: `false`) |

```bash
# Set environment variables (recommended)
export VAULT_HUB_API_KEY=vhub_your_api_key_here
export VAULT_HUB_BASE_URL=https://your-vaulthub-server.com
export VAULT_HUB_DEBUG=true

# Or pass flags directly to commands
vault-hub --api-key vhub_your_api_key_here --base-url https://your-server.com list
```

## Client-Side Encryption

VaultHub CLI provides **dual-layer encryption** for maximum security. In addition to server-side AES-256-GCM encryption, the CLI enables **client-side encryption by default** when retrieving vault values.

### How It Works

**Default Behavior (Enabled):**
1. Server encrypts vault values with AES-256-GCM (always active)
2. When you retrieve a vault, the server applies an additional encryption layer
3. Encryption key is derived using PBKDF2 from: API key + vault unique ID (as salt)
4. Your CLI automatically decrypts the value using the same derivation
5. Each vault gets a unique encryption key - even with the same API key

**Security Benefits:**
- **Defense in depth**: Two independent encryption layers
- **Per-vault keys**: Each vault has a unique client-side encryption key
- **No key exchange**: Keys derived deterministically, nothing transmitted over network
- **API key protection**: Even if network traffic is intercepted, vault values remain encrypted

### Usage

```bash
# Client-side encryption is ENABLED by default
vault-hub get --name production-secrets

# Disable client-side encryption if needed (server-side encryption still active)
vault-hub get --name production-secrets --no-client-encryption
```

### When to Disable Client-Side Encryption

You might want to use `--no-client-encryption` when:
- Debugging API responses to see server-encrypted format
- Using custom integrations that handle decryption separately
- Testing server-side encryption independently

**Note:** Server-side AES-256-GCM encryption is always active and cannot be disabled. The `--no-client-encryption` flag only disables the additional client-side encryption layer.

## Commands

### List Vaults

```bash
# List all accessible vaults
vault-hub list

# Short form
vault-hub ls

# Output in JSON format for scripting
vault-hub list --json
vault-hub ls -j
```

### Get Vault Contents

```bash
# Get vault by name
vault-hub get --name production-secrets
vault-hub get -n production-secrets

# Get vault by ID
vault-hub get --id vault-uuid-here
vault-hub get -i vault-uuid-here

# Export to file (creates file with 0600 permissions for security)
vault-hub get --name production-secrets --output .env
vault-hub get -n production-secrets -o secrets.txt

# Execute command only if vault has been updated since last file write
vault-hub get --name production-secrets --output .env --exec "source .env && npm start"
vault-hub get -n production-secrets -o .env -e "docker build -t myapp ."

# The CLI intelligently detects updates by comparing:
# - Vault modification timestamp vs file modification time
# - Vault content vs existing file content
# Files are only updated and commands only executed when changes are detected

# Disable client-side encryption if needed (server-side encryption still active)
vault-hub get --name production-secrets --no-client-encryption
vault-hub get -n production-secrets --no-client-encryption -o .env
```

### Version Information

```bash
# Show version and build information
vault-hub version
```

## Example Workflows

### Development Workflow

```bash
# Get development secrets and start your app
vault-hub get --name dev-secrets --exec "npm run dev"

# Export secrets to .env file for local development
vault-hub get --name dev-secrets --output .env
```

### CI/CD Pipeline

```bash
# In your CI/CD pipeline
export VAULT_HUB_API_KEY=${{ secrets.VAULT_HUB_API_KEY }}
export VAULT_HUB_BASE_URL=https://vault.company.com
vault-hub get --name production-secrets --exec "docker build -t myapp ."

# GitHub Actions example
- name: Deploy with secrets
  env:
    VAULT_HUB_API_KEY: ${{ secrets.VAULT_HUB_API_KEY }}
    VAULT_HUB_BASE_URL: ${{ secrets.VAULT_HUB_BASE_URL }}
  run: |
    vault-hub get --name prod-env --output .env --exec "source .env && ./deploy.sh"
```

## Docker Usage

The VaultHub CLI is also available as a Docker image for containerized environments.

### Docker Environment Variables

In addition to the standard CLI environment variables, the Docker image supports:

| Variable | Default | Description |
|----------|---------|-------------|
| `VAULT_HUB_API_KEY` | - | API key for authentication (required) |
| `VAULT_HUB_BASE_URL` | `http://localhost:3000` | VaultHub server URL |
| `VAULT_HUB_DEBUG` | `false` | Enable debug logging |
| `VAULT_HUB_CLI_ARGS` | - | CLI arguments to pass to the command |
| `RUN_MODE` | `oneshot` | Run mode: `oneshot` or `cron` |
| `CRON_SCHEDULE` | `0 * * * *` | Cron schedule for scheduled execution (hourly by default) |

### One-shot Execution

```bash
# Run CLI in Docker container
docker run --rm \
  -e VAULT_HUB_API_KEY=vhub_your_api_key_here \
  -e VAULT_HUB_BASE_URL=https://your-server.com \
  ghcr.io/lwshen/vault-hub-cli:latest list

# Get vault and save to mounted volume
docker run --rm \
  -v $(pwd):/output \
  -e VAULT_HUB_API_KEY=vhub_your_api_key_here \
  -e VAULT_HUB_BASE_URL=https://your-server.com \
  -e VAULT_HUB_CLI_ARGS="get --name prod-secrets --output /output/.env" \
  ghcr.io/lwshen/vault-hub-cli:latest
```

### Scheduled Execution with Cron

```bash
# Run CLI on a schedule (every 30 minutes)
docker run -d \
  --name vault-hub-sync \
  -v $(pwd)/logs:/var/log/cron \
  -v $(pwd)/secrets:/output \
  -e RUN_MODE=cron \
  -e CRON_SCHEDULE="*/30 * * * *" \
  -e VAULT_HUB_API_KEY=vhub_your_api_key_here \
  -e VAULT_HUB_BASE_URL=https://your-server.com \
  -e VAULT_HUB_CLI_ARGS="get --name prod-secrets --output /output/.env" \
  ghcr.io/lwshen/vault-hub-cli:latest

# Check logs
docker logs vault-hub-sync
tail -f ./logs/vault-hub.log
```

## Environment Variables Reference

For a complete reference of all CLI environment variables:

### Core CLI Variables

| Variable | Flag Equivalent | Default | Required | Description |
|----------|-----------------|---------|----------|-------------|
| `VAULT_HUB_API_KEY` | `--api-key` | - | Yes | API key for authentication (starts with `vhub_`) |
| `VAULT_HUB_BASE_URL` | `--base-url` | `http://localhost:3000` | No | VaultHub server URL |
| `VAULT_HUB_DEBUG` or `DEBUG` | `--debug` | `false` | No | Enable debug logging |
| - | `--no-client-encryption` | `false` | No | Disable additional client-side encryption layer (get command only) |

### Docker-Specific Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VAULT_HUB_CLI_ARGS` | - | CLI arguments to pass when using Docker image |
| `RUN_MODE` | `oneshot` | Docker run mode: `oneshot` or `cron` |
| `CRON_SCHEDULE` | `0 * * * *` | Cron schedule for scheduled execution in Docker |

## Troubleshooting

### Enable Debug Mode

```bash
# Enable debug logging to see detailed request/response info
export VAULT_HUB_DEBUG=true
vault-hub list

# Or use the flag
vault-hub --debug list
```

### Common Issues

**File Permissions**
```bash
# CLI creates output files with 0600 permissions (owner read/write only)
# If you need different permissions, change them after file creation
vault-hub get --name secrets --output .env
chmod 644 .env  # If needed for your use case
```