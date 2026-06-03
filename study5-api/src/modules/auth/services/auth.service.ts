import { Injectable } from '@nestjs/common';
import { JwtService } from "@nestjs/jwt";
import { CreateUserDto } from '../../user/dto/create-user.dto';
import { UserResponseDto } from '../../user/dto/user-response.dto';
import { UsersService } from "../../user/services/users.service";
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from "../dto/refresh-token.dto";
import { FirebaseAdminService } from './firebase-admin.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly firebaseAdmin: FirebaseAdminService,
  ) {}

  /** Username + password: BE gọi Firebase Identity Toolkit (Email/Password) → idToken → JWT. */
  async login(dto: LoginDto): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const email = await this.usersService.resolveEmailForPasswordLogin(
      dto.email,
    );
    const data = await this.firebaseAdmin.signInWithEmailAndPassword(
      email,
      dto.password,
    );

    return {
      accessToken: data.idToken ?? "",
      refreshToken: data.refreshToken ?? "",
    };
  }

  async register(dto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(dto);
  }
  async refreshToken(dto: RefreshTokenDto): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const data = await this.firebaseAdmin.refreshToken(dto.refreshToken);
    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };
  }
}
