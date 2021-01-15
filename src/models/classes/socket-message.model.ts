export class SocketMessage<T> {
  data: T;
  status?: 'success' | 'error';
  options?: any;
  query?: any;

  constructor(obj: SocketMessage<T> = {} as any) {
    this.data = obj?.data as T;
    this.status = obj?.status;

    this.options = obj?.options;
    this.query = obj?.query;
  }
}
