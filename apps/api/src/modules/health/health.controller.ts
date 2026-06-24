import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, PrismaHealthIndicator } from '@nestjs/terminus';
import { Public } from '../auth/public.decorator';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * GET /health is intentionally public so load balancers and uptime monitors
 * can hit it without authentication. We check Prisma connectivity — if the DB
 * is down the readiness probe should fail so traffic stops being routed here.
 */
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: PrismaHealthIndicator,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @Public()
  @HealthCheck()
  check() {
    return this.health.check([() => this.db.pingCheck('database', this.prisma)]);
  }
}
