export interface ErrorResponse {
    errors: Array<{
      id: string;
      code: string;
      title: string;
      detail: string;
      source: {
        pointer: string;
        parameter: string;
      };
    }>;
  }
  