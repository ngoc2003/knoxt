import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { createHttpLoggerOptions } from './http-logger.config';

@Module({
  imports: [
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        pinoHttp: createHttpLoggerOptions(
          config.get<string>('NODE_ENV', 'development'),
        ),
      }),
    }),
  ],
})
export class LoggingModule {}
