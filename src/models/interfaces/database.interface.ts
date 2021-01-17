import { Settings } from '../classes/settings.model';

export interface IDatabase {
  content: {
    image: { [key: string]: any };
    innerHtml: { [key: string]: any };
  };
  analytics: any;
  settings: Settings;
}
