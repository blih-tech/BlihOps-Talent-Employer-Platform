# Production Deployment Guide

This guide covers the deployment of BlihOps Talent & Employer Platform to a production VPS environment.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [VPS Setup](#vps-setup)
- [Secrets Management](#secrets-management)
- [Docker Compose Configuration](#docker-compose-configuration)
- [Deployment Steps](#deployment-steps)
- [Post-Deployment Verification](#post-deployment-verification)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### VPS Requirements

**Minimum Specifications**:
- **CPU**: 2-4 cores
- **RAM**: 4-8 GB
- **Storage**: 50-100 GB SSD
- **OS**: Ubuntu 22.04 LTS or Debian 12
- **Network**: Public IP with ports 80, 443, 22 open

**Recommended Specifications** (Production):
- **CPU**: 4-8 cores
- **RAM**: 8-16 GB
- **Storage**: 100-200 GB SSD
- **Backup**: Automated daily backups
- **Monitoring**: Resource monitoring (htop, netdata)

### Software Requirements

- Docker 20.10+ and Docker Compose 2.0+
- Git
- SSH access to VPS
- Domain name (optional, for SSL/TLS)

---

## Pre-Deployment Checklist

Before deploying to production, ensure the following:

### Code & Configuration
- [ ] All code changes are committed and pushed to repository
- [ ] All tests pass in CI/CD pipeline
- [ ] Staging environment has been tested successfully
- [ ] Docker Compose production configuration reviewed (`docker-compose.yml`)
- [ ] Environment variables template reviewed (`docs/ENV_TEMPLATE.md`)

### Security
- [ ] All secrets are generated (see [Secrets Management](#secrets-management))
- [ ] `.env` file is created on VPS (not committed to repository)
- [ ] File permissions are set correctly (`.env` should be `600`)
- [ ] SSH key-based authentication is configured
- [ ] Firewall rules are configured (UFW or similar)

### Infrastructure
- [ ] VPS is provisioned and accessible via SSH
- [ ] Docker and Docker Compose are installed
- [ ] Storage volumes directory is created and has proper permissions
- [ ] Backup strategy is planned and tested
- [ ] Monitoring solution is configured (optional but recommended)

### Domain & Networking (Optional)
- [ ] Domain name is configured to point to VPS IP
- [ ] SSL/TLS certificate is obtained (Let's Encrypt recommended)
- [ ] Reverse proxy is configured (Nginx/Caddy) if using domain

---

## VPS Setup

### 1. Initial Server Setup

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl git ufw

# Configure firewall (basic setup)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP (if using reverse proxy)
sudo ufw allow 443/tcp   # HTTPS (if using reverse proxy)
sudo ufw enable
```

### 2. Install Docker and Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add current user to docker group (logout/login required)
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### 3. Create Application Directory

```bash
# Create application directory
sudo mkdir -p /opt/blihops
sudo chown $USER:$USER /opt/blihops
cd /opt/blihops
```

### 4. Clone Repository

```bash
# Clone repository (use your repository URL)
git clone <your-repository-url> .

# Or use SSH
git clone git@github.com:your-org/blihops-platform.git .
```

---

## Secrets Management

### Strategy

**All secrets must be stored in environment variables and never committed to version control.**

### Required Secrets

Create a `.env` file in the project root on the VPS with the following secrets:

```bash
# Database Configuration
POSTGRES_USER=blihops
POSTGRES_PASSWORD=<strong-random-password>
POSTGRES_DB=blihops_db

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Configuration (generate strong random strings, minimum 32 characters)
JWT_SECRET=<strong-random-secret-min-32-chars>
JWT_REFRESH_SECRET=<strong-random-secret-min-32-chars>

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=<your-telegram-bot-token>
TELEGRAM_TALENT_CHANNEL_ID=<channel-id>
TELEGRAM_JOB_CHANNEL_ID=<channel-id>

# Admin Web Configuration
NEXTAUTH_SECRET=<strong-random-secret-min-32-chars>

# File Storage
APP_STORAGE_PATH=/opt/blihops/storage

# Observability (optional)
SENTRY_DSN=<your-sentry-dsn>

# Environment
NODE_ENV=production
```

### Generating Secure Secrets

```bash
# Generate random secrets (32+ characters)
openssl rand -hex 32    # For JWT secrets
openssl rand -base64 32 # Alternative method

# Generate database password
openssl rand -base64 24
```

### Securing the .env File

```bash
# Set strict permissions on .env file
chmod 600 .env

# Verify permissions
ls -la .env
# Should show: -rw------- (600)
```

### Secrets Storage Options (Future)

For enhanced security, consider:
- **Docker Secrets** (Docker Swarm mode)
- **HashiCorp Vault**
- **AWS Secrets Manager** / **Azure Key Vault**
- **Environment-specific secret files** (`.env.production`)

**Note**: For MVP/initial deployment, environment variables in `.env` file with proper file permissions (600) are sufficient.

---

## Docker Compose Configuration

### Production Configuration Features

The `docker-compose.yml` file includes:

#### Health Checks
- **PostgreSQL**: `pg_isready` check every 10 seconds
- **Redis**: `redis-cli ping` check every 10 seconds
- Start periods configured to allow services to initialize

#### Restart Policies
- **All services**: `restart: always`
- Ensures services automatically restart on failure or server reboot

#### Resource Limits
- **PostgreSQL**: 
  - Limit: 2 CPUs, 4GB RAM
  - Reservation: 1 CPU, 2GB RAM
- **Redis**: 
  - Limit: 1 CPU, 2GB RAM
  - Reservation: 0.5 CPU, 1GB RAM

**Note**: Resource limits in `deploy.resources` are primarily for Docker Swarm mode. For standalone docker-compose, consider enforcing limits via systemd or container runtime configuration if needed.

### Configuration Validation

```bash
# Validate docker-compose configuration
docker-compose config

# Check for syntax errors
docker-compose config --quiet
```

---

## Deployment Steps

### 1. Prepare Environment

```bash
# Navigate to application directory
cd /opt/blihops

# Create .env file (copy from template or create manually)
cp .env.example .env
# Edit .env with production values
nano .env

# Set proper permissions
chmod 600 .env

# Create storage directory
mkdir -p storage
chmod 755 storage
```

### 2. Start Services

```bash
# Pull latest images (if using remote images)
docker-compose pull

# Start services in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Check service status
docker-compose ps
```

### 3. Verify Services

```bash
# Check container health
docker ps

# Check service logs
docker-compose logs postgres
docker-compose logs redis

# Verify PostgreSQL is accepting connections
docker exec blihops-postgres pg_isready -U blihops

# Verify Redis is responding
docker exec blihops-redis redis-cli ping
```

### 4. Database Initialization

```bash
# Run database migrations (when application services are deployed)
# This will be done via application deployment, not infrastructure setup
```

---

## Post-Deployment Verification

### Service Health Checks

```bash
# Check all containers are running
docker-compose ps

# Expected output: All services should show "Up" status

# Check container health status
docker ps --format "table {{.Names}}\t{{.Status}}"

# Verify health checks are passing
docker inspect blihops-postgres | grep -A 10 Health
docker inspect blihops-redis | grep -A 10 Health
```

### Network Verification

```bash
# Test PostgreSQL connection (from host)
docker exec blihops-postgres psql -U blihops -d blihops_db -c "SELECT version();"

# Test Redis connection (from host)
docker exec blihops-redis redis-cli ping
# Expected: PONG
```

### Resource Usage

```bash
# Check resource usage
docker stats --no-stream

# Check disk usage
df -h
docker system df
```

### Log Verification

```bash
# Check for errors in logs
docker-compose logs | grep -i error

# Check for warnings
docker-compose logs | grep -i warn
```

---

## Monitoring & Maintenance

### Regular Monitoring

```bash
# Monitor container status
docker-compose ps

# Monitor resource usage
docker stats

# Monitor logs in real-time
docker-compose logs -f

# Check disk space
df -h
docker system df
```

### Backup Procedures

See `docs/BACKUP_RECOVERY.md` for detailed backup and recovery procedures.

**Quick Backup Commands**:

```bash
# Database backup
docker exec blihops-postgres pg_dump -U blihops blihops_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Storage backup
tar -czf storage_backup_$(date +%Y%m%d).tar.gz storage/
```

### Updates & Maintenance

```bash
# Pull latest code
git pull

# Rebuild and restart services (when application code changes)
docker-compose up -d --build

# Restart specific service
docker-compose restart postgres

# View service logs
docker-compose logs -f <service-name>
```

### Restart Policies

All services are configured with `restart: always`, which means:
- Services automatically restart on failure
- Services automatically start on Docker daemon startup
- Services automatically start on server reboot (if Docker is configured to start on boot)

---

## Troubleshooting

### Common Issues

#### Services Not Starting

```bash
# Check logs for errors
docker-compose logs

# Check container status
docker-compose ps

# Check Docker daemon status
sudo systemctl status docker
```

#### Database Connection Issues

```bash
# Verify PostgreSQL is running
docker-compose ps postgres

# Check PostgreSQL logs
docker-compose logs postgres

# Test connection
docker exec blihops-postgres pg_isready -U blihops
```

#### Resource Exhaustion

```bash
# Check resource usage
docker stats

# Check disk space
df -h

# Clean up unused Docker resources
docker system prune -a
```

#### Permission Issues

```bash
# Check file permissions
ls -la .env
ls -la storage/

# Fix permissions if needed
chmod 600 .env
chmod 755 storage/
```

### Getting Help

1. Check service logs: `docker-compose logs <service-name>`
2. Check container status: `docker-compose ps`
3. Review configuration: `docker-compose config`
4. Check system resources: `docker stats`, `df -h`, `free -h`

---

## Next Steps

After infrastructure deployment:

1. **Application Deployment**: Deploy API backend, admin web, and bot services
2. **Database Migrations**: Run Prisma migrations to initialize database schema
3. **Reverse Proxy Setup**: Configure Nginx/Caddy for SSL/TLS and domain routing
4. **Monitoring Setup**: Configure monitoring and alerting (Sentry, health checks)
5. **Backup Automation**: Set up automated backup jobs (cron)
6. **Documentation**: Document application-specific deployment procedures

---

**Last Updated**: 2026-01-14  
**Maintained By**: DevOps Team



