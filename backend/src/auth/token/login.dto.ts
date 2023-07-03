import { IsString } from "class-validator";

export class loginDTO {
  @IsString()
  token: string;

  @IsString()
  islogin: string;
}
