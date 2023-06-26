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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TokenGuard } from 'src/auth/token/token.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Express, Response } from 'express';
import RequestWithUser from 'src/auth/interfaces/RequestWithUserID.interface';
import userDTO from './user.dto';

@Controller('user')
// @UseGuards(TokenGuard)
@ApiTags('유저 API')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({
    summary: '모든 유저 조회 API',
    description: '모든 유저를 조회합니다.',
  })
  @ApiCreatedResponse({
    description: '모든 유저의 정보를 반환해줍니다.',
    type: userDTO,
  })
  @Get('list')
  async findAll(): Promise<userDTO[]> {
    return this.usersService.findAll();
  }

  @ApiOperation({
    summary: '유저 조회 API',
    description: '인자로 넘어온 id와 일치하는 유저를 조회합니다.',
  })
  @ApiCreatedResponse({
    description:
      '인자로 넘어온 id와 일치하는 유저의 정보(User entity)를 반환해줍니다',
    type: userDTO,
  })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<userDTO> {
    return this.usersService.findOne(id);
  }

  @ApiOperation({
    summary: '유저 정보 업데이트 API',
    description:
      '첫번째 인자인 id와 일치하는 유저의 데이터를 Body의 User로 업데이트 합니다.',
  })
  @ApiCreatedResponse({
    description: '성공 실패 여부를 boolean값으로 반환해줍니다.',
    type: Boolean,
  })
  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() user: userDTO,
  ): Promise<boolean> {
    return this.usersService.updateUser(id, user);
  }

  @ApiOperation({
    summary: '유저 Status 업데이트 API',
    description:
      '첫번째 인자인 id와 일치하는 유저의 데이터를 Body의 Status로 업데이트 합니다.',
  })
  @ApiCreatedResponse({
    description: '성공 실패 여부를 boolean값으로 반환해줍니다.',
    type: Boolean,
  })
  @Patch('status/:id')
  async updateUserStatus(
    @Param('id') id: string,
    @Body() user: userDTO,
  ): Promise<boolean> {
    return this.usersService.updateUserStatus(id, user.user_status);
  }

  @ApiOperation({
    summary: '유저 등록 API',
    description: '유저를 등록합니다.',
  })
  @ApiCreatedResponse({
    description:
      '유저를 등록한 후 해당 유저의 정보(User entity)를 반환해줍니다.',
    type: userDTO,
  })
  @Post()
  async saveUser(@Body() user: userDTO): Promise<userDTO> {
    return this.usersService.saveUser(user);
  }

  @ApiOperation({
    summary: '유저 삭제 API',
    description: '인자로 넘어온 id와 일치하는 유저를 삭제합니다.',
  })
  @ApiCreatedResponse({
    description: '성공여부를 boolean 값으로 반환해줍니다.',
    type: String,
  })
  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<boolean> {
    return this.usersService.deleteUser(id);
  }

  @ApiOperation({
    summary: '이미지 업로드 API',
    description:
      '클라이언트에서 보내준 이미지를 백엔드 로컬에 저장하는 함수입니다.',
  })
  @ApiCreatedResponse({
    description: '저장된 이미지를 Get할 수 있는 주소를 반환해줍니다.',
    type: String,
  })
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
  ): Promise<{ url: string }> {
    console.log('uploads');
    return await this.usersService.uploadImage(req, file);
  }

  @Get('uploads/:filename')
  @ApiOperation({
    summary: '이미지 반환 API',
    description: '파라미터로 넘어온 filname에 해당하는 이미지를 반환해줍니다.',
  })
  @ApiCreatedResponse({
    description: '이미지 반환',
    type: String,
  })
  async getImage(
    @Param('filename') filename: string,
    @Res() res: Response,
  ): Promise<void> {
    res.sendFile(filename, { root: '../data/profile' });
  }

  @Delete('uploads/:filename')
  @ApiOperation({
    summary: '이미지 삭제 API',
    description: '파라미터로 넘어온 filname에 해당하는 이미지를 삭제해줍니다.',
  })
  @ApiCreatedResponse({
    description: '성공여부를 string 값으로 반환해줍니다.',
    type: String,
  })
  async deleteImage(@Param('filename') filename: string): Promise<string> {
    return await this.usersService.deleteImage(filename);
  }
}
