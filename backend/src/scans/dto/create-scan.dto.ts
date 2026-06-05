import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateScanDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^https:\/\/github\.com\/[^/]+\/[^/]+\/?$/, {
    message: 'repoUrl must be a valid public GitHub repository URL',
  })
  repoUrl!: string;
}  