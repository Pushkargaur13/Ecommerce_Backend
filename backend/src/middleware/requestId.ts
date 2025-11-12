// src/middleware/requestId.ts
import expressRequestId from 'express-request-id';

export const requestId = expressRequestId({
  headerName: 'x-request-id', // can be overridden by client
});
