import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}
  async create(createUserDto: CreateUserDto) {
  const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
  
  const newUser = await this.prismaService.user.create({
    data: {
      ...createUserDto,
      password: hashedPassword,
      role: createUserDto.role ?? 'MEMBER', // fallback to MEMBER if role is not provided
    },
  });

  return newUser;
}


  findAll() {
    const allUsers = this.prismaService.user.findMany();
    return allUsers;
  }

  findOne(id: string) {
    const foundUser = this.prismaService.user.findUnique({
      where: { id: id },
    });
    if (!foundUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return foundUser;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    if(updateUserDto.password) {
      updateUserDto.password =await bcrypt.hash(updateUserDto.password, 10); // Hash the new password
    }
    const updatedUser = this.prismaService.user.update({
      where: { id: id },
      data: updateUserDto,
    });
    if (!updatedUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return updatedUser;
  }

  remove(id: string) {
    const deletedUser = this.prismaService.user.delete({
      where: { id: id },
    });
    if (!deletedUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return deletedUser;
  }
}
