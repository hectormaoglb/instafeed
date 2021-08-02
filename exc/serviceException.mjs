export class ServiceException extends Error {
  constructor(status, message) {
    super(message);
    super.name = "ServiceException";
    this.status = status;
  }
}
