import { NotificationTypes } from '../enums/notification-types.enum';

export class Notification {
  _id?: string;
  seen?: boolean;
  type?: NotificationTypes;
  key: string;
  value?: string;

  action?: string;
  actionData?: string;

  created?: Date = new Date();

  constructor(obj: Notification = {} as any) {
    this._id = obj?._id;
    this.seen = obj?.seen || false;
    this.type = obj?.type || NotificationTypes.INFO;
    this.key = obj?.key;
    this.value = obj?.value;

    this.action = obj?.action;
    this.actionData = obj?.actionData;
  }
}
