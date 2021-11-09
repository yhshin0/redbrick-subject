import { Project } from './entities/project.entity';

export interface IFindAllResponse {
  totalCount: number;
  data: Project[];
}

export interface IPublishResponseMessage {
  message: string;
}
