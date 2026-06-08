import { Controller, Get, NotFoundException, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { renderVoyagerPage } from 'graphql-voyager/middleware';

@Controller('voyager')
export class VoyagerController {
  constructor(private readonly config: ConfigService) {}

  @Get()
  voyager(@Res() res: Response) {
    if (this.config.get<string>('NODE_ENV') === 'production') {
      throw new NotFoundException();
    }

    res.send(
      renderVoyagerPage({
        endpointUrl: '/graphql',
        displayOptions: {
          skipRelay: false,
          skipDeprecated: false,
        },
      }),
    );
  }
}
