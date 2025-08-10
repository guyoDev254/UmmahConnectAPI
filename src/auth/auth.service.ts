import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDTO } from './dto/forgot-password.dto';
import { generate } from 'rxjs';
import { generateOtp, tokenExpiry } from 'src/utils/otp-generator';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService, private jwtService: JwtService) {}
  
  //login
  async login(email: string, password: string){
    const user = await this.prismaService.user.findUnique({
      where: { email: email },
    })
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password); // Use bcrypt to compare hashed password

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }
    const accessToken = this.jwtService.sign({ userId: user.id });
    return { accessToken, user };
    
  }

  // Register
  async register(createAuthDto: CreateAuthDto) {
    const hashedPassword = await bcrypt.hash(createAuthDto.password, 10);
    
    const newUser = await this.prismaService.user.create({
      data: {
        ...createAuthDto,
        password: hashedPassword,
      },
    });

    return newUser;
  }

  // change password
  async changePassword(userId: string, ChangePasswordDto: ChangePasswordDto) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(ChangePasswordDto.currentPassword, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(ChangePasswordDto.newPassword, 10);

    const updatedUser = await this.prismaService.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return updatedUser;
  }

  async forgotPassword(data: ForgotPasswordDTO){
    const user = await this.prismaService.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const otp = generateOtp();
    const expiry = tokenExpiry();

    await this.prismaService.user.update({
      where: { email: data.email },
      data: {
        otp: otp,
        otpExpiry: expiry,
      },
    });

    return { message: 'Password reset link sent to your email', otp: otp, expiry: expiry };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto){
    const user = await this.prismaService.user.findFirst({
      where: {
        otp: resetPasswordDto.otp,
        otpExpiry: {
          gte: new Date(),
        },
      },
    })

    if (!user) {
      throw new NotFoundException('Invalid or expired OTP');
    }

    const hashedNewPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);

    const updatedUser = await this.prismaService.user.update({
      where: { id: user.id },
      data: {
        password: hashedNewPassword,
        otp: null,
        otpExpiry: null,
      },
    });

    return { message: 'Password reset successfully', user: updatedUser };
  }

}
