import { Request } from 'express';
import userDTO from 'src/users/user.dto';

interface RequestWithUserDTO extends Request {
  user: userDTO;
}

export default RequestWithUserDTO;
