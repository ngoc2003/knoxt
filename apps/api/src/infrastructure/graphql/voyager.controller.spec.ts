/// <reference types="jest" />

import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { VoyagerController } from './voyager.controller';

describe('VoyagerController', () => {
  it('renders Voyager outside production', () => {
    const controller = new VoyagerController(
      new ConfigService({ NODE_ENV: 'development' }),
    );
    const response = {
      send: jest.fn(),
    } as unknown as Response;

    controller.voyager(response);

    expect(response.send).toHaveBeenCalledWith(
      expect.stringContaining('/graphql'),
    );
  });

  it('returns not found in production', () => {
    const controller = new VoyagerController(
      new ConfigService({ NODE_ENV: 'production' }),
    );
    const response = {
      send: jest.fn(),
    } as unknown as Response;

    expect(() => controller.voyager(response)).toThrow(NotFoundException);
    expect(response.send).not.toHaveBeenCalled();
  });
});
