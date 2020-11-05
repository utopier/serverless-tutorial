# Serverless Javascript Notes App

---

## Features

- Sign Up & Sign In
- CRUD Memo
- Memo는 첨부 파일로 업로드된 파일을 가질 수 있음
- 신용 카드 결제
- 사용자 지정 도메인에서 HTTPS 지원
- 반응형
- 오류 모니터링 및 디버깅 가능

---

## Technologies & Services

- Github
- Lambda, API Gateway, DynamoDB, CloudWatch, SST, Seed
- Cognito
- S3
- Sprite
- React, React Router, Bootstrap, amplify, Netlify, Sentry, CloudFront, Certificate Manager

---

## Backend WorkFlow

1. API 작성
   - AWS CLI 구성 (with IAM)
   - DynamoDB Table 생성
   - S3 bucket 생성 및 CORS 설정
   - Cognito User Pool 생성 및 Test
   - Serverlee Framework 구성
     - ES6, Typescript 지원, 패키지 최적화
   - API 작성 (with Serverless(Lambda, API Gateway))
     - create, get, list, update, delete
   - API Gateway CORS 설정
   - Test APIs
   - Deploy the APIs
2. 배포 자동화
   - CDK App 빌드 (with SST)
     - DynamoDB, S3, Cognito User Pool, Cognito Identity Pool
     - Serverless Framework와 연결
   - Deploy Serverless Infrastructure
     - SST CDK APP, Serverless API
   - 배포 자동화 (with Seed)
     - Setting up, secrets, Deploy, Custom Domian
   - Test APIs
3. 오류 모니터링 및 디버깅
   - Serverless 오류 로깅 설정(with CloudWatch,Seed)
4. Extra Credit
   - Serverless
     - Environment variables
     - Stages
     - Node.js Starter
     - serverless-bundle
   - API Gateway and Lambda Logs
   - DynamoDB Backups
   - Multiple AWS Profiles
   - Custom IAM Policy
   - API Gateway에 IAM auth 연결

---

## Frontend WorkFlow

1. React APP
   - CRA Setting up
     - favicons, custom fonts, Bootstrap
   - React Router
     - containers, navbar, 404
   - Amplify 구성
   - Login page
     - Cognito
   - Signup Page
     - Cognito
   - Create Note Page
     - S3(Upload File)
   - List all the Page
   - Settings Page
   - Secure Pages
2. 배포 자동화
   - CRA 환경 설정
   - Netlify build scripts 생성
   - Netlify Setting up
   - Custom Domains in Netlify
3. 오류 모니터링 및 디버깅
   - React 오류 로깅 설정 (with Sentry, React Error Boundary)
4. Extra Credit
   - CRA
     - Code Splitting
     - Environments
   - Deploy AWS
     - S3, CloudFront, Route 53, SSL
     - domain(Route53, CloudFront, www domain redirect)
   - Amplify
     - User Account 관리(Password(Forgot, Reset, Change), Email(Change))
     - Cognito를 사용한 Facebook Login

---

## Best Practices

1. 대규모 서버리스 앱 구성

- 마이크로 서비스 + Monorepo
  - 디렉토리 구조, 장점, 단점, 대응 패턴(Multi Repo, Monolith), 실용적인 접근법
- 교차 스택 참조
  - CloudForamion 내보내기(CDK, Serverless), CloudFormation 가져오기, 장점
- 서비스 간 코드 공유
  - package.json 구조화, 공통 코드 및 구성 공유, 공통 serverless.yml 구성 공유
- 서비스 간 API Enpoint 공유

2. 환경 구성

- 별도 AWS 계정을 사용해 환경 관리
- 리소스 이름 매개변수화
- 환경별 구성 관리
- 비밀 처리를 위한 모범 사례
- 여러 환경에서 도메인 공유

3. 개발 수명주기

- 로컬에서 작업
- 기능 환경 만들기
- 풀 리퀘스트 환경 만들기
- 프로덕션 승격
- 롤백 처리

4. API Gateway 및 Lambda 함수 디버깅

- AWS X-Ray
