import {
  ConflictException,
  Controller,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { ErrorCode } from '../../common/constants';
import { RoleEnum } from '../../common/enums';
import { UnauthorizedException } from '../../common/exceptions/auth.exception';
import { UserDto } from '../users/dtos/user.dto';
import { UsersService } from '../users/users.service';
import { LoginDto, LoginResponseDto } from './dtos';
import { RegisterDto } from './dtos/register.dto';
import { JwtAuthService } from './jwt.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthService {
  constructor(
    private readonly jwtService: JwtAuthService,
    private readonly usersService: UsersService,
  ) {}

  async login(body: LoginDto): Promise<LoginResponseDto> {
    const { username, password } = body;
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException(ErrorCode.INVALID_CREDENTIALS);
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(ErrorCode.INVALID_CREDENTIALS);
    }
    return {
      accessToken: await this.jwtService.generateToken({
        sub: user.id,
        email: user.email,
        role: user.role as RoleEnum,
      }),
      user: plainToInstance(UserDto, user, { excludeExtraneousValues: true }),
    };
  }

  async register(body: RegisterDto): Promise<UserDto> {
    const { username, password, email } = body;
    const existingUser = await this.usersService.findByEmailOrUsername(
      email,
      username,
    );
    if (existingUser) {
      throw new ConflictException(ErrorCode.USER_ALREADY_EXISTS);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await this.usersService.create({
      username,
      email,
      password: hashedPassword as string,
    });
    return plainToInstance(UserDto, newUser, { excludeExtraneousValues: true });
  }
  async getMe(id: number): Promise<UserDto> {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException(ErrorCode.USER_NOT_FOUND);
    }
    return plainToInstance(UserDto, user, { excludeExtraneousValues: true });
  }
}
