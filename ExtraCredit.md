## 목차

1. Serverless
   - API Gateway and Lambda Logs
   - Debuggign Serverless API Issues
   - Serverless environment variables
   - Stages in Serverless Framework
   - Backups in DynamoDB
   - Configure multiple AWS profiles
   - Customize the Serverless IAM Policy
   - Mapping Cognito Identity Id and User Pool Id
   - Connect to API Gateway with IAM auth
   - Serverless Node.js Starter
   - Package Lambdas with serverless-bundle
   - Using Lerna and Yarn Workspaces with Serverless
2. React
   - React Hooks
   - Code Splitting in CRA
   - Environments in CRA
   - Deploying a React App to AWS
     - Create an S3 bucket
     - Deploy to S3
     - Create a CloudFornt distribution
     - Purchase a Domain with Route 53
     - Setup SSL
     - Set up your domain with CloudFront
     - Set up www domain redirect
     - Deploy updates
   - Manage User Accounts in AWS Amplify
     - Handle Forgot and Reset Password
     - Allow Users to Change Passwords
     - Allow Users to Change Thier Email
   - Facebook Login with Cognito using AWS Amplify

---

## Serverless

### 1. API Gateway and Lambda Logs

1. Types of Logs
   - **monolithic 환경의 일반적인 두가지 유형의 로그**
     1. Server logs(API Gateway logs)
        - 웹 서버 로그는 발생한 순서대로 요청 기록을 유지
        - 각 로그 항목에는 클라이언트 IP 주소, 요청 날짜/시간, 요청 경로, HTTP 코드, 제공된 바이트, 사용자 에이전트 등 요청에 대한 정보가 포함됨.
     2. Application logs(Lambda logs)
        - 응용프로그램 로그는 웹 응용 프로그램에서 기록하는 이벤트 파일
        - 오류, 경고 및 정보 이벤트가 포함됨.
        - 예상치 못한 기능 실패, 사용자의 행동방식을 이해하기 위한 주요 이벤트 등
   - 서버리스에서는 기본 인프라의 제어 권한이 적으므로 로깅으로 애플리케이션 성능을 판단할 수 있음.
   - Amazon CloudWatch로 리소스에 대한 지표를 수집, 추적
2. API Gateway CloudWatch Logs 활성화

   - 2가지 단계
     - IAM 역할 생성(API Gateway가 CloudWatch에서 로그를 작성하도록) -> API project 로깅 켜기

   1. IAM 역할 생성
      - AWS console -> IAM -> Roles -> Create Role -> AWS service (API Gateway) -> Next: Permissions -> Next: Review -> Role Name (APIGatewayCloudWatchLogs) 입력 -> Create role
        - Role ARN 보관
   2. 프로젝트에 대한 로깅 설정
      - AWS console -> API Gateway -> Settings -> CloudWatch log role ARN 입력 후 Save -> Stages의 prod -> Logs 탭 -> Enable CloudWatch Logs, Log full requests/responses data, Enable Detailed CloudWatch Metrics 체그 및 Log level은 INFO -> Save Changes

3. Lambda CloudWatch Logs 활성화
   - Lambda CloudWatch Logs는 기본적으로 활성화됨. 각 실행에 대한 기간과 최대 메모리 사용량을 추적함
     ```javascript
     export function main(event, context, callback) {
       console.log('Hello world');
       callback(null, { body: `` });
     }
     ```
4. API Gateway CloudWatch Logs 보기
   - CloudWatch는 로그 항목을 로그 그룹에 그룹화 한 다음 로그 스트임에 추가함. AWS 서비스마다 로그 그룹, 로그 스트림은 달라질 수 있음.
     - API Gateway의 로깅이 처음 활성화되면 1개의 로그그룹 생성, 300개의 로그 스트림 생성. API Gateway는 수신 요청이 있을때 이러한 스트림 중 하나를 선택함.
   - Logs -> API-Gateway-Execution-Logs\_접두사가 붙은 로그 그룹과 API Gateway ID 선택 -> 마지막 이벤트 시간으로 정렬된 300개의 로그 스트림이 표시됨
5. Lambda CloudWatch Logs 보기
   1. AWS Console
      - Labmda 각 함수는 자체 로그 그룹이 있음. 새 버전의 함수가 배포되거나 일정시간 동안 유휴 상태인 경우 로그 스트림이 순환됨.
      - Logs -> /aws/lambda/ 접두사가 붙은 첫번째 로그그룹과 함수 이름 선택 -> 첫번째 스트림 선택 -> 각 함수 호출에 대한 기본 실행정보, START, END, REPORT, console.log가 표시됨
   2. Serverless CLI
      - serverless logs -f func-name
      - serverless logs -f func-name --tail
        - --tail 플래그로 로그를 콘솔에 자동으로 스트리밍

---

### 2. Debugging Serverless API Issues

1. Invalid API Endpoint
   - 요청된 API Gateway 엔드포인트가 유효하지 않은 경우 CloudWatch에 오류가 기록됨.
   - 일반적인 API Gateway Endpoint
     ```markup
     https://API_ID.execure-api.REGION.amazonaws.com/STAGE/PATH
     ```
2. IAM Policy 누락
   - API Endpoint가 aws_iam을 권한부여자로 사용하고 Cognito 자격 증명 풀에 할당된 IAM 역할에 API Gateway 리소스에 대한 execute-api:Invoke 권한이 부여되지 않은 경우 발생
   - 요청이 API Gateway에 도달하지 않았으므로 오류가 CloudWatch 로그에 기록되지 않기 때문에 디버깅하기 까다로움
   - IAM 정책 시뮬레이터를 사용해 Cognito 자격 증명 풀 사용자에 필요한 권한이 있는지 확인하는 검사 수행
   - 시뮬레이터를 사용하기 위해 API Gateway에 연결하는데 사용하는 IAM 역할 이름을 찾아야함
   - AWS Console -> Cognito -> Manage Federated Identities -> 자격 증명 풀 선택 (notes identity pool) -> Edit identity pool -> Authenticated role 보관
   - IAM Policy Simulator -> Roles -> 위 단계에서 적어둔 IAM 역할 선택 -> API Gateway 선택 및 Invoke -> Run Simulation -> IAM 역할이 올바르게 구성된 경우 Permission에 allowed가 표시됨
   - Permission이 denined 일 경우
     - AWS Console -> IAM -> Roles -> 자격 증명 풀이 사용하는 IAM 역할 선택 -> Edit policy
       ```json
       {
         "Effect": "Allow",
         "Action": ["execute-api:Invoke"],
         "Resource": [
           "arn:aws:execute-api:YOUR_API_GATEWAY_REGION:*:YOUR_API_GATEWAY_ID/*"
         ]
       }
       ```
3. Lambda 함수 오류
   - 포작되지 않은 예외로 인해 제대로 실행되지 않으면 오류가 발생함.
   - AWS Lambda는 오류 객체를 문자열로 변환한 다음 스택 추적과 함께 CloudWatch로 전송함. 이는 Lambda 및 API Gateway CloudWatch 로그 그룹 모두에서 관찰됨.
4. Lambda 함수 시간 초과
   - 때때로 Lambda 함수가 시간 초과되는 경우가 발생할 수 있음.
   - callbackWaitsForEmptyEventLoop 속성을 false로 설정해 이벤트 루프에 이벤트가 있더라도 콜백이 호출되는 즉시 프로세스를 중지하도록 함
     ```javascript
     export async function handelr(event, context, callback) {
       context.callbackWaitsForEmptyEventLoop = false;
     }
     ```

---

### 3. Serverless environment variables

1. 환경변수 정의

   - provider, functions에 환경변수 정의 가능

   ```yml
   service: service-name

   provider:
     name: aws
     stage: dev
     environment:
       SYSTEM_ID: jdoe

   functions:
     hello:
       handler: handler.hello
       environment:
         SYSTEM_URL: http://example.com/api/v1
   ```

2. 서버리스 프레임워크의 맞춤 변수

   - 변수를 사용해 동적으로 값을 변경

     ```yml
     service: service-name

     custom:
       systemUrl: http://example.com/api/v1

     provider:
       name: aws
       stage: dev

     functions:
       helloA:
         handler: handler.helloA
         environment:
           SYSTEM_URL: ${self:custom.systemUrl}pathA
       helloB:
         handler: handler.helloB
         environment:
           SYSTEM_URL: ${self:custom.systemUrl}pathB
     ```

---

### 4. Stages in Serverless Framework

1. 스테이징 구현 방법
   - **API Gateway 기본 제공 단계 사용**
     ```markup
     https://abc12345.execute-api.us-east-1.amazonaws.com/prod
     https://abc12345.execute-api.us-east-1.amazonaws.com/dev
     ```
   - **각 단계에 대한 별도의 API**
   ```markup
   https://abc12345.execute-api.us-east-1.amazonaws.com/prod
   https://xyz67890.execute-api.us-east-1.amazonaws.com/dev
   ```
   - **각 단계에 대해 별도의 AWS 계정**
     - 각 단계를 별도의 API로 사용하면 IAM 정책을 조정할 수 있는 유연성이 향상됨.
     - 개발자가 실수로 프로덕션 리소스를 편집/삭제하는 경우를 줄일 수 있음.
2. 스테이지에 배포

   ```yml
   service: service-name

   provider:
     name: aws
     stage: dev
   ```

   - serverless deploy --stage dev

3. 서버리스 프레임 워크의 단계 변수

   ```yml
   service: service-name

   custom:
     myStage: ${opt:stage, self:provider.stage}
     myEnvironment:
       MESSAGE:
         prod: 'production enviromment'
         dev: 'development environment'
   provider:
     name: aws
     stage: dev
     environment:
       MESSAGE: ${self:custom.myEnvironment.MESSAGE.${self:custom.myStage}}
   ```

   ```javascript
   export function main(event, context, callback) {
     callback(null, { body: process.env.MESSAGE });
   }
   ```

---

### 5. Backups in DynamoDB

1. DynamoDB의 백업
   - DynamoDB의 두가지 유형의 백업
     1. On-demand backups
        - 장기적인 데이터 보존 및 보관에 유용함.
        - 테이블이 삭제되더라도 백업은 유지됨.
        - 백업을 사용해 다른 테이블 이름으로 복원할 수 있음.
        - 이는 테이블 복제에 유용함.
     2. Point-in-Time Recovery
        - 특정 시점 복원을 수행
        - 실수로 인한 쓰기, 삭제 작업을 방지하는데 유용함
2. On-demand 백업
   - AWS Console -> DynamoDB -> Tables -> Backups -> Create backup -> 백업 이름 입력 후 Create
3. Restore Backup
   - Restore backup -> 복원하려는 새 테이블 이름 입력 후 Restore table
4. Point-in-Time Recovery
   - Backups -> Status의 Enable 클릭 -> 이 설정에 대해 추가요금이 적용됨
5. Restore to Point-in-Time
   - Restore to point-in-time -> 복원할 테이블 이름 및 복구 할 시간 선택 -> Restore table

---

### 6. Configure multiple AWS profiles

1. Create a New AWS Profile
   - aws configure --profile newAccount
2. Set a Profile on Local
   - serverless invoke local 을 사용해 로컬에서 개발하면 Lambda 함수는 로컬에서 실행되고 아직 배포되지 않음.
   - 기본 AWS 프로필을 serverless invoke local 명령에 대한 새 프로필로 전환
     - AWS_PROFILE=newAccount serverless invoke local --function hello
   - 각 명령에 추가하지 않도록 설정
     - export AWS_PROFILE=newAccount
3. Set a Profile While Deploying

   - serverless deploy --aws-profile newAccount
   - serverless.yml

     ```yml
     service: service-name

     provider:
       name: aws
       stage: dev
       profile: newAccount
     ```

4. Set Profiles per Stage

   - Stage마다 다른 AWS 프로필을 지정하려는 경우
   - serverless deploy --stage prod --aws-profile prodAccount
   - serverless deploy --stage dev --aws-profile devAccount
   - serverless.yml

     ```yml
     service: service-name

     custom:
       myStage: ${opt:stage, self:provider.stage}
       myProfile:
         prod: prodAccount
         dev: devAccount
     provider:
       name: aws
       stage: dev
       profile: ${self:custom.myProfile.${self.custom.myStage}}
     ```

     - serverless deploy --stage prod
     - serverless deploy --stage dev

---

### 7. Customize the Serverless IAM Policy

- serverless 프레임워크는 AWS CLI 프로필의 IAM 자격 증명에 연결된 정책을 사용해 배포함

1. A simple IAM Policy template
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "cloudformation:*",
           "s3:*",
           "logs:*",
           "iam:*",
           "apigateway:*",
           "lambda:*",
           "ec2:DescribeSecurityGroups",
           "ec2:DescribeSubnets",
           "ec2:DescribeVpcs",
           "events:*"
         ],
         "Resource": ["*"]
       }
     ]
   }
   ```
   - Create policy -> Create Your Own Policy의 Select 클릭 -> Policy Name 입력 및 위에서 만든 정책을 Policy document에 넣기 -> Create Policy
2. An advanced IAM Policy template

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "cloudformation:Describe*",
           "cloudformation:List*",
           "cloudformation:Get*",
           "cloudformation:CreateStack",
           "cloudformation:UpdateStack",
           "cloudformation:DeleteStack"
         ],
         "Resource": "arn:aws:cloudformation:<region>:<account_no>:stack/<service_name>*/*"
       },
       {
         "Effect": "Allow",
         "Action": ["cloudformation:ValidateTemplate"],
         "Resource": "*"
       },
       {
         "Effect": "Allow",
         "Action": [
           "s3:CreateBucket",
           "s3:DeleteBucket",
           "s3:Get*",
           "s3:List*"
         ],
         "Resource": ["arn:aws:s3:::<service_name>*"]
       },
       {
         "Effect": "Allow",
         "Action": ["s3:*"],
         "Resource": ["arn:aws:s3:::<service_name>*/*"]
       },
       {
         "Effect": "Allow",
         "Action": ["logs:DescribeLogGroups"],
         "Resource": "arn:aws:logs:<region>:<account_no>:log-group::log-stream:*"
       },
       {
         "Action": [
           "logs:CreateLogGroup",
           "logs:CreateLogStream",
           "logs:DeleteLogGroup",
           "logs:DeleteLogStream",
           "logs:DescribeLogStreams",
           "logs:FilterLogEvents"
         ],
         "Resource": "arn:aws:logs:<region>:<account_no>:log-group:/aws/lambda/<service_name>*:log-stream:*",
         "Effect": "Allow"
       },
       {
         "Effect": "Allow",
         "Action": [
           "iam:GetRole",
           "iam:PassRole",
           "iam:CreateRole",
           "iam:DeleteRole",
           "iam:DetachRolePolicy",
           "iam:PutRolePolicy",
           "iam:AttachRolePolicy",
           "iam:DeleteRolePolicy"
         ],
         "Resource": [
           "arn:aws:iam::<account_no>:role/<service_name>*-lambdaRole"
         ]
       },
       {
         "Effect": "Allow",
         "Action": [
           "apigateway:GET",
           "apigateway:PATCH",
           "apigateway:POST",
           "apigateway:PUT",
           "apigateway:DELETE"
         ],
         "Resource": ["arn:aws:apigateway:<region>::/restapis"]
       },
       {
         "Effect": "Allow",
         "Action": [
           "apigateway:GET",
           "apigateway:PATCH",
           "apigateway:POST",
           "apigateway:PUT",
           "apigateway:DELETE"
         ],
         "Resource": ["arn:aws:apigateway:<region>::/restapis/*"]
       },
       {
         "Effect": "Allow",
         "Action": [
           "lambda:GetFunction",
           "lambda:CreateFunction",
           "lambda:DeleteFunction",
           "lambda:UpdateFunctionConfiguration",
           "lambda:UpdateFunctionCode",
           "lambda:ListVersionsByFunction",
           "lambda:PublishVersion",
           "lambda:CreateAlias",
           "lambda:DeleteAlias",
           "lambda:UpdateAlias",
           "lambda:GetFunctionConfiguration",
           "lambda:AddPermission",
           "lambda:RemovePermission",
           "lambda:InvokeFunction"
         ],
         "Resource": ["arn:aws:lambda:*:<account_no>:function:<service_name>*"]
       },
       {
         "Effect": "Allow",
         "Action": [
           "ec2:DescribeSecurityGroups",
           "ec2:DescribeSubnets",
           "ec2:DescribeVpcs"
         ],
         "Resource": ["*"]
       },
       {
         "Effect": "Allow",
         "Action": [
           "events:Put*",
           "events:Remove*",
           "events:Delete*",
           "events:Describe*"
         ],
         "Resource": "arn:aws:events::<account_no>:rule/<service_name>*"
       }
     ]
   }
   ```

   - serverless.yml

     ```yml
     service: my-service

     provider:
       name: aws
       region: us-east-1
     ```

---

### 8. Mapping Cognito Identity Id and User Pool Id

1. Identity Pool User Id vs User Pool User Id
2. Finding the User Pool User Id

   - 사용자의 사용자 풀 사용자 ID를 찾는 샘플 Lambda 함수

     ```javascript
     export async function main(event, context, callback) {
         const authProvider = event.requestContext.identity.cognitoAuthenticationProvider;
         // Cognito authentication provider looks like:
         // cognito-idp.us-east-1.amazonaws.com/us-east-1_xxxxxxxxx,cognito-idp.us-east-1.amazonaws.com/us-east-1_aaaaaaaaa:CognitoSignIn:qqqqqqqq-1111-2222-3333-rrrrrrrrrrrr
         // Where us-east-1_aaaaaaaaa is the User Pool id
         // And qqqqqqqq-1111-2222-3333-rrrrrrrrrrrr is the User Pool User Id
         const parts = authProvider.split(':');
         const userPoolIdParts = parts[parts.length - 3].split('/');

         const userPoolId = userPoolIdParts[userPoolIdParts.length - 1];
         const userPoolUserId = parts[parts.length - 1];
     ...
     }
     ```

---

### 9. Connect to API Gateway with IAM auth

1. Authenticate a User with Cognito User Pool

   ```javascript
   function login(username, password) {
     const userPool = new CognitoUserPool({
       UserPoolId: USER_POOL_ID,
       ClientId: APP_CLIENT_ID,
     });
     const user = new CognitoUser({ Username: username, Pool: userPool });
     const authenticationData = { Username: username, Password: password };
     const authenticationDetails = new AuthenticationDetails(
       authenticationData
     );

     return new Promise((resolve, reject) =>
       user.authenticateUser(authenticationDetails, {
         onSuccess: (result) => resolve(),
         onFailure: (err) => reject(err),
       })
     );
   }
   ```

   ```javascript
   await login('my_username', 'my_password');
   ```

2. Generate Temporary IAM Credentials

   - 사용자가 인증되면 임시 자격 증명을 생성할 수 있음
   - JWT 사용자 토큰 가져오기
     ```javascript
     function getUserToken(currentUser) {
       return new Promise((resolve, reject) => {
         currentUser.getSession(function (err, session) {
           if (err) {
             reject(err);
             return;
           }
           resolve(session.getIdToken().getJwtToken());
         });
       });
     }
     ```
   - 현재 로그인한 사용자를 가져올 수 있는 위치
     ```javascript
     function getCurrentUser() {
       const userPool = new CognitoUserPool({
         UserPoolId: config.cognito.USER_POOL_ID,
         ClientId: config.cognito.APP_CLIENT_ID,
       });
       return userPool.getCurrentUser();
     }
     ```
   - JWT 토큰을 사용해 임시 IAM 자격 증명 생성

     ```javascript
     function getAwsCredentials(userToken) {
       const authenticator = `cognito-idp.${config.cognito.REGION}.amazonaws.com/${config.cognito.USER_POOL_ID}`;

       AWS.config.update({ region: config.cognito.REGION });

       AWS.config.credentials = new AWS.CognitoIdentityCredentials({
         IdentityPoolId: config.cognito.IDENTITY_POOL_ID,
         Logins: {
           [authenticator]: userToken,
         },
       });

       return AWS.config.credentials.getPromise();
     }
     ```

3. Sign API Gateway Requests with Signature Version 4

   - sigV4Client.js는 crypto-js가 설치되어있어야함.
   - npm i crypto-js

   ```javascript
   // Pseudocode

   sigV4Client.newClient({
     // Your AWS temporary access key
     accessKey,
     // Your AWS temporary secret key
     secretKey,
     // Your AWS temporary session token
     sessionToken,
     // API Gateway region
     region,
     // API Gateway URL
     endpoint,
   });
   ```

   ```javascript
   // Pseudocode

   const signedRequest = client.signRequest({
     // The HTTP method
     method,
     // The request path
     path,
     // The request headers
     headers,
     // The request query parameters
     queryParams,
     // The request body
     body,
   });
   ```

4. Call API Gateway with the sigV4Client

   ```javascript
   function invokeApig({
       path,
       method = "GET",
       headers = {},
       queryParams = {},
       body
   }) {

   const currentUser = getCurrentUser();

   const userToken = await getUserToken(currentUser);

   await getAwsCredentials(userToken);

   const signedRequest = sigV4Client
       .newClient({
       accessKey: AWS.config.credentials.accessKeyId,
       secretKey: AWS.config.credentials.secretAccessKey,
       sessionToken: AWS.config.credentials.sessionToken,
       region: YOUR_API_GATEWAY_REGION,
       endpoint: YOUR_API_GATEWAY_URL
       })
       .signRequest({
       method,
       path,
       headers,
       queryParams,
       body
       });

   body = body ? JSON.stringify(body) : body;
   headers = signedRequest.headers;

   const results = await fetch(signedRequest.url, {
       method,
       headers,
       body
   });

   if (results.status !== 200) {
       throw new Error(await results.text());
   }

   return results.json();
   }
   ```

---

### 10. Serverless Node.js Starter

- Serverless Node.js Starter
  - Typescript는 serverless typescript starter
  - Python은 serverless python starter
- Serverless Node.js Starter는 serverless-bundle, serverless-offline을 지원함
  - Lambda 함수 코드에서 ES6 및 Typescript 사용
  - Webpack으로 최적화된 패키지 생성
  - 로컬에서 API Gateway 실행
  - 단위 테스트 지원
  - 적절한 오류 메시지를 위한 소스맵
  - 단계에 대한 환경변수 추가
  - Webpack, Babel 구성을 관리할 필요가 없음

1. Demo

   - https://z6pv80ao4l.execute-api.us-east-1.amazonaws.com/dev/hello

   ```javascript
   export const hello = async (event, context, callback) => {
     const response = {
       statusCode: 200,
       body: JSON.stringify({
         message: `Go Serverless v1.0! ${await message({
           time: 1,
           copy: 'Your function executed successfully!',
         })}`,
         input: event,
       }),
     };

     callback(null, response);
   };

   const message = ({ time, ...rest }) =>
     new Promise((resolve, reject) =>
       setTimeout(() => {
         resolve(`${rest.copy} (with a delay)`);
       }, time * 1000)
     );
   ```

2. Requirements
   - AWS CLI 구성
   - npm i -g serverless
3. Installation
   - serverless install --url https://github.com/AnomalyInnovations/serverless-nodejs-starter --name my-project
   - cd my-project
   - npm install
4. Usage
   - 로컬에서 함수 실행
     - serverless invoke local --function hello
   - Serverless Offline을 사용해 로컬에서 API Gateway 시뮬레이션
     - serverless offline start
   - 테스트 실행
     - npm test
   - 프로젝트 배포
     - serverless deploy
   - 단일 기능 배포
     - serverless delpoy function --function hello

---

### 11. Package Lambdas with serverless-bundle

- AWS Lambda 함수는 S3 버킷에 zip파일로 저장됨.
- 함수가 호출될때 컨테이너에 로드되는데 이를 수행하는데 걸리는 시간을 콜드스타트시간이라고 함. 콜드스타트에 영향을 미치는 요소 중 하나는 Lambda 함수 패키지 크기임. 패키지가 클수록 Lambda 함수를 호출하는데 오래 걸림.
- 함수가 최근에 호출된 경우 컨테이너가 유지됨. 이 경우 함수가 훨씬 더 빨리 호출되고 이 지연을 웜 시작 시간이라고 함.

1. Optimizing Lambda Packages
   ```yml
   # Create an individual package for our functions
   package:
     individually: true
   ```
2. ES6 and TypeScript
3. Only One Dependency
4. Getting Started
   - npm i -D serverless-bundle
   - serverless.yml
     ```yml
     plugins:
       - serverless-bundle
     ```
   - package.json
     ```json
     "scripts": {
         "test": "serverless-bundle test"
     }
     ```

---

### 12. Using Lerna and Yarn Workspaces with Serverless

1. Installation
2. How It Works
3. Deployment
4. Deploying Through Seed

---

## React

### 1. React Hooks

1. React 클래스 컴포넌트 라이프 사이클
2. React 함수 컴포넌트 라이프 사이클
3. React Hook 추가
4. React Hook 모델
5. 클래스, 함수 컴포넌트의 차이점
6. 요약

---

### 2. Code Splitting in CRA

1. Code Splitting
2. Code Splitting 및 React Router V4
3. 비동기 구성요소 만들기
4. 비동기 구성요소 사용
5. 다음 단계

---

### 3. Environments in CRA

1. 사용자 지정 환경 변수
2. 환경 구성
3. 환경 변수 사용

---

### 4. Deploying a React App to AWS

---

### 5. Create an S3 bucket

- S3에 정적으로 제공될 자산 업로드.
- S3에는 서로 다른 유형의 파일을 구분하기 위한 버킷개념이 있음.
- 버킷은 정적 웹 사이트로 자산을 호스팅하도록 구성할 수도 있으며 공개적으로 액세스할 수 있는 URL이 자동으로 할당됨.

1. 버킷 생성
   - AWS Console -> S3 -> Bucket Name, Region 입력 -> Manage public bucket policies for this bucket 체크 해제 -> Create bucket
2. 권한 추가
   - 기본적으로 버킷은 공개적으로 액세스 할 수 없으므로 S3 버킷 권한을 변경해야함.
   - Permissions -> Bucket Policy -> Save
     ```json
     {
       "Version": "2012-10-17",
       "Statement": [
         {
           "Sid": "PublicReadForGetBucketObjects",
           "Effect": "Allow",
           "Principal": "*",
           "Action": ["s3:GetObject"],
           "Resource": ["arn:aws:s3:::notes-app-client/*"]
         }
       ]
     }
     ```
3. 정적 웹 호스팅 활성화
   - Properties -> Static Website hosting 선택

---

### 6. Deploy to S3

1. 앱 구축
   - npm run build
   - build 디렉터리에 모든 자신이 패키징되어있음
2. S3에 업로드
   - aws s3 sync build/ s3://YOUR_S3_DEPLOY_BUCKET_NAME
   - AWS Console에서 방급 업로드한 파일이 버킷에 있는지 확인

---

### 7. Create a CloudFornt distribution

1. CloudFront 배포
   - AWS Console -> CloudFront -> Create Distribution -> Web, Get Started -> Origin Domain Name에 S3 Bucket URL 입력 -> Compress Objects Automatically(Gzip 자동 압축) -> Default Root Object (index.html) -> Create Distribution
     - 해당 Domain Name으로 접속 가능.
2. 사용자 지정 오류 응답
   - CloudFront, S3가 React Route의 경로를 인식하지 못하기 때문에 경로가 없는 경우에도 200을 반환함
   - Error Pages -> Create Custom Error Response

---

### 8. Purchase a Domain with Route 53

1. Route 53으로 도메인 구매
   - AWS Console -> Route 53

---

### 9. Setup SSL

- 도메인에서 SSL or HTTPS를 사용할 수 있도록 인증서 요청. 이를 위해 AWS Certificate Manager 서비스를 사용.
- AWS Console -> Certificate Manager -> Resion 확인 -> Getting Started -> Domain Name 입력 후 Add another name to this certificate -> Review and Request -> DNS validation -> 도메인들 확장 -> Create record in Route 53 -> Create
- DNS 레코드를 만들고 유효성을 검사하는 프로세스는 약 30분정도 걸림

---

### 10. Set up your domain with CloudFront

- HTTPS를 통해 제공할 도메인과 인증서가 있으므로 이를 CloudFront 배포와 연결

1. CloudFront 배포를 위한 대체 도메인 추가
   - CloudFront -> Edit -> Alternate Domain Names에 새 도메인 이름 입력 -> Custom SSL Certificate 전환 후 방금 만든 인증서 선택 -> Yes, Edit -> Behaviors -> Edit -> Redirect HTTP to HTTPS -> Yes, Edit
2. 도메인을 CloudFront 배포로 지정
   - Route 53 -> Hosted Zones -> 목록에서 도메인 선택 후 Create Record Set -> Name 필드 비워두기 (베어 도메인이 CloudFront 배포를 가리키도록 할 것임), Alias는 Yes, Alias Target은 CloudFront 배포 선택 -> Create
3. IPv6 지원 추가
   - CloudFront 배포에는 기본적으로 IPv6가 활성화되어 있으므로 AAAA 레코드도 생성해야함. 별칭 레코드와 똑같은 방식으로 설정됨.
   - Type으로 AAAA-IPv6를 설정하는 것을 제외하고 이전과 동일한 방식으로 Record Set 생성 -> Create
   - DNS 레코드를 업데이트하는데 약 1시간이 소요될수 있음.

---

### 11. Set up www domain redirect

1. S3 리디렉션 버킷 생성
   - AWS Console -> S3 -> Bucket Name, Resion 입력 -> Create bucket
   - Static website hosting -> Redirect requests 선택 후 리디렉션할 도메인 입력, Protocol을 https -> Save
2. CloudFront 배포 생성
3. WWW 도메인을 CloudFront 배포로 지정
4. IPv6 지원 추가

---

### 12. Deploy updates

1. 앱 구축
   - npm run build
2. S3에 업로드
   - aws s3 sync build/ s3://YOUR_S3_DEPLOY_BUCKET_NAME --delete
3. CloudFront 캐시 무효화
4. 배포 명령 추가
   - package.json
     ```json
     {
       "predeploy": "npm run build",
       "deploy": "aws s3 sync build/ s3://YOUR_S3_DEPLOY_BUCKET_NAME --delete",
       "postdeploy": "aws cloudfront create-invalidation --distribution-id YOUR_CF_DISTRIBUTION_ID --paths '/*' && aws cloudfront create-invalidation --distribution-id YOUR_WWW_CF_DISTRIBUTION_ID --paths '/*'"
     }
     ```
   - npm run deploy

---

### 13. Manage User Accounts in AWS Amplify

---

### 14. Handle Forgot and Reset Password

1. 비밀번호 재설정 양식 추가
2. 경로 추가
3. 로그인 페이지에서 링크

---

### 15. Allow Users to Change Passwords

1. 설정 페이지 추가
2. 비밀번호 변경 양식

---

### 16. Allow Users to Change Thier Email

1. 이메일 양식 변경
2. 미세한 세부 사항

---

### 17. Facebook Login with Cognito using AWS Amplify

1. Facebook 앱 만들기
2. Facebook을 인증 공급자로 추가
3. AWS Amplify로 Facebook 로그인 구성

---
