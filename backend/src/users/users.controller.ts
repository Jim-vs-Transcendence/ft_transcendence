import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TokenGuard } from 'src/auth/token/token.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Express, Request, Response } from 'express';
import RequestWithUser from 'src/auth/interfaces/RequestWithUser.interface';
import { promises as fs } from 'fs';
import { join } from 'path';

@Controller('user')
// @UseGuards(TokenGuard)
@ApiTags('유저 API')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('list')
  @ApiOperation({
    summary: '모든 유저 조회 API',
    description: '모든 유저를 조회합니다.',
  })
  @ApiCreatedResponse({
    description: '모든 유저의 정보를 반환해줍니다.',
    type: User,
  })
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: '유저 조회 API',
    description: '인자로 넘어온 id와 일치하는 유저를 조회합니다.',
  })
  @ApiCreatedResponse({
    description:
      '인자로 넘어온 id와 일치하는 유저의 정보(User entity)를 반환해줍니다',
    type: User,
  })
  async findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: '유저 정보 업데이트 API',
    description:
      '첫번째 인자인 id와 일치하는 유저의 데이터를 Body의 User로 업데이트 합니다.',
  })
  @ApiCreatedResponse({
    description: '성공 실패 여부를 boolean값으로 반환해줍니다.',
    type: Boolean,
  })
  async updateUser(
    @Param('id') id: string,
    @Body() user: User,
  ): Promise<boolean> {
    console.log('Patch!');
    return this.usersService.updateUser(id, user);
  }

  @Post()
  @ApiOperation({
    summary: '유저 등록 API',
    description: '유저를 등록합니다.',
  })
  @ApiCreatedResponse({
    description:
      '유저를 등록한 후 해당 유저의 정보(User entity)를 반환해줍니다.',
    type: User,
  })
  async saveUser(@Body() user: User): Promise<User> {
    return this.usersService.saveUser(user);
  }

  @Delete(':id')
  @ApiOperation({
    summary: '유저 삭제 API',
    description: '인자로 넘어온 id와 일치하는 유저를 삭제합니다.',
  })
  @ApiCreatedResponse({
    description: '성공여부를 boolean 값으로 반환해줍니다.',
    type: String,
  })
  async deleteUser(@Param('id') id: string): Promise<boolean> {
    return this.usersService.deleteUser(id);
  }

  @Post('uploads')
  @UseGuards(TokenGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: '../data/profile',
        filename(_, file, callback): void {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return callback(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadImage(
    @Req() req: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log('uploads');
    return await this.usersService.uploadImage(req, file);
  }

  @Get('uploads/:filename')
  async getImage(@Param('filename') filename: string, @Res() res: Response) {
    res.sendFile(filename, { root: '../data/profile' });
  }

  @Delete('uploads/:filename')
  async deleteImage(@Param('filename') filename: string): Promise<string> {
    return await this.usersService.deleteImage(filename);
  }
}
