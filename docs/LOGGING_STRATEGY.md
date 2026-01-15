# Logging Infrastructure Strategy

This document outlines the logging infrastructure strategy for the BlihOps Talent & Employer Platform. This is planned for Phase 6 (Deployment) but documented here for planning purposes.

## 📋 Table of Contents

- [Overview](#overview)
- [Logging Architecture](#logging-architecture)
- [Logging Strategy](#logging-strategy)
- [Log Rotation](#log-rotation)
- [Log Retention Policies](#log-retention-policies)
- [Centralized Logging (Optional)](#centralized-logging-optional)
- [Best Practices](#best-practices)
- [Implementation Plan](#implementation-plan)

---

## Overview

The BlihOps platform uses structured logging with Pino for application logs and Docker's logging driver for container logs. This strategy is designed to be MVP-appropriate while allowing for future scaling.

### Current Logging Stack

- **Application Logging**: Pino (structured JSON logging)
- **Container Logging**: Docker logging driver (json-file default)
- **Error Tracking**: Sentry (error monitoring)
- **Log Output**: stdout/stderr (captured by Docker)

---

## Logging Architecture

### Log Flow

```
Application (Pino) → stdout/stderr → Docker Logging Driver → Log Files/Journal
                                                  ↓
                                         Log Rotation (logrotate)
                                                  ↓
                                         Log Retention Policy
```

### Component Overview

1. **Application Layer**: Services use Pino for structured JSON logging
2. **Container Layer**: Docker captures stdout/stderr from containers
3. **Host Layer**: Docker logging driver writes to log files on host
4. **Rotation Layer**: logrotate manages log file rotation
5. **Retention Layer**: Old logs are automatically purged

---

## Logging Strategy

### Application Logging (Pino)

All application services use Pino for structured logging:

- **Format**: JSON (structured logs)
- **Output**: stdout/stderr
- **Log Levels**: error, warn, info, debug
- **Context**: Request IDs, user IDs, timestamps included

**Log Levels**:
- `error`: Errors that require immediate attention
- `warn`: Warnings that may need investigation
- `info`: Informational messages (default for production)
- `debug`: Debug messages (development only)

### Container Logging (Docker)

Docker containers use the default `json-file` logging driver:

- **Location**: `/var/lib/docker/containers/<container-id>/<container-id>-json.log`
- **Format**: JSON (one JSON object per line)
- **Rotation**: Managed by Docker or logrotate

### Docker Compose Logging Configuration

For production, configure logging in `docker-compose.yml`:

```yaml
services:
  api-backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
        labels: "service,environment"
```

**Options**:
- `max-size`: Maximum log file size before rotation (e.g., "10m", "100m")
- `max-file`: Number of log files to keep (e.g., "3" = 3 files)
- `labels`: Additional metadata for log identification

---

## Log Rotation

### Docker Log Rotation (Built-in)

Docker's `json-file` driver supports built-in rotation:

```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"      # Rotate when file reaches 10MB
    max-file: "3"        # Keep 3 rotated files (30MB total per container)
```

**Calculation**:
- If `max-size: "10m"` and `max-file: "3"`:
  - Current log: up to 10MB
  - Rotated logs: 2 additional files (10MB each)
  - Total: ~30MB per container

### System-Level Log Rotation (logrotate)

For additional control, use logrotate on the host system:

**File**: `/etc/logrotate.d/docker-containers`

```
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    size=10M
    missingok
    delaycompress
    copytruncate
    notifempty
}
```

**Options**:
- `rotate 7`: Keep 7 days of logs
- `daily`: Rotate logs daily
- `compress`: Compress old log files
- `size=10M`: Also rotate if file exceeds 10MB
- `missingok`: Don't error if log file is missing
- `delaycompress`: Compress files one rotation cycle late
- `copytruncate`: Copy and truncate (instead of moving)
- `notifempty`: Don't rotate empty files

### Recommended Rotation Strategy

**For MVP/Phase 6**:
- Use Docker's built-in rotation: `max-size: "10m"`, `max-file: "3"`
- This provides ~30MB per container (sufficient for MVP)
- Minimal configuration required

**For Production Scale** (Future):
- Combine Docker rotation with logrotate
- Implement centralized logging (ELK, Loki, etc.)
- Set up log aggregation and analysis

---

## Log Retention Policies

### Retention Strategy

**Recommended Retention Periods**:

| Log Type | Retention Period | Rationale |
|----------|-----------------|-----------|
| Application Logs | 7-30 days | Balance between debugging needs and storage |
| Error Logs | 90 days | Longer retention for error analysis |
| Audit Logs | 1 year+ | Compliance and security auditing |
| Access Logs | 30-90 days | Security and usage analysis |

### Implementation

**Docker Log Retention** (via max-file):
- `max-file: "3"` = ~3 log files per container
- Total retention depends on log volume and rotation frequency

**Calculation Example**:
- Log file size: 10MB
- Files kept: 3
- Total storage: ~30MB per container
- Retention time: Depends on log generation rate
  - High traffic: 1-3 days
  - Low traffic: 7-14 days

**System-Level Retention** (logrotate):
- Configure `rotate N` to keep N days of logs
- Use `compress` to reduce storage
- Configure compression delay for active log analysis

### Compliance Considerations

For compliance requirements:
- **GDPR**: Ensure logs don't contain PII unnecessarily
- **Audit Requirements**: Retain audit logs per compliance policy
- **Data Retention**: Align log retention with data retention policies

---

## Centralized Logging (Optional)

### When to Implement Centralized Logging

Centralized logging is recommended when:
- Multiple services need log aggregation
- Log analysis and searching is required
- Log volume exceeds simple file-based storage
- Compliance requires centralized log management

### Options for Centralized Logging

**MVP Phase (Not Required)**:
- Docker logs to files (current approach)
- Manual log inspection via `docker logs`
- Sufficient for single-server deployment

**Future Options**:

1. **Loki + Grafana** (Recommended for future):
   - Lightweight and cost-effective
   - Good for small to medium deployments
   - Integrates with Grafana dashboards

2. **ELK Stack (Elasticsearch, Logstash, Kibana)**:
   - Full-featured log aggregation
   - Better for large-scale deployments
   - Higher resource requirements

3. **Cloud Logging Services**:
   - AWS CloudWatch Logs
   - Google Cloud Logging
   - Azure Monitor
   - Datadog Logs

### Implementation Plan (Future)

If centralized logging is needed:

1. **Choose Solution**: Loki (recommended) or ELK
2. **Deploy Log Aggregator**: Container or service
3. **Configure Log Shipping**: Fluentd, Promtail, or Logstash
4. **Set Up Dashboards**: Grafana or Kibana
5. **Configure Retention**: Per solution's requirements

---

## Best Practices

### Application Logging

1. **Use Structured Logging**:
   ```typescript
   // ✅ GOOD - Structured logging
   logger.info({ userId, action: 'login', ip }, 'User logged in');
   
   // ❌ BAD - Unstructured logging
   logger.info(`User ${userId} logged in from ${ip}`);
   ```

2. **Include Context**:
   - Request IDs for tracing
   - User IDs for user-specific events
   - Timestamps (automatic with Pino)
   - Service/component identification

3. **Appropriate Log Levels**:
   - `error`: Only for actual errors
   - `warn`: For warnings that need attention
   - `info`: For important events (not verbose)
   - `debug`: For development debugging only

4. **Avoid Sensitive Data**:
   - Never log passwords, tokens, or secrets
   - Avoid logging full request bodies
   - Sanitize PII when necessary

5. **Performance Considerations**:
   - Use appropriate log levels in production (info or warn)
   - Avoid excessive logging in hot paths
   - Consider async logging for high-throughput scenarios

### Container Logging

1. **Configure Rotation**:
   - Set appropriate `max-size` and `max-file`
   - Monitor log disk usage
   - Adjust based on log volume

2. **Monitor Log Growth**:
   ```bash
   # Check Docker log disk usage
   docker system df
   
   # Check container log sizes
   du -sh /var/lib/docker/containers/*/
   ```

3. **Log Labels**:
   - Use labels for log identification
   - Include service name, environment, version

### Log Management

1. **Regular Monitoring**:
   - Monitor log disk usage
   - Check for log rotation issues
   - Review error log patterns

2. **Log Analysis**:
   - Use `grep`, `jq` for log analysis
   - Set up error alerting (Sentry)
   - Regular log reviews for anomalies

3. **Backup Important Logs**:
   - Archive critical error logs
   - Keep audit logs for compliance
   - Backup before major cleanups

---

## Implementation Plan

### Phase 6 (Deployment) - Initial Implementation

**Priority: Medium** (Can be implemented during deployment phase)

1. **Configure Docker Logging** (High Priority):
   - Add logging configuration to `docker-compose.yml`
   - Set `max-size: "10m"` and `max-file: "3"`
   - Test log rotation

2. **Set Up Log Monitoring** (Medium Priority):
   - Monitor log disk usage
   - Set up disk space alerts
   - Document log locations

3. **Document Log Access** (Medium Priority):
   - Document how to access logs
   - Document log analysis procedures
   - Create runbooks for common scenarios

### Future Enhancements

1. **Log Rotation Enhancement** (Optional):
   - Configure logrotate for additional control
   - Implement compression
   - Fine-tune retention policies

2. **Centralized Logging** (Future):
   - Evaluate centralized logging needs
   - Implement Loki or ELK stack
   - Set up log aggregation and dashboards

3. **Log Analytics** (Future):
   - Implement log analysis tools
   - Set up log-based alerting
   - Create log dashboards

---

## Configuration Examples

### Docker Compose Logging Configuration

```yaml
version: '3.8'

services:
  api-backend:
    # ... other configuration ...
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
        labels: "service=api-backend,environment=production"

  telegram-bot:
    # ... other configuration ...
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
        labels: "service=telegram-bot,environment=production"

  admin-web:
    # ... other configuration ...
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
        labels: "service=admin-web,environment=production"
```

### Logrotate Configuration

**File**: `/etc/logrotate.d/docker-containers`

```
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    size=10M
    missingok
    delaycompress
    copytruncate
    notifempty
    create 0644 root root
}
```

### Environment Variables

Add to `.env` file:

```bash
# Logging Configuration
LOG_LEVEL=info                    # Production: info, Development: debug
LOG_FORMAT=json                   # json or pretty (development)
```

---

## Log Access and Analysis

### Viewing Logs

**Docker Compose**:
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs api-backend

# Follow logs (tail -f)
docker-compose logs -f api-backend

# View last N lines
docker-compose logs --tail=100 api-backend
```

**Docker**:
```bash
# View container logs
docker logs blihops-postgres

# Follow logs
docker logs -f blihops-postgres

# View with timestamps
docker logs -t blihops-postgres
```

**Host System**:
```bash
# View Docker log files directly
sudo tail -f /var/lib/docker/containers/<container-id>/*.log

# Find container ID
docker ps --format "{{.ID}} {{.Names}}"
```

### Log Analysis

**Structured Logs (JSON)**:
```bash
# Filter logs with jq
docker-compose logs api-backend | jq 'select(.level == "error")'

# Search logs
docker-compose logs api-backend | grep "error"

# Count errors
docker-compose logs api-backend | jq 'select(.level == "error")' | wc -l
```

**Unstructured Logs**:
```bash
# Search logs
docker-compose logs api-backend | grep "error"

# View recent errors
docker-compose logs api-backend | grep -i error | tail -20
```

---

## Monitoring and Alerts

### Disk Space Monitoring

Monitor log disk usage:

```bash
# Check Docker disk usage
docker system df

# Check log directory size
du -sh /var/lib/docker/containers/

# Check individual container log sizes
du -sh /var/lib/docker/containers/*/
```

### Alerting

Set up alerts for:
- High log disk usage (>80% full)
- Log rotation failures
- Excessive error logs
- Log file corruption

### Integration with Monitoring

- **Sentry**: Error tracking and alerting
- **System Monitoring**: Disk space alerts
- **Application Monitoring**: Log-based metrics (future)

---

## Troubleshooting

### Common Issues

1. **Logs Filling Disk**:
   - Check log rotation configuration
   - Increase log rotation frequency
   - Reduce log file retention
   - Clean up old logs manually

2. **Log Rotation Not Working**:
   - Verify Docker logging driver configuration
   - Check logrotate configuration (if using)
   - Verify disk space availability

3. **Missing Logs**:
   - Check container is running
   - Verify log location
   - Check file permissions

4. **Performance Issues**:
   - Reduce log verbosity (log level)
   - Check log I/O performance
   - Consider async logging

---

**Last Updated**: 2026-01-14  
**Status**: Planning Phase (Phase 6 Implementation)  
**Maintained By**: DevOps Team


