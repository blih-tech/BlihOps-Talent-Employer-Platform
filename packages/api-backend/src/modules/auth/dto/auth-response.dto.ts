import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ description: 'User UUID', format: 'uuid' })
  id: string;

  @ApiProperty({ description: 'User email', format: 'email' })
  email: string;

  @ApiProperty({ description: 'User role', enum: ['admin', 'super_admin'] })
  role: string;

  @ApiProperty({ description: 'Created timestamp', format: 'date-time' })
  createdAt: Date;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Access token expiration time in seconds',
    example: 3600,
  })
  expiresIn: number;

  @ApiProperty({ description: 'User information', type: UserDto })
  user: UserDto;
}

