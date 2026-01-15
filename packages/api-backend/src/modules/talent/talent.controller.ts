import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TalentService } from './talent.service';
import { CreateTalentDto } from './dto/create-talent.dto';
import { UpdateTalentDto } from './dto/update-talent.dto';
import { TalentQueryDto } from './dto/talent-query.dto';

@ApiTags('Talents')
@ApiBearerAuth('BearerAuth')
@Controller('talents')
export class TalentController {
  constructor(private readonly talentService: TalentService) {}

  @Get()
  @ApiOperation({
    summary: 'List talents',
    description: 'Get paginated list of talents with filtering and sorting',
  })
  @ApiResponse({
    status: 200,
    description: 'List of talents',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/Talent' },
        },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            total: { type: 'number' },
            totalPages: { type: 'number' },
            hasNext: { type: 'boolean' },
            hasPrev: { type: 'boolean' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  async findAll(@Query() query: TalentQueryDto) {
    return this.talentService.findAll(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create talent profile',
    description: 'Create a new talent profile (typically called from Telegram bot)',
  })
  @ApiResponse({
    status: 201,
    description: 'Talent created successfully',
    schema: { $ref: '#/components/schemas/Talent' },
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 409,
    description: 'Talent with this Telegram ID already exists',
  })
  async create(@Body() createTalentDto: CreateTalentDto) {
    return this.talentService.create(createTalentDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get talent by ID',
    description: 'Get detailed talent profile',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Talent UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Talent details',
    schema: { $ref: '#/components/schemas/Talent' },
  })
  @ApiResponse({ status: 404, description: 'Talent not found' })
  async findOne(@Param('id') id: string) {
    return this.talentService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update talent profile',
    description: 'Update talent profile (partial update)',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Talent UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Talent updated successfully',
    schema: { $ref: '#/components/schemas/Talent' },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Talent not found' })
  async update(@Param('id') id: string, @Body() updateTalentDto: UpdateTalentDto) {
    return this.talentService.update(id, updateTalentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete talent profile',
    description: 'Soft delete talent profile (sets status to INACTIVE)',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Talent UUID',
  })
  @ApiResponse({ status: 200, description: 'Talent deleted successfully' })
  @ApiResponse({ status: 404, description: 'Talent not found' })
  async remove(@Param('id') id: string) {
    return this.talentService.remove(id);
  }

  @Post(':id/approve')
  @ApiOperation({
    summary: 'Approve talent profile',
    description: 'Approve talent profile for public visibility',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Talent UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Talent approved successfully',
    schema: { $ref: '#/components/schemas/Talent' },
  })
  @ApiResponse({ status: 404, description: 'Talent not found' })
  @ApiResponse({ status: 409, description: 'Talent already approved' })
  async approve(@Param('id') id: string) {
    // TODO: Get adminId from authenticated user when auth is implemented
    // For now, adminId is optional
    return this.talentService.approve(id);
  }

  @Post(':id/reject')
  @ApiOperation({
    summary: 'Reject talent profile',
    description: 'Reject talent profile with optional reason',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Talent UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Talent rejected successfully',
    schema: { $ref: '#/components/schemas/Talent' },
  })
  @ApiResponse({ status: 404, description: 'Talent not found' })
  @ApiResponse({ status: 409, description: 'Talent already rejected' })
  async reject(@Param('id') id: string, @Body('reason') reason?: string) {
    // TODO: Get adminId from authenticated user when auth is implemented
    // For now, adminId is optional
    return this.talentService.reject(id, reason);
  }
}

