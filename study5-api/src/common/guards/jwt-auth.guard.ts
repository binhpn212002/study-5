import {
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FirebaseAdminService } from '../../modules/auth/services/firebase-admin.service';
import { UsersService } from '../../modules/user/services/users.service';
import { AUTH_OPTIONAL_KEY } from "../decorators/auth-optional.decorator";
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthUser } from '../interfaces/auth-user.interface';
import {
    extractBearerTokenFromAuthorizationHeader,
    isLikelyJwtIdToken,
} from '../utils/bearer-token.util';

@Injectable()
export class JwtAuthGuard {
  constructor(
    private readonly reflector: Reflector,
    private readonly firebaseAdmin: FirebaseAdminService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log("JwtAuthGuard canActivate");
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const isAuthOptional = this.reflector.getAllAndOverride<boolean>(
      AUTH_OPTIONAL_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (isAuthOptional) {
      const request = context.switchToHttp().getRequest<{
        headers?: { authorization?: string };
        user?: AuthUser;
      }>();
      const token = extractBearerTokenFromAuthorizationHeader(
        request.headers?.authorization,
      );

      if (!token) {
        return true;
      }
      const decoded = await this.firebaseAdmin.verifyIdToken(token);
      const user = await this.usersService.resolveUserForFirebaseLogin(
        decoded.uid,
        decoded,
      );
      const authUser = this.usersService.getAuthUser(user.id);
      request.user = await authUser;
      return true;
    }

    const role = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<{
      headers?: { authorization?: string };
      user?: AuthUser;
    }>();
    const token = extractBearerTokenFromAuthorizationHeader(
      request.headers?.authorization,
    );
    if (!token || !isLikelyJwtIdToken(token)) {
      throw new UnauthorizedException();
    }

    const decoded = await this.firebaseAdmin.verifyIdToken(token);
    console.log("decoded", decoded);
    const user = await this.usersService.resolveUserForFirebaseLogin(
      decoded.uid,
      decoded,
    );

    const authUser = this.usersService.getAuthUser(user.id);

    request.user = await authUser;
    return true;
  }
}
