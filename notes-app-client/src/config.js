export default {
  s3: {
    REGION: 'REACT_APP_S3_UPLOADS_BUCKET_REGION',
    BUCKET: 'REACT_APP_S3_UPLOADS_BUCKET_NAME',
  },
  apiGateway: {
    REGION: 'REACT_APP_API_GATEWAY_REGION',
    URL: 'REACT_APP_API_GATEWAY_URL',
  },
  cognito: {
    REGION: 'REACT_APP_COGNITO_REGION',
    USER_POOL_ID: 'REACT_APP_COGNITO_USER_POOL_ID',
    APP_CLIENT_ID: 'REACT_APP_COGNITO_APP_CLIENT_ID',
    IDENTITY_POOL_ID: 'REACT_APP_IDENTITY_POOL_ID',
  },
};
