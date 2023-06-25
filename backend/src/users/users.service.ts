import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import RequestWithUser from 'src/auth/interfaces/RequestWithUser.interface';
import { promises as fs } from 'fs';
import { join } from 'path';
import userDTO from './user.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  // User part
  async findAll(): Promise<userDTO[]> {
    return this.userRepository.find();
  }

  async findOne(id: string): Promise<userDTO> {
    return this.userRepository.findOne({ where: { id: id } });
  }

  async updateUser(id: string, user: userDTO): Promise<boolean> {
    await this.userRepository.update(id, user);
    return true;
  }

  async updateUserStatus(id: string, userStatus: number): Promise<boolean> {
    const user = this.userRepository.create({ user_status: userStatus });
    await this.userRepository.update(id, user);
    return true;
  }

  async saveUser(user: userDTO): Promise<userDTO> {
    return await this.userRepository.save(user);
  }

  async deleteUser(id: string): Promise<boolean> {
    await this.userRepository.delete({ id: id });
    return true;
  }

  async uploadImage(req: RequestWithUser, file: Express.Multer.File) {
    const user = await this.findOne(req.user);

    if (
      user.avatar !==
      this.configService.get<string>('BACKEND_URL') +
        'user/uploads/_default.gif'
    )
      this.deleteImage(user.avatar);

    user.avatar =
      this.configService.get<string>('BACKEND_URL') +
      'user/uploads/' +
      file.filename;

    await this.updateUser(req.user, user);

    return {
      url:
        this.configService.get<string>('BACKEND_URL') +
        'user/uploads/' +
        file.filename,
    };
  }

  async deleteImage(filename: string): Promise<string> {
    const lastSlashIndex = filename.lastIndexOf('/');
    const imagename = filename.substring(lastSlashIndex + 1);
    const filePath = join('../data/profile/', imagename);

    try {
      await fs.unlink(filePath);
      return 'Successfully deleted file ' + filename;
    } catch (err) {
      console.error(err);
      throw new NotFoundException(`File with name ${filename} not found`);
    }
  }
}
