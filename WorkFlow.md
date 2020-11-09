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
       - Function -> serverless.yml -> Test -> Refactoring
   - Serverless unit Test
   - API Gateway CORS 설정
   - Deploy the APIs
   - Cognito Identity Pool
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
   - API Gateway and Lambda Logs & Debugging (CloudWatch)
   - Serverless
     - Environment variables
     - Stages
     - Custom IAM Policy
     - Node.js Starter
     - serverless-bundle
     - Lerna or Yarn 작업 영역 사용
   - DynamoDB Backups
   - Multiple AWS Profiles
   - IAM auth 으로 API Gateway에 연결
   - Cognito ID ID 및 사용자 풀 ID 매핑

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

- 서버리스 프로젝트 구성
- 마이크로 서비스 + Monorepo
  - 디렉토리 구조, 장점, 단점, 대응 패턴(Multi Repo, Monolith), 실용적인 접근법
- 교차 스택 참조
  - CloudForamion 내보내기(CDK, Serverless), CloudFormation 가져오기, 장점
- 서비스 간 코드 공유
  - package.json 구조화, 공통 코드 및 구성 공유, 공통 serverless.yml 구성 공유
- 서비스 간 API Enpoint 공유
- 종속성이 있는 서버리스 앱 배포

2. 환경 구성

- 서버리스 앱 환경
- AWS 계정에서 환경 구조화
- AWS Organizations를 사용해 AWS 계정 관리
- 서버리스 리소스 이름 매개변수화
- 여러 AWS 계정에 배포
  - 리소스 저장소 배포
  - API 서비스 저장소 배포
- 환경 관련 구성 관리
- 서버리스 앱에 비밀 저장
- AWS 계정간에 Route 53 도메인 공유
- 환경에 대한 사용량 모니터링

3. 개발 수명주기

- 서버리스 앱 작업
- Lambda 함수를 로컬로 호출
- API Gateway 엔드포인트를 로컬로 호출
- 기능 환경 만들기
- Pull Request 환경 만들기
- 프로덕션으로 승격
- 롤백 변경
- 업데이트 된 서비스만 배포

4. API Gateway 및 Lambda 함수 디버깅

- AWS X-Ray
