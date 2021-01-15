import { Settings } from '../classes/settings.model';

export interface IDatabase {
  content: {
    images: { [key: string]: any };
    innerHtml: { [key: string]: any };
  };
  analytics: any;
  settings: Settings;
}
