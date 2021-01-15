export class SocketError {
  key: string;
  message: string;

  constructor(obj: SocketError = {} as any) {
    this.key = obj?.key;
    this.message = obj?.message;
  }
}
