- https://serverless-stack.com/

---

## 0. 목차

1. AWS 계정 설정
   - AWS 계정 설정
   - IAM 사용자 생성
     - IAM이란
     - ARN이란
   - AWS CLI 구성
2. Serverless Backend 설정
   - DynamoDB 테이블 생성
   - Cognito 사용자 풀 생성
     - Cognito 테스트 사용자 만들기
   - Serverless 프레임워크 설정
     - ES6 및 Typescript에 대한 지원 추가
   - 백엔드 저장소 초기화
3. Serverless REST API 설정
   - Create Note
   - Get Note
   - Get Notes
   - Update Note
   - Delete Note
   - 타사 API
     - Stripe 계정 설정
     - 결제 API
     - .env에서 비밀로드
     - 결제 API 테스트
   - Serverless Unit Test
   - API Gateway CORS 오류 처리
4. Backend 배포
   - API 배포
   - Cognito 자격 증명 풀 생성
   - API Test
5. React App 설정
   - React App 생성
   - React Router로 경로 처리
   - AWS Amplify 설정
6. React App Build
   - 로그인 페이지
   - 가입 페이지
   - 노트 생성 페이지
   - 모든 메모 나열
   - 메포 표시
   - 설정 페이지
   - 보안 페이지
7. Backend Production 배포
8. Frontend Production 배포
9. 오류 모니터링 및 디버깅

---

## 1. AWS 계정 설정

1. AWS 계정 설정
   - https://aws.amazon.com/ 에서 무료 계정 생성
2. IAM 사용자 생성
   - IAM으로 AWS에서 사용자, 사용자 권한을 관리
   - AWS Console -> IAM -> Users -> Add User -> 프로그래밍 액세스 방식 선택 -> 기존 정책 직접 연결 -> Create User
   - Access Key ID 및 Secret Access Key 기록
   - **IAM이란**
     1. IAM 사용자
     2. IAM 정책
     3. IAM 역할
     4. IAM 그룹
   - **ARN이란**
3. AWS CLI 구성
   - AWS CLI 설치
   - AWS CLI에 액세스 키 추가
     - aws configure
       - Access Key ID 및 Secret Access Key 등록

---

## 2. Serverless Backend 설정

1. DynamoDB 테이블 생성
   - AWS Console -> DynamoDB -> Create Table
   - Table Name 및 Primary Key 입력 (DynamoDB 각 테이블에는 기본키가 있으며 한번 설정하면 바꿀수 없음, DynamoDB는 두가지 종류의 기본키를 지원(Partition Key, Sort Key))
     - DynamoDB 인덱스 작동 방식 : http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.CoreComponents.html
   - Use default settings 체크해제 -> Provisioned 대신 On-demand 선택 (On-demand 용량은 DynamoDB의 요청당 지불모드임, 방금 시작한 경우 Provisioned 용량모다 훨씬 저렴함) -> Create
     - 프로덕션에서 DynamoDB 백업 설정 : https://serverless-stack.com/chapters/backups-in-dynamodb.html
2. S3 Bucket 생성
   - AWS Console -> S3 -> Create Bucket -> Bucket Name 및 Region -> Create Bucket
   - **CORS 활성화**
     - 기본적으로 S3는 다른 도메인에서 리소스에 액세스하는 것을 허용하지 않음, CORS 설정으로 한 도메인에 로드된 클라이언트 웹 응용 프로그램이 다른 도메인의 리소스와 상호작용하는 방법을 정의함.
     - 생성한 bucket 선택 -> Permissions -> CORS Configuration
       ```json
       [
         {
           "AllowedHeaders": ["*"],
           "AllowedMethods": ["GET", "PUT", "POST", "HEAD", "DELETE"],
           "AllowedOrigins": ["*"],
           "ExposeHeaders": [],
           "MaxAgeSeconds": 3000
         }
       ]
       ```
3. Cognito 사용자 풀 생성
   - Note App의 사용자 계정과 인증을 처리하기 위해 AWS Congnito 사용
   - AWS Console -> Cognito -> Manage Your User Pools -> Create a User Pool -> Pool Name 입력 및 Review defaults 선택 -> Username attributes 선택 -> Email address or phone number 허용 선택 (사용자가 사용자 이름으로 이메일, 폰번호를 사용해 가입하고 로그인할 수 있음) -> Create Pool
     - Pool ID 및 Pool ARN 및 region 저장
   - App Clients -> Add an app client -> App Client Name 입력, Generate client secret 해제 -> 로그인 서버 기반 인증을 위한 API 사용 체크 -> Create app client
     - App Client ID 저장
   - Domain Name -> 고유한 도메인 이름 입력 후 Save
   - **Congnito 테스트 사용자 만들기**
     - AWS CLI 에서 이메일, 암호로 사용자 등록
       - aws cognito-idp sign-up
     - 사용자 확인
       - aws cognito-idp admin-confirm-sign-up
4. Serverless 프레임워크 설정

   - Lambda와 API Gateway로 Backend 생성
   - npm i serverless -g
   - serverless install --url https://github.com/AnomalyInnovations/serverless-nodejs-starter --name notes-api
   - cd notes-api
     - handler.js, serverless.yml 등이 포함되어 있음
   - Nodejs 패키지 설치
     - npm install
     - npm i -D aws-sdk
     - npm i uuid@7.0.3
   - 서비스 이름 업데이트

     - serverless.yml

       ```yml
       service: notes-api

       # Create an optimized package for our functions
       package:
       individually: true

       plugins:
         - serverless-bundle # Package our functions with Webpack
         - serverless-offline
         - serverless-dotenv-plugin # Load .env as environment variables

       provider:
       name: aws
       runtime: nodejs12.x
       stage: prod
       region: us-east-1
       ```

   - **ES6 및 Typescript에 대한 지원 추가**
     - AWS Lambda는 Nodejs v10.x 및 v12.x를 지원함
     - serverless-bundle로 babel,typescript,webpack을 대체
     - serverless-nodejs-starter or serverless-typescript-starter 프로젝트 자동 시작 가능
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
     - 최적화된 패키지
       - 기본적으로 Serverless 프레임워크는 모든 Lambda함수에 대한 단일 패키지를 생성함. 다른 모든 Lambda 함수 포함. 이는 앱의 크기가 커짐에 따라 성능에 부정적인 영향을 미치며 패키지가 커질수록 콜드 스타트가 길어짐.
       - serverless.yml
         ```yml
         package:
           individually: true
         ```
       - 위 옵션으로 webpack의 트리쉐이킹 알고리즘을 사용해 최적화, Lambda함수를 실행하는데 필요한 코드만 포함함.
         - https://webpack.js.org/guides/tree-shaking/

5. 백엔드 저장소 초기화
   - Github -> New Repository
   - git init -> add -> commit -> remote -> push

---

## 3. Serverless REST API 설정

1. Create Note

   - create.js
   - serverless.yml

     ```yml
     service: notes-api

     # Create an optimized package for our functions
     package:
     individually: true

     plugins:
     - serverless-bundle # Package our functions with Webpack
     - serverless-offline
     - serverless-dotenv-plugin # Load .env as environment variables

     provider:
     name: aws
     runtime: nodejs12.x
     stage: prod
     region: us-east-1

     # These environment variables are made available to our functions
     # under process.env.
     environment:
         tableName: notes

     # 'iamRoleStatements' defines the permission policy for the Lambda function.
     # In this case Lambda functions are granted with permissions to access DynamoDB.
     iamRoleStatements:
         - Effect: Allow
         Action:
             - dynamodb:Scan
             - dynamodb:Query
             - dynamodb:GetItem
             - dynamodb:PutItem
             - dynamodb:UpdateItem
             - dynamodb:DeleteItem
             - dynamodb:DescribeTable
         Resource: "arn:aws:dynamodb:us-east-1:*:*"

     functions:
     # Defines an HTTP API endpoint that calls the main function in create.js
     # - path: url path is /notes
     # - method: POST request
     # - cors: enabled CORS (Cross-Origin Resource Sharing) for browser cross
     #     domain api call
     # - authorizer: authenticate using the AWS IAM role
     create:
         handler: create.main
         events:
         - http:
             path: notes
             method: post
             cors: true
             authorizer: aws_iam
     ```

   - Test
     - mkdir mocks
     - mocks/create-event.json
       ```json
       {
         "body": "{\"content\":\"hello world\",\"attachment\":\"hello.jpg\"}",
         "requestContext": {
           "identity": {
             "cognitoIdentityId": "USER-SUB-1234"
           }
         }
       }
       ```
       - serverless invoke local --function create --path mocks/create-event.json
       - AWS_PROFILE=myProfile serverless invoke local --function create --path mocks/create-event.json
         - AWS 프로필 구성 : https://serverless-stack.com/chapters/configure-multiple-aws-profiles.html
   - 코드 리팩토링
     - create.js
     - libs/dynamodb-lib.js

2. Get Note
3. Get Notes
4. Update Note
5. Delete Note
6. 타사 API
7. Serverless Unit Test
8. API Gateway CORS 오류 처리

---

## 4. Backend 배포

---

## 5. React App 설정

1. React App 생성

- npx create-react-app notes-app-client --use-npm
- cd notes-app-client
- npm start
- public/index.html
  - title 태그 변경
- **프론트엔드 저장소 초기화**
  - New Repo -> init -> add -> commit -> remote -> push
- **앱 파비콘 추가**
  - public/favicon.ico
  - 모든 브라우저와 모바일 플랫폼에서 작동하는 파비콘을 설정하기 위해 http://realfavicongenerator.net/ Favicon Generator 서비스를 사용
  - public/manifest.json
    ```json
    {
      "short_name": "Scratch",
      "name": "Scratch Note Taking App",
      "icons": [
        {
          "src": "android-chrome-192x192.png",
          "sizes": "192x192",
          "type": "image/png"
        },
        {
          "src": "android-chrome-256x256.png",
          "sizes": "256x256",
          "type": "image/png"
        }
      ],
      "start_url": ".",
      "display": "standalone",
      "theme_color": "#ffffff",
      "background_color": "#ffffff"
    }
    ```
  - public/index.html
    ```html
    <meta name="theme-color" content="#000000" />
    <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico" />
    <link rel="apple-touch-icon" href="logo192.png" />
    <meta
      name="description"
      content="Web site created using create-react-app"
    />
    ```
  - 브라우저 /favicon-32x32.png 에서 확인
- **사용자 정의 글꼴 설정**
  - Google Fonts 사용
  - Google 글꼴 포함
    - public/index.html
      ```html
      <link
        rel="stylesheet"
        type="text/css"
        href="https://fonts.googleapis.com/css?family=PT+Serif|Open+Sans:300,400,600,700,800"
      />
      ```
    - src/index.css
      ```css
      body {
        margin: 0;
        padding: 0;
        font-family: 'Open Sans', sans-serif;
        font-size: 16px;
        color: #333;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        font-family: 'PT Serif', serif;
      }
      ```
- **부트 스트랩 설정**
  - React Bootstrap 설치
    - npm i react-bootstrap@0.33.1
  - Bootstrap 스타일 추가
    - public/index.html
      ```html
      <link
        rel="stylesheet"
        href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"
      />
      ```
    - src/index.css
      ```css
      select.form-control,
      textarea.form-control,
      input.form-control {
        font-size: 16px;
      }
      input[type='file'] {
        width: 100%;
      }
      ```

2. React Router로 경로 처리

- npm i react-router-dom@5.1.2
- src/index.js

  ```javascript
  import { BrowserRouter as Router } from 'react-router-dom';

  ReactDOM.render(
    <Router>
      <App />
    </Router>,
    document.getElementById('root')
  );
  ```

- **컨테이너 만들기**

  1. Navbar 추가

  - src/App.js

    ```javascript
    import React from 'react';
    import { Link } from 'react-router-dom';
    import { Navbar } from 'react-bootstrap';
    import './App.css';

    function App() {
      return (
        <div className="App container">
          <Navbar fluid collapseOnSelect>
            <Navbar.Header>
              <Navbar.Brand>
                <Link to="/">Scratch</Link>
              </Navbar.Brand>
              <Navbar.Toggle />
            </Navbar.Header>
          </Navbar>
        </div>
      );
    }

    export default App;
    ```

  - src/App.css

    ```css
    .App {
      margin-top: 15px;
    }

    .App .navbar-brand {
      font-weight: bold;
    }
    ```

  2. 홈 컨테이너 추가

  - src/containers/Home.js

    ```javascript
    import React from 'react';
    import './Home.css';

    export default function Home() {
      return (
        <div className="Home">
          <div className="lander">
            <h1>Scratch</h1>
            <p>A simple note taking app</p>
          </div>
        </div>
      );
    }
    ```

  - src/containers/Home.css

    ```css
    .Home .lander {
      padding: 80px 0;
      text-align: center;
    }

    .Home .lander h1 {
      font-family: 'Open Sans', sans-serif;
      font-weight: 600;
    }

    .Home .lander p {
      color: #999;
    }
    ```

  3. 경로 설정

  - src/Routes.js

    ```javascript
    import React from 'react';
    import { Route, Switch } from 'react-router-dom';
    import Home from './containers/Home';

    export default function Routes() {
      return (
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
        </Switch>
      );
    }
    ```

  4. 경로 렌더링

  - src/App.js

    ```javascript
    import Routes from './Routes';

    function App() {
      return (
        <div className="App container">
          <Navbar fluid collapseOnSelect>
            <Navbar.Header>
              <Navbar.Brand>
                <Link to="/">Scratch</Link>
              </Navbar.Brand>
              <Navbar.Toggle />
            </Navbar.Header>
          </Navbar>
          <Routes />
        </div>
      );
    }
    ```

- **Navbar에 링크 추가**

  - src/App.js

    ```javascript
    import { Link } from 'react-router-dom';
    import { Nav, Navbar, NavItem } from 'react-bootstrap';

    function App() {
      return (
        <div className="App container">
          <Navbar fluid collapseOnSelect>
            <Navbar.Header>
              <Navbar.Brand>
                <Link to="/">Scratch</Link>
              </Navbar.Brand>
              <Navbar.Toggle />
            </Navbar.Header>
            <Navbar.Collapse>
              <Nav pullRight>
                <NavItem href="/signup">Signup</NavItem>
                <NavItem href="/login">Login</NavItem>
              </Nav>
            </Navbar.Collapse>
          </Navbar>
          <Routes />
        </div>
      );
    }
    ```

  - npm i react-router-bootstrap
  - src/App.js

    ```javascript
    import { LinkContainer } from 'react-router-bootstrap';

    function App() {
      return (
        <div className="App container">
          <Navbar fluid collapseOnSelect>
            <Navbar.Header>
              <Navbar.Brand>
                <Link to="/">Scratch</Link>
              </Navbar.Brand>
              <Navbar.Toggle />
            </Navbar.Header>
            <Navbar.Collapse>
              <Nav pullRight>
                <LinkContainer to="/signup">
                  <NavItem>Signup</NavItem>
                </LinkContainer>
                <LinkContainer to="/login">
                  <NavItem>Login</NavItem>
                </LinkContainer>
              </Nav>
            </Navbar.Collapse>
          </Navbar>
          <Routes />
        </div>
      );
    }
    ```

- **404s 처리**

  - src/containers/NotFound.js

    ```javascript
    import React from 'react';
    import './NotFound.css';

    export default function NotFound() {
      return (
        <div className="NotFound">
          <h3>Sorry, page not found!</h3>
        </div>
      );
    }
    ```

  - src/containers/NotFound.css
    ```css
    .NotFound {
      padding-top: 100px;
      text-align: center;
    }
    ```
  - Catch All 루트 추가

    - src/Routes.js

      ```javascript
      import NotFound from './containers/NotFound';

      {
        /* Finally, catch all unmatched routes */
      }
      <Route>
        <NotFound />
      </Route>;
      ```

3. AWS Amplify 설정

- npm i aws-amplify
- src/config.js
  ```javascript
  export default {
    s3: {
      REGION: 'YOUR_S3_UPLOADS_BUCKET_REGION',
      BUCKET: 'YOUR_S3_UPLOADS_BUCKET_NAME',
    },
    apiGateway: {
      REGION: 'YOUR_API_GATEWAY_REGION',
      URL: 'YOUR_API_GATEWAY_URL',
    },
    cognito: {
      REGION: 'YOUR_COGNITO_REGION',
      USER_POOL_ID: 'YOUR_COGNITO_USER_POOL_ID',
      APP_CLIENT_ID: 'YOUR_COGNITO_APP_CLIENT_ID',
      IDENTITY_POOL_ID: 'YOUR_IDENTITY_POOL_ID',
    },
  };
  ```
- AWS Amplify 추가

  - src/index.js

    ```javascript
    import { Amplify } from 'aws-amplify';
    import config from './config';

    Amplify.configure({
      Auth: {
        mandatorySignIn: true,
        region: config.cognito.REGION,
        userPoolId: config.cognito.USER_POOL_ID,
        identityPoolId: config.cognito.IDENTITY_POOL_ID,
        userPoolWebClientId: config.cognito.APP_CLIENT_ID,
      },
      Storage: {
        region: config.s3.REGION,
        bucket: config.s3.BUCKET,
        identityPoolId: config.cognito.IDENTITY_POOL_ID,
      },
      API: {
        endpoints: [
          {
            name: 'notes',
            endpoint: config.apiGateway.URL,
            region: config.apiGateway.REGION,
          },
        ],
      },
    });
    ```

- 변경사항 커밋
  - add -> commit -> push

---

## 6. React App Build

1. 로그인 페이지

- 컨테이너 추가
  - src/containers/Login.js
  - src/containers/Login.css
- 경로 추가
  - src/Routes.js
- **AWS Cognito로 로그인**
  - AWS Amplify에서 인증 가져오기
  - Amazon Cognito에 로그인
- **상태에 세션 추가**
  - 앱 상태 업데이트
  - 컨텍스트에 세션 저장
  - 컨텍스트를 사용해 상태 업데이트
  - 로그아웃 버튼 만들기
- **세션에서 상태로드**
  - 사용자 세션 로드
  - 상태가 준비되면 렌더링
- **로그아웃시 세션 지우기**
- **로그인 및 로그아웃시 리디렉션**
  - 로그인시 홈으로 이동
  - 로그아웃 후 로그인으로 리디렉션
- **로그인 하는 동안 피드백 제공**
  - isLoading 플래그 사용
  - 로더 버튼 만들기
  - isLoading 플래그를 사용해 렌더링
  - 오류 처리
- **양식 필드를 처리하기위한 사용자 지정 React Hook 만들기**
  - Custom Hook 생성
  - Custom Hook 사용

2. 가입 페이지

- **가입 양식 만들기**
  - 컨테이너 추가
    - src/containers/Signup.js
    - src/containers/Signup.css
  - 경로추가
    - src/Routes.js
- **AWS Cognito에 가입**
  - src/containers/Signup.js

3. 노트 생성 페이지

- 컨테이너 추가
  - src/containers/NewNote.js
  - src/containers/NewNote.css
- 경로추가
  - src/Routes.js
- **생성 API 호출**
  - src/containers/NewNote.js
- **S3에 파일 업로드**
  - S3에 업로드
    - src/libs/awsLib.js
    - src/containers/NewNote.js

4. 모든 메모 나열

- src/containers/Home.js
- **목록 API 호출**
  - 요청하기
    - src/containers/Home.js
  - 목록 렌더링

5. 메모 표시

- 경로 추가
  - src/Routes.js
- 컨테이너 추가
  - src/containers/Notes.js
- **메모 양식 렌더링**
  - src/containers/Notes.js
  - src/containers/Notes.css
- **메모에 변경 사항 저장**
  - src/containers/Notes.js
- **메모 삭제**
  - src/containers/Notes.js

6. 설정 페이지

- src/containers/Settings.js
- src/Routes.js
- src/App.js
- **구성에 스트라이프 키 추가**
- **결제 양식 만들기**
- **결제 양식 연결**

7. 보안 페이지

- **리디렉션하는 경로 만들기**
  - src/components/AuthenticatedRoute.js
  - src/components/UnauthenticatedRoute.js
- **리디렉션 경로 사용**
  - src/Routes.js
- **로그인시 리디렉션**
  - src/components/UnauthenticatedRoute.js
  - src/containers/Login.js

---

## 7. Backend Production 배포

1. 생산 준비

- 리포지토리 재구성
  - mkdir -p services/notes
  - mv _.js _.json \*.yml .env services/notes
  - mv tests libs mocks node_modules services/notes
- serverless.yml 업데이트
  - stage: dev
- 변경사항 커밋
  - add -> commit

2. 코드로서의 인프라란

- serverless 프레임워크는 serverless.yml을 CloudFormation 템플릿으로 변환함. 콘솔을 통해 수동으로 AWS 리소스를 생성하는 대신 프로그래밍 방식을 사용할 것임. 이러한 방식을 Infrastructure as Code라고 함.
- Infrastructure as Code의 이점
  1. 간단한 명령으로 설정을 간단히 복제할 수 있음
  2. 모든 변경사항을 만들고 테스트할 수 있는 개발환경을 만들 수 있음. 사용자가 상호 작용하는 프로덕션 환경과 별도로 유지할 수 있음.
- AWS CloudFormation
  - CloudFormation은 템플릿(JSON or YAML)을 가져와 이를 기반으로 프로비저닝하는 AWS 서비스임.
  - DynamoDB 테이블용 CloudFormation 템플릿
    ```yml
    Resources:
      NotesTable:
        Type: AWS::DynamoDB::Table
        Properties:
          TableName: ${self:custom.tableName}
          AttributeDefinitions:
            - AttributeName: userId
              AttributeType: S
            - AttributeName: noteId
              AttributeType: S
          KeySchema:
            - AttributeName: userId
              KeyType: HASH
            - AttributeName: noteId
              KeyType: RANGE
          BillingMode: PAY_PER_REQUEST
    ```
  - serverless.yml을 실행하면 이를 CloudFormation 템플릿으로 변환하고 AWS에 제출함. serverless deploy를 실행하면 serverless remove를 실행해 이전에 생성한 CloudFormation 스택을 제거함.
- CloudFormation의 문제
  - CloudFormation 템플릿에서 앱에 필요한 모든 리소스를 정의해야 하기 때문에 코드 줄수가 길어짐
  - CloudFormation 템플릿에 대한 가파른 학습 곡선
- **AWS CDK란**
  - DynamoDB 테이블을 생성하는 CloudFormation 템플릿
    ```yml
    const table = new dynamodb.Table(this, "notes", {
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'noteId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });
    ```
  - CDK 작동원리
    - CDK는 내부적으로 CloudFormation을 사용함. 코드를 CloudFormation 템플릿으로 변환함.
- **서버리스 프레임워크와 함께 AWS CDK 사용**
  - 서버리스 프레임워크 앱 아키텍처
    - 각 서비스는 대상 AWS 계정에 CloudFormation 스택으로 배포됨. 이를 사용자 지정하기 위해 단계, 리전 및 AWS 프로필을 지정할 수 있음
      - AWS_PROFILE=development serverless deploy --stage dev --region us-east-1
  - CDK 앱 아키텍처
    - AWS CDK 앱은 여러 스택으로 구성됨. 각 스택은 AWS CloudFormation 스택으로 대상 AWS 계정에 배포됨. 그러나 서버리스 앱과 달리 각 스택은 다른 AWS 계정 또는 리전에 배포할 수 있음.
    - CDK 스택을 배포할 AWS 계정과 리전을 정의
      - new MyStack(app, "my-stack", { env: { account: "1234", region: "us-east-1" } });
  - Enter, 서버리스 스택 툴킷
    - SST를 사용하면 서버리스 프레임워크와 동일한 규칙을 따를수 있음.
      - Lambda 함수 배포
        - AWS_PROFILE=production serverless deploy --stage prod --region us-east-1
      - 나머지 AWS 인프라에 CDK 사용
        - AWS_PROFILE=production npx sst deploy --stage prod --region us-east-1

3. SST로 CDK 앱 빌드

- 새 SST 앱 만들기
  - npx create-serverless-stack resources infrastructure
  - cd infrastructure
  - npx sst build
- 구성 업데이트
  - infrastructure/sst.json
    ```json
    {
      "name": "notes-infra",
      "type": "@serverless-stack/resources",
      "stage": "dev",
      "region": "us-east-1"
    }
    ```
- **CDK에서 DynamoDB 구성**

  - 스택 생성

    - infrastructure/lib/DynamoDBStack.js

      ```javascript
      import { CfnOutput } from '@aws-cdk/core';
      import * as dynamodb from '@aws-cdk/aws-dynamodb';
      import * as sst from '@serverless-stack/resources';

      export default class DynamoDBStack extends sst.Stack {
        constructor(scope, id, props) {
          super(scope, id, props);

          const app = this.node.root;

          const table = new dynamodb.Table(this, 'Table', {
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, // Use on-demand billing mode
            sortKey: { name: 'noteId', type: dynamodb.AttributeType.STRING },
            partitionKey: {
              name: 'userId',
              type: dynamodb.AttributeType.STRING,
            },
          });

          // Output values
          new CfnOutput(this, 'TableName', {
            value: table.tableName,
            exportName: app.logicalPrefixedName('TableName'),
          });
          new CfnOutput(this, 'TableArn', {
            value: table.tableArn,
            exportName: app.logicalPrefixedName('TableArn'),
          });
        }
      }
      ```

    - DynamoDB CDK 패키지 추가, infrastructure/
      - npx sst add-cdk @aws-cdk/aws-dynamodb

  - 스택 추가

    - infrastructure/lib/index.js

      ```javascript
      import DynamoDBStack from './DynamoDBStack';

      // Add stacks
      export default function main(app) {
        new DynamoDBStack(app, 'dynamodb');
      }
      ```

  - 스택 배포
    - infrastructure/
      - npx sst deploy
  - 템플릿 파일 제거
    - infrastructure/
      - rm lib/MyStack.js
      - rm README.md
  - 단위 테스트 수정

    - infrastrucrue/MyStack.test.js
      - mv test/MyStack.test.js test/DynamoDBStack.test.js
    - infrastructure/test/DynamoDBStack.test.js

      ```javascript
      import { expect, haveResource } from '@aws-cdk/assert';
      import * as sst from '@serverless-stack/resources';
      import DynamoDBStack from '../lib/DynamoDBStack';

      test('Test Stack', () => {
        const app = new sst.App();
        // WHEN
        const stack = new DynamoDBStack(app, 'test-stack');
        // THEN
        expect(stack).to(
          haveResource('AWS::DynamoDB::Table', {
            BillingMode: 'PAY_PER_REQUEST',
          })
        );
      });
      ```

    - npx sst test

- **CDK에서 S3 구성**

  - 스택 생성

    - infrastructure/lib/S3Stack.js

      ```javascript
      import * as cdk from '@aws-cdk/core';
      import * as s3 from '@aws-cdk/aws-s3';
      import * as sst from '@serverless-stack/resources';

      export default class S3Stack extends sst.Stack {
        // Public reference to the S3 bucket
        bucket;

        constructor(scope, id, props) {
          super(scope, id, props);

          this.bucket = new s3.Bucket(this, 'Uploads', {
            // Allow client side access to the bucket from a different domain
            cors: [
              {
                maxAge: 3000,
                allowedOrigins: ['*'],
                allowedHeaders: ['*'],
                allowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
              },
            ],
          });

          // Export values
          new cdk.CfnOutput(this, 'AttachmentsBucketName', {
            value: this.bucket.bucketName,
          });
        }
      }
      ```

    - infrastructure/, S3 CDK 패키지 추가
      - npx sst add-cdk @aws-cdk/aws-s3

  - 스택 추가

    - infrastructure/lib/index.js

      ```javascript
      import S3Stack from './S3Stack';
      import DynamoDBStack from './DynamoDBStack';

      // Add stacks
      export default function main(app) {
        new DynamoDBStack(app, 'dynamodb');

        new S3Stack(app, 's3');
      }
      ```

  - 스택 배포
    - infrastrucrue/
      - npx sst deploy

- **CDK에서 Cognito 사용자 풀 구성**

  - 스택 생성

    - infrastrucrue/lib/CognitoStack.js

      ```javascript
      import { CfnOutput } from '@aws-cdk/core';
      import * as cognito from '@aws-cdk/aws-cognito';
      import * as sst from '@serverless-stack/resources';

      export default class CognitoStack extends sst.Stack {
        constructor(scope, id, props) {
          super(scope, id, props);

          const userPool = new cognito.UserPool(this, 'UserPool', {
            selfSignUpEnabled: true, // Allow users to sign up
            autoVerify: { email: true }, // Verify email addresses by sending a verification code
            signInAliases: { email: true }, // Set email as an alias
          });

          const userPoolClient = new cognito.UserPoolClient(
            this,
            'UserPoolClient',
            {
              userPool,
              generateSecret: false, // Don't need to generate secret for web app running on browsers
            }
          );

          // Export values
          new CfnOutput(this, 'UserPoolId', {
            value: userPool.userPoolId,
          });
          new CfnOutput(this, 'UserPoolClientId', {
            value: userPoolClient.userPoolClientId,
          });
        }
      }
      ```

    - Cognito CDK 패키지 추가, infrastructure/
      - npx sst add-cdk @aws-cdk/aws-cognito

  - 스택 추가

    - infrastructure/lib/index.js

      ```javascript
      import S3Stack from './S3Stack';
      import CognitoStack from './CognitoStack';
      import DynamoDBStack from './DynamoDBStack';

      // Add stacks
      export default function main(app) {
        new DynamoDBStack(app, 'dynamodb');

        new S3Stack(app, 's3');

        new CognitoStack(app, 'cognito');
      }
      ```

  - 스택 배포
    - infrastrucrue/
      - npx sst deploy

- **CDK에서 Cognito 자격 증명 풀 구성**

  - 자격 증명 풀 추가

    - infrastructure/lib/CognitoStack.js

      ```javascript
      import { CfnOutput } from '@aws-cdk/core';
      import * as cognito from '@aws-cdk/aws-cognito';
      import * as sst from '@serverless-stack/resources';

      export default class CognitoStack extends sst.Stack {
        constructor(scope, id, props) {
          super(scope, id, props);

          const userPool = new cognito.UserPool(this, 'UserPool', {
            selfSignUpEnabled: true, // Allow users to sign up
            autoVerify: { email: true }, // Verify email addresses by sending a verification code
            signInAliases: { email: true }, // Set email as an alias
          });

          const userPoolClient = new cognito.UserPoolClient(
            this,
            'UserPoolClient',
            {
              userPool,
              generateSecret: false, // Don't need to generate secret for web app running on browsers
            }
          );

          const identityPool = new cognito.CfnIdentityPool(
            this,
            'IdentityPool',
            {
              allowUnauthenticatedIdentities: false, // Don't allow unathenticated users
              cognitoIdentityProviders: [
                {
                  clientId: userPoolClient.userPoolClientId,
                  providerName: userPool.userPoolProviderName,
                },
              ],
            }
          );

          // Export values
          new CfnOutput(this, 'UserPoolId', {
            value: userPool.userPoolId,
          });
          new CfnOutput(this, 'UserPoolClientId', {
            value: userPoolClient.userPoolClientId,
          });
          new CfnOutput(this, 'IdentityPoolId', {
            value: identityPool.ref,
          });
        }
      }
      ```

  - 스택 배포
  - Cognito 인증 역할 추가
  - 스택 재배포

- **SST를 사용해 서버리스 프레임워크 및 CDK 연결**
  - SST 앱 참조
  - 참조 DynamoDB
  - Cognito 인증 역할에 추가

4. 서버리스 인프라 배포

- SST CDK 앱 배포
- 서버리스 API 배포
- 변경사항 커밋

5. 서버리스 배포 자동화

- https://seed.run/blog/how-to-build-a-cicd-pipeline-for-serverless-apps-with-circleci
- **Seed에서 프로젝트 설정**
  - https://console.seed.run/signup 무료 계정 가입
  - Add your first app -> Github 연결
  - Seed가 sst.json과 serverless.yml을 자동 감지 -> Add Service
  - Seed는 사용자를 대신해 AWS 계정에 배포함. 프로젝트에 필요한 권한을 가진 별도의 IAM 사용자 생성
    - cat ~/.aws/credentials
  - Seed는 두개의 환경(dev, prod)를 생성함
  - 자격증명을 입력하고 새앱추가를 클릭함
  - Pipeline 클릭 -> New Service -> services/notes 입력후 Search -> Add Service
  - Manage Deploy Phases -> 모든 서비스가 동시에 배포된다는 것을 알 수 있음 -> Add a Phase 후 API Service를 Phase 2로 이동 -> Update
  - Run unit tests
- **Seed에서 비밀 구성**
  - App Settings에서 dev 선택 -> Show Env Variables
  - App Settings에서 prod 선택 -> Show Env Variables
- **Seed를 통해 배포**
  - npm version patch
  - git push
  - Seed의 dev 단계로 이동해 빌드 진행 확인, 배포는 배포단계에서 지정한 순서대로 수행됨.
- **Seed를 통해 사용자 지정 도메인 설정**
  1. Route53으로 도메인 구매
  - AWS Console -> Route53 -> 도메인 등록 섹션에 도메인 입력 후 확인 -> 사용가능 여부 확인 후 Add to cart -> Continue -> Complete Purchase
  2. Seed에 사용자 지정 도메인 추가
  - Settings -> Edit Custom Domains -> prod 앤드 포인트에 대해 추가

6. 구성된 API 테스트

- 테스트 사용자 만들기
  - aws cognito-idp sign-up \
    --region YOUR_DEV_COGNITO_REGION \
    --client-id YOUR_DEV_COGNITO_APP_CLIENT_ID \
    --username admin@example.com \
    --password Passw0rd!
  - Cognito Admin CLI를 통해 사용자 확인
    - aws cognito-idp admin-confirm-sign-up \
      --region YOUR_DEV_COGNITO_REGION \
      --user-pool-id YOUR_DEV_COGNITO_USER_POOL_ID \
      --username admin@example.com
- API 테스트
  - dev 버전
    - npx aws-api-gateway-cli-test \
      --username='admin@example.com' \
      --password='Passw0rd!' \
      --user-pool-id='YOUR_DEV_COGNITO_USER_POOL_ID' \
      --app-client-id='YOUR_DEV_COGNITO_APP_CLIENT_ID' \
      --cognito-region='YOUR_DEV_COGNITO_REGION' \
      --identity-pool-id='YOUR_DEV_IDENTITY_POOL_ID' \
      --invoke-url='YOUR_DEV_API_GATEWAY_URL' \
      --api-gateway-region='YOUR_DEV_API_GATEWAY_REGION' \
      --path-template='/notes' \
      --method='POST' \
      --body='{"content":"hello world","attachment":"hello.jpg"}'
  - prod 버전
    - npx aws-api-gateway-cli-test \
      --username='admin@example.com' \
      --password='Passw0rd!' \
      --user-pool-id='YOUR_PROD_COGNITO_USER_POOL_ID' \
      --app-client-id='YOUR_PROD_COGNITO_APP_CLIENT_ID' \
      --cognito-region='YOUR_PROD_COGNITO_REGION' \
      --identity-pool-id='YOUR_PROD_IDENTITY_POOL_ID' \
      --invoke-url='YOUR_PROD_API_GATEWAY_URL' \
      --api-gateway-region='YOUR_PROD_API_GATEWAY_REGION' \
      --path-template='/notes' \
      --method='POST' \
      --body='{"content":"hello world","attachment":"hello.jpg"}'

---

## 8. Frontend Production 배포

1. React 배포 자동화

- Frontend 배포를 위해 Netlify를 사용해 React앱을 호스팅하고 배포 자동화를 할 것임
- **CRA에서 환경 관리**

  - src/config.js는 모든 백엔드 리소스에 대한 정보를 저장

  1. CRA의 환경 변수

  - React 앱은 정적 단일 페이지 앱으로 특정 환경에 대해 빌드가 생성되면 해당 환경에 대해 유지됨
    - REACT_APP_TEST_VAR=123 npm start

  2. 무대 환경 변수

  - REACT_APP_STAGE 는 dev or prod
  - src/config.js

    ```javascript
    const dev = {
      STRIPE_KEY: 'YOUR_STRIPE_DEV_PUBLIC_KEY',
      s3: {
        REGION: 'YOUR_DEV_S3_UPLOADS_BUCKET_REGION',
        BUCKET: 'YOUR_DEV_S3_UPLOADS_BUCKET_NAME',
      },
      apiGateway: {
        REGION: 'YOUR_DEV_API_GATEWAY_REGION',
        URL: 'YOUR_DEV_API_GATEWAY_URL',
      },
      cognito: {
        REGION: 'YOUR_DEV_COGNITO_REGION',
        USER_POOL_ID: 'YOUR_DEV_COGNITO_USER_POOL_ID',
        APP_CLIENT_ID: 'YOUR_DEV_COGNITO_APP_CLIENT_ID',
        IDENTITY_POOL_ID: 'YOUR_DEV_IDENTITY_POOL_ID',
      },
    };

    const prod = {
      STRIPE_KEY: 'YOUR_STRIPE_PROD_PUBLIC_KEY',
      s3: {
        REGION: 'YOUR_PROD_S3_UPLOADS_BUCKET_REGION',
        BUCKET: 'YOUR_PROD_S3_UPLOADS_BUCKET_NAME',
      },
      apiGateway: {
        REGION: 'YOUR_PROD_API_GATEWAY_REGION',
        URL: 'YOUR_PROD_API_GATEWAY_URL',
      },
      cognito: {
        REGION: 'YOUR_PROD_COGNITO_REGION',
        USER_POOL_ID: 'YOUR_PROD_COGNITO_USER_POOL_ID',
        APP_CLIENT_ID: 'YOUR_PROD_COGNITO_APP_CLIENT_ID',
        IDENTITY_POOL_ID: 'YOUR_PROD_IDENTITY_POOL_ID',
      },
    };

    // Default to dev if not set
    const config = process.env.REACT_APP_STAGE === 'prod' ? prod : dev;

    export default {
      // Add common config values here
      MAX_ATTACHMENT_SIZE: 5000000,
      ...config,
    };
    ```

- **빌드 스크립트 만들기**

  - 프로젝트를 Netlify에 추가하기 전에 빌드 스크립트 설정

  1. Netlify 빌드 스크립트 추가

  - netlify.toml

    ```toml
    # Global settings applied to the whole site.
    # “base” is directory to change to before starting build, and
    # “publish” is the directory to publish (relative to root of your repo).
    # “command” is your build command.

    [build]
      base    = ""
      publish = "build"
      command = "REACT_APP_STAGE=dev npm run build"

    # Production context: All deploys to the main
    # repository branch will inherit these settings.
    [context.production]
      command = "REACT_APP_STAGE=prod npm run build"

    # Deploy Preview context: All Deploy Previews
    # will inherit these settings.
    [context.deploy-preview]
      command = "REACT_APP_STAGE=dev npm run build"

    # Branch Deploy context: All deploys that are not in
    # an active Deploy Preview will inherit these settings.
    [context.branch-deploy]
      command = "REACT_APP_STAGE=dev npm run build"
    ```

  2. HTTP 상태 코드 처리

  - netlify.toml
    ```toml
    # Always redirect any request to our index.html
    # and return the status code 200.
    [[redirects]]
        from    = "/*"
        to      = "/index.html"
        status  = 200
    ```

  3. 변경 사항 커밋

  - add -> commit -> push

- **Netlify에서 프로젝트 설정**
  - https://app.netlify.com/signup 에서 계정 생성 -> New site from Git -> Github 선택 -> 프로젝트 선택 -> 브랜치 기본값은 master -> Deploy site
- **Netlify의 사용자 지정 도메인**
  - Netlify를 통해 앱에 대한 사용자 지정 도메인 구성
  1. Netlify 사이트 이름 선택
  - Netlify 프로젝트 페이지에서 Site settings 선택 -> Site details에서 Change site name -> URL 입력 후 Save
  2. Netlify 도메인 설정
  - Domain management -> Add custom domain -> 도메인 이름 입력 후 저장 -> add domain
  - Check DNS Configuration -> Route 53
  3. Route 53의 DNS 설정
  - AWS Console -> Route 53 -> Hosted zones -> 구성할 도메인 선택 -> Create Record Set -> A-IPv4 address 선택 및 104.198.14.52로 value 설정 -> Create
  - Create Record Set -> Name에 www -> Type에 CNAME - Canonical name -> Value에 생성한 사이트 URL -> Create
  4. SSL 구성
  - HTTPS -> Let's Encrypt를 사용해 SSL 인증서를 자동으로 프로비저닝

2. 프론트엔드 워크플로우

- Dev Branch에서 일하기
  - git checkout -b "new-feature"
  - add -> commit
- 지점 배포 생성
  - 자체환경에서 이러한 변경사항을 미리 볼 수 있으려면 Netlify에서 분기 배포를 설정해야함
  - Build & Deploy -> Edit settings -> Branch deploys를 All로 선택 후 Save
  - git push -u origin new-feature
  - Preview deploy
    - 이 버전의 프론트엔드 앱을 테스트할 수 있음. 백엔드 API의 개발 버전에 연결됨. 프로덕션 사용자에게 영향을 미치지않고 변경사항을 테스트 할 수 있음.
- 프로덕션으로 푸시
  - git checkout master
  - git merge new-feature
  - git push
- 프로덕션에서 롤백
  - 이전 프로덕션 배포 클릭 -> Publish deploy

---

## 9. 오류 모니터링 및 디버깅

1. 풀스택 서버리스 앱 디버깅

- 디버깅 워크플로우
  1. 프론트엔드
  - 사용자에게 오류가 발생하면 경고를 받음
  - 스택 추적을 포함한 모든 오류 세부정보를 가져옴
  - 백엔드 오류가 발생한 경우 실패한 API를 가져옴
  2. 백엔드
  - API 엔드 포인트에 대한 로그 찾기
  - 모든 AWS 서비스에 대한 자세한 디버그 로그를 가져옴
  - 예상치 못한 오류(메모리 부족, 시간 초과 등) 포착
- 디버깅 설정
  1. 프론트엔드
  - Sentry로 오류 모니터링 및 디버깅
  - React Error Boundary 사용
  2. 백엔드
  - seed 콘솔을 통해 AWS CloudWatch 사용

2. React에서 오류보고 설정

- Sentry 계정 생성
  - Get started -> Create Account -> Create Project -> React -> Sentry.init 부분 복사
- Sentry 설치

  - npm install @sentry/browser --save
  - src/libs/errorLib.js

    ```javascript
    import * as Sentry from '@sentry/browser';

    const isLocal = process.env.NODE_ENV === 'development';

    export function initSentry() {
      if (isLocal) {
        return;
      }

      Sentry.init({ dsn: 'https://your-dsn-id-here@sentry.io/123456' });
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
    ```

    - 위의 Sentry.init 부분을 대시보드에서 복사한줄로 바꾸기

  - src/index.js

    ```javascript
    import { initSentry } from './libs/errorLib';

    initSentry();
    ```

- **React에서 API 오류보고**

  - src/libs/errorLib.js

    ```javascript
    export function onError(error) {
      let errorInfo = {};
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
    ```

- **React에서 오류 경계 구성**

  1. 오류 경계 설정

  - src/components/ErrorBoundary.js

    ```javascript
    import React from 'react';
    import { logError } from '../libs/errorLib';
    import './ErrorBoundary.css';

    export default class ErrorBoundary extends React.Component {
      state = { hasError: false };

      static getDerivedStateFromError(error) {
        return { hasError: true };
      }

      componentDidCatch(error, errorInfo) {
        logError(error, errorInfo);
      }

      render() {
        return this.state.hasError ? (
          <div className="ErrorBoundary">
            <h3>Sorry there was a problem loading this page</h3>
          </div>
        ) : (
          this.props.children
        );
      }
    }
    ```

  - src/components/ErrorBoundary.css
    ```css
    .ErrorBoundary {
      padding-top: 100px;
      text-align: center;
    }
    ```

  2. 오차 경계 사용

  - src/App.js
    ```javascript
    import ErrorBoundary from './components/ErrorBoundary';
    //...
    <ErrorBoundary>
      <AppContext.Provider value={{ isAuthenticated, userHasAuthenticated }}>
        <Routes />
      </AppContext.Provider>
    </ErrorBoundary>;
    ```

  3. 변경사항 커밋

  - add -> commit -> push

  4. 오차 경계 테스트

  - src/containers/Home.js
    ```javascript
    {
      isAuthenticated ? renderNotes() : renderLander();
    }
    ```
  - src/libs/errorLib.js
    ```javascript
    const isLocal = process.env.NODE_ENV === 'development';
    ```
  - git checkout

3. 서버리스에서 설정 오류 로깅

- 백엔드 오류 로깅
  - 코드 오류
  - AWS 서비스 호출 중 오류
  - Lambda 함수 시간 초과 또는 메모리 부족과 같은 예기치 않은 오류
- 디버그 라이브러리 설정

  - services/notes/libs/debug-lib.js

    ```javascript
    import util from 'util';
    import AWS from 'aws-sdk';

    let logs;

    // Log AWS SDK calls
    AWS.config.logger = { log: debug };

    export default function debug() {
      logs.push({
        date: new Date(),
        string: util.format.apply(null, arguments),
      });
    }

    export function init(event, context) {
      logs = [];

      // Log API event
      debug('API event', {
        body: event.body,
        pathParameters: event.pathParameters,
        queryStringParameters: event.queryStringParameters,
      });
    }

    export function flush(e) {
      logs.forEach(({ date, string }) => console.debug(date, string));
      console.error(e);
    }
    ```

- 핸들러 라이브러리 설정

  - services/notes/libs/handler-lib.js

    ```javascript
    import * as debug from './debug-lib';

    export default function handler(lambda) {
      return async function (event, context) {
        let body, statusCode;

        // Start debugger
        debug.init(event, context);

        try {
          // Run the Lambda
          body = await lambda(event, context);
          statusCode = 200;
        } catch (e) {
          // Print debug messages
          debug.flush(e);

          body = { error: e.message };
          statusCode = 500;
        }

        // Return HTTP response
        return {
          statusCode,
          body: JSON.stringify(body),
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
          },
        };
      };
    }
    ```

- 오류 처리기 사용

  ```javascript
  import handler from './libs/handler-lib';

  export const main = handler((event, context) => {
    // Do some work
    const a = 1 + 1;
    // Return a result
    return { result: a };
  });
  ```

- 코드 커밋
  - add -> commit -> push
- 액세스 로그 활성화
- **Lambda 함수의 논리 오류**
  1. 새 브랜치 생성
  2. 일부 잘못된 코드 푸시
  3. 잘못된 코드 배포
  4. 로직 오류 디버그
- **Lambda 함수의 예상치 못한 오류**
  1. Lambda 제한 시간 디버깅
  2. 메모리 부족 오류 디버깅
- **Lambda 함수 외부 오류**
  1. 초기화 오류
  2. 처리기 기능 오류
  3. 변경 사항 롤백
- **API Gateway의 오류**
  1. 잘못된 API 경로
  2. 잘못된 API 메서드
  3. 잘못된 코드 제거
