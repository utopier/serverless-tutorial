import * as Sentry from '@sentry/browser';

const isLocal = process.env.NODE_ENV === 'development';
//const isLocal = false;

export function initSentry() {
  if (isLocal) {
    return;
  }

  Sentry.init({
    dsn:
      'https://b429d9e8ae86427fb78ce95fb4d3161d@o470972.ingest.sentry.io/5506709',
  });
}

export function logError(error, errorInfo = null) {
  if (isLocal) {
    return;
  }

  Sentry.withScope((scope) => {
    errorInfo && scope.setExtras(errorInfo);
    Sentry.captureException(error);
  });
}

export function onError(error) {
  let errorInfo = {};
  error = error + '';
  let message = error.toString();

  // Auth errors
  if (!(error instanceof Error) && error.message) {
    errorInfo = error;
    message = error.message;
    error = new Error(message);
    // API errors
  } else if (error.config && error.config.url) {
    errorInfo.url = error.config.url;
  }

  logError(error, errorInfo);

  alert(message);
}
