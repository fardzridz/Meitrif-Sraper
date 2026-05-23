export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly statusCode = 500,
    message = code
  ) {
    super(message);
    this.name = "AppError";
  }
}
