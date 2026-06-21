import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import {
  AuthResponse,
  GoogleLoginInput,
  LoginInput,
  RegisterInput,
} from './dto/auth.dto';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthResponse)
  register(@Args('data') data: RegisterInput): Promise<AuthResponse> {
    return this.authService.register(data);
  }

  @Mutation(() => AuthResponse)
  login(@Args('data') data: LoginInput): Promise<AuthResponse> {
    return this.authService.login(data);
  }

  @Mutation(() => AuthResponse)
  loginWithGoogle(
    @Args('data') data: GoogleLoginInput,
  ): Promise<AuthResponse> {
    return this.authService.loginWithGoogle(data);
  }
}
