# Swagger/OpenAPI Setup Guide

Guide for setting up Swagger UI in the NestJS API backend.

## 📦 Installation

```bash
cd packages/api-backend
pnpm add @nestjs/swagger swagger-ui-express
```

## 🔧 Configuration

### 1. Update `main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('BlihOps Talent & Employer Platform API')
    .setDescription(
      'REST API for the BlihOps Talent & Employer Platform. ' +
      'Provides endpoints for talent management, job management, matching logic, and administrative operations.'
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'BearerAuth', // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    .addApiKey(
      {
        type: 'apiKey',
        in: 'header',
        name: 'X-Telegram-Bot-Api-Secret-Token',
        description: 'Secret token for Telegram webhook verification',
      },
      'TelegramWebhookSecret',
    )
    .addServer('https://api.blihops.com/api/v1', 'Production')
    .addServer('https://staging-api.blihops.com/api/v1', 'Staging')
    .addServer('http://localhost:3000/api/v1', 'Local Development')
    .setContact('BlihOps API Support', 'https://blihops.com', 'api-support@blihops.com')
    .setLicense('Proprietary', 'https://blihops.com/license')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    customSiteTitle: 'BlihOps API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
      persistAuthorization: true, // Keep auth token after page refresh
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  await app.listen(3000);
}
bootstrap();
```

### 2. Add Decorators to Controllers

#### Example: Talent Controller

```typescript
import { Controller, Get, Post, Body, Param, Patch, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { TalentService } from './talent.service';
import { CreateTalentDto, UpdateTalentDto } from './dto';
import { Talent } from './entities/talent.entity';

@ApiTags('Talents')
@ApiBearerAuth('BearerAuth')
@Controller('talents')
export class TalentController {
  constructor(private readonly talentService: TalentService) {}

  @Get()
  @ApiOperation({ summary: 'List talents', description: 'Get paginated list of talents with filtering and sorting' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (1-indexed)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'approved', 'rejected'] })
  @ApiQuery({ name: 'category', required: false, enum: ['ITO', 'AI_SOLUTIONS', 'AUTOMATION', 'DATA_ANALYTICS'] })
  @ApiResponse({ status: 200, description: 'List of talents', type: [Talent] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  async findAll(@Query() query: any) {
    return this.talentService.findAll(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create talent profile', description: 'Create a new talent profile (typically called from Telegram bot)' })
  @ApiResponse({ status: 201, description: 'Talent created successfully', type: Talent })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Talent with this Telegram ID already exists' })
  async create(@Body() createTalentDto: CreateTalentDto) {
    return this.talentService.create(createTalentDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get talent by ID', description: 'Get detailed talent profile' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Talent details', type: Talent })
  @ApiResponse({ status: 404, description: 'Talent not found' })
  async findOne(@Param('id') id: string) {
    return this.talentService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update talent profile', description: 'Update talent profile (partial update)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Talent updated successfully', type: Talent })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Talent not found' })
  async update(@Param('id') id: string, @Body() updateTalentDto: UpdateTalentDto) {
    return this.talentService.update(id, updateTalentDto);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve talent profile', description: 'Approve talent profile for public visibility' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Talent approved successfully', type: Talent })
  @ApiResponse({ status: 404, description: 'Talent not found' })
  @ApiResponse({ status: 409, description: 'Talent already approved' })
  async approve(@Param('id') id: string) {
    return this.talentService.approve(id);
  }
}
```

### 3. Add Decorators to DTOs

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsArray, IsEnum, IsOptional, MinLength, MaxLength, ArrayMaxSize } from 'class-validator';
import { ServiceCategory, ExperienceLevel, Availability, EngagementType } from '@blihops/shared';

export class CreateTalentDto {
  @ApiProperty({ description: 'Telegram user ID', example: 123456789 })
  @IsNumber()
  telegramId: number;

  @ApiProperty({ description: 'Full name', minLength: 2, maxLength: 100, example: 'John Doe' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ enum: ServiceCategory, description: 'Service category' })
  @IsEnum(ServiceCategory)
  serviceCategory: ServiceCategory;

  @ApiPropertyOptional({ description: 'Role specialization', maxLength: 200, example: 'Senior Full-Stack Developer' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  roleSpecialization?: string;

  @ApiProperty({ 
    description: 'Skills array', 
    type: [String],
    minItems: 1,
    maxItems: 50,
    example: ['TypeScript', 'NestJS', 'PostgreSQL', 'React']
  })
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  skills: string[];

  @ApiProperty({ enum: ExperienceLevel, description: 'Experience level' })
  @IsEnum(ExperienceLevel)
  experienceLevel: ExperienceLevel;

  @ApiProperty({ enum: Availability, description: 'Availability status' })
  @IsEnum(Availability)
  availability: Availability;

  @ApiProperty({ enum: EngagementType, description: 'Engagement preference' })
  @IsEnum(EngagementType)
  engagementPreference: EngagementType;

  @ApiPropertyOptional({ description: 'CV file ID (UUID)', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  cvFileId?: string;

  @ApiPropertyOptional({ description: 'Consent for public visibility', default: true })
  @IsOptional()
  @IsBoolean()
  consentForPublicVisibility?: boolean;
}
```

### 4. Add Decorators to Entities

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('talents')
export class Talent {
  @ApiProperty({ description: 'Talent UUID', format: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Telegram user ID', example: 123456789 })
  @Column({ type: 'bigint', unique: true })
  telegramId: number;

  @ApiProperty({ description: 'Full name', example: 'John Doe' })
  @Column()
  name: string;

  @ApiProperty({ enum: ServiceCategory, description: 'Service category' })
  @Column({ type: 'enum', enum: ServiceCategory })
  serviceCategory: ServiceCategory;

  @ApiProperty({ type: [String], description: 'Skills array', example: ['TypeScript', 'NestJS'] })
  @Column('text', { array: true })
  skills: string[];

  @ApiProperty({ enum: ExperienceLevel, description: 'Experience level' })
  @Column({ type: 'enum', enum: ExperienceLevel })
  experienceLevel: ExperienceLevel;

  @ApiProperty({ enum: TalentStatus, description: 'Approval status' })
  @Column({ type: 'enum', enum: TalentStatus, default: TalentStatus.PENDING })
  status: TalentStatus;

  @ApiProperty({ description: 'Created timestamp', format: 'date-time' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Updated timestamp', format: 'date-time' })
  @UpdateDateColumn()
  updatedAt: Date;
}
```

## 🚀 Accessing Swagger UI

After setup, access Swagger UI at:

- **Development**: `http://localhost:3000/api-docs`
- **Staging**: `https://staging-api.blihops.com/api-docs`
- **Production**: `https://api.blihops.com/api-docs`

## 🔐 Testing Authentication

1. Use the `/auth/login` endpoint in Swagger UI to get a token
2. Click the "Authorize" button (lock icon) at the top
3. Enter: `Bearer <your-token-here>`
4. Click "Authorize"
5. All protected endpoints will now use this token

## 📝 Best Practices

### 1. Use ApiTags for Organization

```typescript
@ApiTags('Talents')
@Controller('talents')
export class TalentController {}
```

### 2. Document All Responses

```typescript
@ApiResponse({ status: 200, description: 'Success', type: Talent })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 404, description: 'Not found' })
```

### 3. Use ApiProperty for DTOs

Always document DTO properties with examples and constraints:

```typescript
@ApiProperty({ 
  description: 'Email address',
  example: 'user@example.com',
  format: 'email'
})
@IsEmail()
email: string;
```

### 4. Document Query Parameters

```typescript
@ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
@ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
@ApiQuery({ name: 'status', required: false, enum: ['pending', 'approved'] })
```

### 5. Use ApiParam for Path Parameters

```typescript
@ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Talent UUID' })
```

## 🔄 Generating OpenAPI Spec

To export the OpenAPI specification:

```typescript
// In main.ts, after creating document
import { writeFileSync } from 'fs';

const document = SwaggerModule.createDocument(app, config);
writeFileSync('./openapi.json', JSON.stringify(document, null, 2));
```

Or use the CLI:

```bash
# Generate OpenAPI spec
curl http://localhost:3000/api-docs-json > openapi.json
```

## 🧪 Testing with Swagger

1. **Try It Out**: Click "Try it out" on any endpoint
2. **Fill Parameters**: Enter required parameters
3. **Execute**: Click "Execute"
4. **View Response**: See the response with status code and body

## 📚 Additional Resources

- [NestJS Swagger Documentation](https://docs.nestjs.com/openapi/introduction)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)

---

**Note**: The OpenAPI specification file (`docs/api/openapi.yaml`) should be kept in sync with the actual API implementation. Update it when adding new endpoints or changing existing ones.


