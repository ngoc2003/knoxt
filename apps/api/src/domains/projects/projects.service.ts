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
  AddProjectMemberInput,
  CancelProjectInvitationInput,
  RemoveProjectMemberInput,
  ReorderProjectColumnsInput,
  UpdateProjectMemberRoleInput,
  UpdateProjectInput,
} from './dto/project.dto';
import { PaginationInput } from '../../core/common/dtos/pagination.dto';
import { FinanceService } from '../finance/finance.service';
import { MailService } from '../../infrastructure/mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../../core/common/enum/enums';

@Injectable()
export class ProjectsService {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepo: IProjectRepository,
    private readonly financeService: FinanceService,
    private readonly mailService: MailService,
    private readonly notificationsService: NotificationsService,
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
    const membership = project.members.find(
      (member) => member.userId === userId,
    );
    const canManageMembers =
      project.userId === userId || membership?.role === 'admin';
    return {
      ...project,
      members: canManageMembers
        ? project.members
        : project.members.filter((member) => member.userId === userId),
      invitations: canManageMembers ? project.invitations : [],
    };
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

  async reorderColumns(userId: string, data: ReorderProjectColumnsInput) {
    const project = await this.findOne(userId, data.projectId);
    const currentIds = new Set(project.columns.map((column) => column.id));
    const orderedIds = new Set(data.columnIds);

    if (
      currentIds.size !== orderedIds.size ||
      data.columnIds.length !== orderedIds.size ||
      data.columnIds.some((id) => !currentIds.has(id))
    ) {
      throw new BadRequestException(
        'Column order must contain every project column exactly once',
      );
    }

    return this.projectRepo.reorderColumns(data);
  }

  async addMember(userId: string, data: AddProjectMemberInput) {
    const project = await this.findOne(userId, data.projectId);
    const user = await this.projectRepo.findUserByEmail(data.email);
    if (user?.id === project.userId) {
      throw new BadRequestException('Project owner is already a member');
    }

    if (user) {
      const isNewMember = !project.members.some(
        (member) => member.userId === user.id,
      );
      const member = await this.projectRepo.addMember(data);
      if (member && isNewMember) {
        await this.notificationsService.create(
          member.userId,
          NotificationType.projectMemberAdded,
          `You were added to "${project.name}" as ${member.role}.`,
        );
      }
      return {
        status: 'member-added',
        member,
        invitation: null,
        emailSent: false,
      };
    }

    const invitation = await this.projectRepo.createInvitation(userId, data);
    const emailSent = await this.mailService.sendProjectInvitation({
      email: invitation.email,
      inviterName: project.user.name,
      projectId: project.id,
      projectName: project.name,
      role: invitation.role,
      token: invitation.token,
    });
    return {
      status: 'invitation-sent',
      member: null,
      invitation,
      emailSent,
    };
  }

  async updateMemberRole(data: UpdateProjectMemberRoleInput) {
    const member = await this.projectRepo.updateMemberRole(data);
    if (!member) throw new NotFoundException('Project member not found');
    return member;
  }

  async removeMember(data: RemoveProjectMemberInput) {
    const member = await this.projectRepo.removeMember(data);
    if (!member) throw new NotFoundException('Project member not found');
    return member;
  }

  async cancelInvitation(data: CancelProjectInvitationInput) {
    const invitation = await this.projectRepo.cancelInvitation(data);
    if (!invitation)
      throw new NotFoundException('Project invitation not found');
    return invitation;
  }
}
