import { User } from '../users/entities/user.entity';
import { PublishProjectDto } from './dto/publish-project.dto';
import { Project } from './entities/project.entity';

export interface IFindAllResponse {
  totalCount: number;
  data: Project[];
}

export interface IPublishResponseMessage {
  message: string;
}

export interface IProjectInfoForPublish {
  project: Project;
  publishProjectDto: PublishProjectDto;
  user: User;
}
