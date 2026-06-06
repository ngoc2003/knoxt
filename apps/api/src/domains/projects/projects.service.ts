import {
  BadRequestException,
  Injectable,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { PROJECT_REPOSITORY } from '../../core/constants/repository.tokens';
import type { IProjectRepository } from './application/ports/project.repository';
import {
  CreateProjectColumnInput,
  CreateProjectInput,
  UpdateProjectInput,
} from './dto/project.dto';
import { PaginationInput } from '../../core/common/dtos/pagination.dto';
import { FinanceService } from '../finance/finance.service';

@Injectable()
export class ProjectsService {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepo: IProjectRepository,
    private readonly financeService: FinanceService,
  ) {}

  async create(userId: string, data: CreateProjectInput) {
    const { budget, ...projectData } = data;
    const project = await this.projectRepo.create(userId, projectData);

    if (budget && !isNaN(Number(budget))) {
      await this.financeService.createIncome(userId, {
        amount: Number(budget),
        customerId: data.customerId,
        currency: 'USD',
        projectId: project.id,
        note: `Initial project budget for ${project.name}`,
      });
    }

    return project;
  }

  async findAll(
    userId: string,
    pagination: PaginationInput,
    customerId?: string,
  ) {
    return this.projectRepo.findAll(userId, pagination, customerId);
  }

  async findOne(userId: string, id: string) {
    const project = await this.projectRepo.findOne(userId, id);
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async update(userId: string, id: string, data: UpdateProjectInput) {
    await this.findOne(userId, id);
    return this.projectRepo.update(userId, id, data);
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.projectRepo.remove(userId, id);
  }

  async createColumn(userId: string, data: CreateProjectColumnInput) {
    if (!data.name.trim()) {
      throw new BadRequestException('Column name is required');
    }
    const column = await this.projectRepo.createColumn(userId, data);
    if (!column) throw new NotFoundException('Project not found');
    return column;
  }
}
