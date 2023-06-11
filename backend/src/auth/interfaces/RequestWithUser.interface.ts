import { Request } from 'express';
import { User } from 'src/users/entities/user.entity';

interface RequestWithUser extends Request {
  user: string;
}

export default RequestWithUser;