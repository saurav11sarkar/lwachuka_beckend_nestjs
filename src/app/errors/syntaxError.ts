import { TErrorSource } from '../helper/globalErrorHandler';

export function handleSyntaxError(err: SyntaxError): {
  statusCode: number;
  message: string;
  errorSources: TErrorSource[];
} {
  return {
    statusCode: 400,
    message: 'Invalid JSON',
    errorSources: [
      {
        path: 'body',
        message:
          'Request body contains malformed JSON. Please check your request',
      },
    ],
  };
}
