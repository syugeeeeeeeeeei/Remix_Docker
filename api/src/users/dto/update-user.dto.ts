// api/src/users/dto/update-user.dto.ts
import { PartialType } from '@nestjs/mapped-types'; // PartialType をインポート
import { CreateUserDto } from './create-user.dto';

// CreateUserDto をベースに、全てのプロパティをオプショナルにする
export class UpdateUserDto extends PartialType(CreateUserDto) { }
