const dev = {
  s3: {
    REGION: process.env.REACT_APP_DEV_S3_UPLOADS_BUCKET_REGION,
    BUCKET: process.env.REACT_APP_DEV_S3_UPLOADS_BUCKET_NAME,
  },
  apiGateway: {
    REGION: process.env.REACT_APP_DEV_API_GATEWAY_REGION,
    URL: process.env.REACT_APP_DEV_API_GATEWAY_URL,
  },
  cognito: {
    REGION: process.env.REACT_APP_DEV_COGNITO_REGION,
    USER_POOL_ID: process.env.REACT_APP_DEV_COGNITO_USER_POOL_ID,
    APP_CLIENT_ID: process.env.REACT_APP_DEV_COGNITO_APP_CLIENT_ID,
    IDENTITY_POOL_ID: process.env.REACT_APP_DEV_IDENTITY_POOL_ID,
  },
};

const prod = {
  s3: {
    REGION: process.env.REACT_APP_PROD_S3_UPLOADS_BUCKET_REGION,
    BUCKET: process.env.REACT_APP_PROD_S3_UPLOADS_BUCKET_NAME,
  },
  apiGateway: {
    REGION: process.env.REACT_APP_PROD_API_GATEWAY_REGION,
    URL: process.env.REACT_APP_PROD_API_GATEWAY_URL,
  },
  cognito: {
    REGION: process.env.REACT_APP_PROD_COGNITO_REGION,
    USER_POOL_ID: process.env.REACT_APP_PROD_COGNITO_USER_POOL_ID,
    APP_CLIENT_ID: process.env.REACT_APP_PROD_COGNITO_APP_CLIENT_ID,
    IDENTITY_POOL_ID: process.env.REACT_APP_PROD_IDENTITY_POOL_ID,
  },
};

// Default to dev if not set
const config = process.env.REACT_APP_STAGE === 'prod' ? prod : dev;

export default {
  // Add common config values here
  MAX_ATTACHMENT_SIZE: 5000000,
  ...config,
};
