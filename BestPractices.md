## 목차

1. Introduction
   - 서버리스 앱 구축을 위한 모범 사례
2. Organize a Serverless App
   - 서버리스 프로젝트 구성
   - 서버리스의 교차 스택 참조
   - 서비스 간 코드 공유
   - 서비스간에 API 엔드 포인트 공유
   - 종속성이 있는 서버리스 앱 배포
3. Manage Environments
   - 서버리스 앱 환경
   - AWS 계정에서 환경 구조화
   - AWS Organizations를 사용해 AWS 계정 관리
   - 서버리스 리소스 이름 매개 변수화
   - 여러 AWS 계정에 배포
     - 리소스 저장소 배포
     - API 서비스 저장소 배포
   - 환경 관련 구성 관리
   - 서버리스 앱에 비밀 저장
   - AWS 계정간에 Route53 도메인 공유
   - 환경에 대한 사용량 모니터링
4. Development Lifecycle
   - 서버리스 앱 작업
   - Lambda 함수를 로컬로 호출
   - API Gateway 엔드포인트를 로컬로 호출
   - 기능 환경 만들기
   - Pull Request 환경 만들기
   - 프로덕션으로 승격
   - 롤백 변경
   - 업데이트 된 서비스만 배포
5. Observability
   - X-Ray로 서버리스 앱 추적
6. Conclusion
   - 모범 사례 정리

---

## 1. Introduction

1. 서버리스 앱 구축을 위한 모범 사례
   - **배경**
     - 대규모 서버리스 앱 구축 및 관리시 발생하는 이슈들
       1. 수십개의 상호의존적인 서비스가 있을때 프로젝트 구성방법
       2. 내 환경 관리
       3. 비밀 저장 방법
       4. 프로덕션 환경의 안전성 확인
       5. 개발팀의 워크플로우
       6. 대규모 서버리스 애플리케이션 디버깅 방법
   - **고려해야 될 팀**
     - 대규모 프로젝트에는 적합하나 프로젝트 작업자가 한명일때는 오버 엔지니어링
   - **다루는 내용**
     - 프론트엔드는 첫번째 섹션에서 다룬것과 대부분 동일한 방식
     - 이번 섹션에서는 주로 백엔드 서버리스 부분을 다룸
   - **섹션의 구조**
     - 섹션의 중심 역할을 하는 저장소
       1. 서버리스 인프라
          - 주요 인프라 리소스가 포함된 저장소
          - AWS CDK를 SST와 함께 사용
          - DynamoDB, S3, Cognito
       2. 서버리스 서비스
          - 모든 서비스를 포함하는 단일 저장소
          - 세가지 서비스를 가짐
            - notes-api, billing-api, notify-job

---

## 2. Organize a Serverless App

1. 서버리스 프로젝트 구성
   - **용어**
     1. Service
        - Serverless 프로젝트로서 serverless.yml 파일을 가짐.
     2. Stack
        - CDK를 사용해 CloudFormation Stack을 정의.
     3. Application
        - Application or App은 여러 서비스의 모음.
   - **예제 저장소**
     - notes-api
     - billing-api
     - notify-job
     - CognitoStack, DynamoStack, S3Stack
   - **마이크로 서비스 + Monorepo**
     - Monorepo란
       - 전체 애플리케이션과 단일 서비스가 단일저장소에 존재
     - 마이크로 서비스란
       - 각 서비스를 모듈식으로 경량화
     - 마이크로 서비스 + Monorep의 디렉토리 구조
       ```markup
       - services/
           - billing-api/
           - notes-api/
           - notify-job/
       - infrastrucrue/
       - libs/
       - package.json
       ```
     1. 마이크로 서비스 + Monorepo 장점
        - Lambda 함수는 마이크로 서비스 아키텍처에 적합
          - Lambda 함수의 성능은 함수의 크기와 관련이 있음
          - 특정 이벤트를 처리하는 Lambda함수를 디버깅하는 것이 훨씬 쉬움
          - Lambda 함수를 단일 이벤트와 개념적으로 연결하는 것이 쉬움
        - 서비스간에 코드를 공유하기 가장 쉬운 방법은 단일 저장소를 사용하는 것
     2. 마이크로 서비스 + Monorepo 단점
        - 마이크로 서비스는 애플리케이션의 복잡성을 증가시킬 수 있음
        - 수백개의 Lambda 함수
        - 많은 서비스 및 기능에 대한 배포관리는 복잡함
        - 위의 문제 발생시 Seed, IOpipe, Epsagon, Dashbird와 같은 서비스 활용
   - **대체 패턴**
     1. Multi repo
        - 다중 저장소 접근방식으로 각 저장소에 단일 서버리스 프로젝트가 존재
        - Multi repo 주의 사항
          1. 저장소간 코드 공유를 위해 비공개 NPM 모듈을 사용하거나 공통 공유 라이브러리를 각 저장소에 링크하는 방법을 사용, 두 방법 모두 배포 프로세스가 공유 코드를 수용해야함
          2. 일반적으로 각 서비스의 Lambda 함수수가 증가함. 이로 인해 CloudFormation 리소스 제한에 도달하고 배포 오류가 발생할 수 있음.
     2. Monolith
        - 모놀리식 패턴은 API Gateway <code>{proxy+}</code> 및 <code>ANY</code>방법을 활용해 모든 요청을 단일 Lambda 함수로 라우팅하는 것이 포함됨
          - serverless.yml
            ```yml
            handler: app.main
            events:
              - http:
                  method: any
                  path: /{proxy+}
            ```
        - 단점은 함수의 크기가 계속 커져서 함수 성능이 떨어짐. 또한 Lambda함수를 디버깅하기 어려워짐.
   - **실용적인 접근**
     - 두개의 저장소 활용
     1. serverless-stack-demo-ext-resources
        ```markup
        /
            lib/
                CognitoStack.js
                DynamoDBStack.js
                S3Stack.js
        ```
     2. serverless-stack-demo-ext-api
        ```markup
        /
            libs/
            services/
                notes-api/
                billing-api/
                notify-job/
        ```
2. 서버리스의 교차 스택 참조
   - 서버리스에서 여러 서비스로 작업하는 방법
   - 교차 스택 참조는 한 CloudFormation 탬플릿이 다른 CloudFormation 템플릿 리소스를 참조하는 방법
     - 교차 스택 참조는 이름, 값이 있음
     - 교차 스택 참조는 동일한 지역내에서만 적용됨
     - 이름은 AWS 계정의 특정 지역에 대해 고유해야 함
   - 한 스택이 CloudFormation 내보내기를 생성하고 다른 스택이 이를 가져올대 참조가 생성됨.
   - **CDK로 CloudFormation 내보내기**
   - **서버리스 프레임워크에서 CloudFormation 내보내기**
   - **CloudFormation 내보내기 가져오기**
   - **크로스 스택 참조의 장점**
3. 서비스간 코드 공유
   - **package.json 구조화**
   - **공통 코드 및 구성 공유**
   - **공통 serverless.yml 구성 공유**
4. 서비스간에 API 엔드 포인트 공유
   - **API Gateway에서 경로가 작동하는 방식**
   - **Notes 서비스**
   - **결제 서비스**
5. 종속성이 있는 서버리스 앱 배포
   - **첫번째 배포**
   - **후속 배포**
   - **새 종속성 추가**
   - **CI를 통해 배포**
   - **API에 대한 단계별 배포 관리**

---

## 3. Manage Environments

1. 서버리스 앱의 환경
   - **사용량에 따른 지불 = 여러 개발 환경**
   - **오래 살았던 환경**
   - **임시 환경**
2. AWS 계정에서 환경 구조화
   - **환경 분리**
   - **자원 제한**
   - **통합 결제**
3. AWS Organizations를 사용해 AWS 계정 관리
   - **AWS 계정 생성**
   - **AWS 계정에 액세스**
4. 서버리스 리소스 이름 매개변수화
5. 여러 AWS 계정에 배포
   - **AWS 프로필 구성**
   - **데모 저장소 만들기**
   - 리소스 저장소 배포
   - API 서비스 저장소 배포
6. 환경 관련 구성 관리
    - **앱 간 환경 연결**
7. 서버리스 앱에 비밀 보장
    - **AWS Parameter Store에 비밀 저장**
    - **Lambda에서 SSM 파라미터에 액세스**
8. AWS 계정간에 Route 53 도메인 공유
    - **AWS 계정 전체에서 도메인 위임**
9. 환경에 대한 사용량 모니터링
    - **프리티어**
    - **계정 별 비용 / 사용량 분석**

---

## 4. Development Lifecycle

1. 서버리스 앱 작업
   - 두개의 Repository
     - 인프라 리소스 생성
     - API 서비스 생성
   - 두개의 AWS 계정의 환경 분할
     - Develpoment
     - Production
2. Lambda 함수를 로컬로 호출

   - **Lambda를 로컬로 호출**

     - serverless.yml
       ```yml
       functions:
         get:
           handler: get.main
           events:
             - http:
                 path: notes/{id}
                 method: get
                 cors: true
                 authorizer: aws_iam
       ```
     - get.js

       ```javascript
       import handler from '../../libs/handler-lib';
       import dynamoDb from '../../libs/dynamodb-lib';

       export const main = handler(async (event, context) => {
         const params = {
           TableName: process.env.tableName,
           // 'Key' defines the partition key and sort key of the item to be retrieved
           // - 'userId': Identity Pool identity id of the authenticated user
           // - 'noteId': path parameter
           Key: {
             userId: event.requestContext.identity.cognitoIdentityId,
             noteId: event.pathParameters.id,
           },
         };

         const result = await dynamoDb.get(params);
         if (!result.Item) {
           throw new Error('Item not found.');
         }

         // Return the retrieved item
         return result.Item;
       });
       ```

     - get-event.json
       ```json
       {
         "pathParameters": {
           "id": "578eb840-f70f-11e6-9d1a-1359b3b22944"
         },
         "requestContext": {
           "identity": {
             "cognitoIdentityId": "USER-SUB-1234"
           }
         }
       }
       ```
     - serverless invoke local -f get --path events/get-event.json
     - HTTP 이벤트 객체 예
       - 쿼리 문자열 매개 변수
         ```json
         {
           "queryStringParameters": {
             "key": "value"
           }
         }
         ```
       - 포스트 데이터
         ```json
         {
           "body": "{\"key\":\"value\"}"
         }
         ```

   - **로컬에서 호출된 Lambda 구별**

     - libs/aws-sdk.js 에서 로컬에서 함수를 호출할 때 X-Ray 추적 비활성화

       ```javascript
       import aws from 'aws-sdk';
       import xray from 'aws-xray-sdk';

       // Do not enable tracing for 'invoke local'
       const awsWrapped = process.env.IS_LOCAL ? aws : xray.captureAWS(aws);

       export default awsWrapped;
       ```

3. API Gateway 엔드포인트를 로컬로 호출
    - 로컬에서 API 호출
    - Cognito 자격 증명 풀 인증 모의
    - 여러 서비스 작업
4. 기능 환경 만들기
    - 기능 분기 만들기
    - Seed에서 분기 워크 플로 활성화
    - Seed에서 새 서비스 추가
    - 새로운 기능을 배포하기 위한 푸시
    - 새로운 기능 환경에서 로컬로 작업
5. Pull Request 환경 만들기
    - Seed에서 풀 요청 워크 플로 활성화
    - 풀 요청 생성
    - 마스터에 병합
6. 프로덕션으로 승격
    - 수동으로 홍보하는 이유
    - 변경 세트란 무엇입니까?
7. 롤백 변경
    - 이전 빌드로 롤백
    - 롤백 인프라 변경
8. 업데이트 된 서비스만 배포
    - 전략1 : 서버리스 프레임 워크에서 배포 건너 뛰기
    - 전략2 : Git 로그에서 변경 사항 확인
---

## 5. 관찰 가능성

1. X-Ray로 서버리스 앱 추적

   - AWS X-Ray는 애플리케이션의 요청을 기록하고 시각화하는 서비스
   - **API Gateway 및 Lambda에 대한 X-Ray 추적 활성화**

     - serverless.yml

       ```yml
       provider:
           ...
           tracing:
               apiGateway: true
               lambda: true
           ...
           iamRoleStatements:
               - Effect: Allow
                 Action:
                   ...
                   - xray:PutTraceSegments
                   - xray:PutTelemetryRecords
                 Resource: "*"
       ```

       - Lambda 함수

         ```javascript
         const AWS = require('aws-sdk');
         const dynamodb = new AWS.DynamoDB.DocumentClient();
         const sns = new AWS.SNS();

         exports.main = async function (event) {
           await dynamodb
             .get({
               TableName: 'notes',
               Key: { noteId: 'note1' },
             })
             .promise();

           await sns
             .publish({
               Message: 'test',
               TopicArn: 'arn:aws:sns:us-east-1:113345762000:test-topic',
             })
             .promise();

           return { statusCode: 200, body: 'successful' };
         };
         ```

       - serverless deploy
       - 배포후 API 엔드포인트 호출
         - curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/xxx
       - AWS Console -> AWS X-Ray -> Traces

   - **AWS Lambda에서 호출 한 다른 AWS 서비스에 대해 X-Ray 추적 활성화**
     - npm i aws-xray-sdk
     - Lambda 함수
       ```javascript
       const AWSXRay = require('aws-xray-sdk-core');
       const AWS = AWSXRay.captureAWS(require('aws-sdk'));
       ```
     - serverless deploy
     - curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/xxx

---

## 6. 결론

1. 모범 사례 정리
