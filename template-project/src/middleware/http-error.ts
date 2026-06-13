export class HttpError extends Error {
  readonly status: number;
  readonly errorCode: string;
  readonly publicMessage: string;

  constructor(status: number, errorCode: string, publicMessage: string) {
    super(publicMessage);
    this.status = status;
    this.errorCode = errorCode;
    this.publicMessage = publicMessage;
  }
}
