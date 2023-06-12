import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Friend } from './entities/friend.entity';
import friendDTO from './friend/dto/friend.dto';
import RequestWithUser from 'src/auth/interfaces/RequestWithUser.interface';
import { promises as fs } from 'fs';
import { join } from 'path';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Friend) private friendRepository: Repository<Friend>,
  ) {}

  // User part
  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: string): Promise<User> {
    return this.userRepository.findOne({ where: { id: id } });
  }

  async updateUser(id: string, user: User): Promise<boolean> {
    await this.userRepository.update(id, user);
    return true;
  }

  async saveUser(user: User): Promise<User> {
    return await this.userRepository.save(user);
  }

  async deleteUser(id: string): Promise<boolean> {
    await this.userRepository.delete({ id: id });
    return true;
  }

  async uploadImage(req: RequestWithUser, file: Express.Multer.File) {
    const user = await this.findOne(req.user);

    if (user.avatar !== process.env.BACKEND_URL + 'user/uploads/_default.jpg')
      this.deleteImage(user.avatar);

    user.avatar = process.env.BACKEND_URL + 'user/uploads/' + file.filename;

    await this.updateUser(req.user, user);
    //file 잘못넘어 왔을 때 throw
    return {
      url: process.env.BACKEND_URL + 'user/uploads/' + file.filename,
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
