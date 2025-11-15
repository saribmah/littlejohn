export interface HealthCheck {
  status: 'ok' | 'error';
  timestamp: string;
  environment: string;
  uptime: number;
}

export interface ReadinessCheck {
  ready: boolean;
  checks: {
    server: boolean;
    database: boolean;
    redis: boolean;
  };
  timestamp: string;
}
