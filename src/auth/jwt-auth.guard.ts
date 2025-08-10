import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard  extends AuthGuard('jwt') {
  // This guard will use the JWT strategy defined in jwt.strategy.ts
  // It will automatically validate the JWT token and attach the user to the request object
  // If the token is invalid or expired, it will throw an UnauthorizedException
}