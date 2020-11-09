### Reference

- https://www.serverless.com/framework/docs/providers/aws/

---

### 목차

1. Guides
   1. Intro
   - functions, events, resources, services, plugins
   2. Installation
   - node.js, serverlss
   3. Credentials
   - IAM 생성
   - profile 설정(serverless CLI,aws-cli,serverless.yml)
   - invoke local
   4. Services
   - 파일구성, 생성, serverless.yml&handler.js&event.json, 배포, 제거, 버전 고정, 기존 서비스에 서버리스 설치
   5. Functions
   - 구성, 권한, VPC, 환경변수, 태그, 레이어, 로그 그룹 리소스, 배포된 함수 버전 관리, DLQ, KMS, X-Ray, 비동기 호출, 최대 이벤트 기간 및 최대 재시도 횟수, EFS
   6. Events
   - 구성, PathParameters
   7. Resources
   - 구성, 리소스 참조, 리소스 재정의
   8. Deploying
   - deploy, function 배포, package 배포
   9. Testing
   10. Variables
   - 재귀적, serverless.yml 참조속성, 서버리스 코어 변수, 환경변수, CLI 옵션, CloudFormaion 출력, S3 객체, SSM 매개 변수 저장소, AWS Secrets Manager, 다른 파일의 참조 변수, 자바스크립트 파일 참조 변수, 여러 구성 파일, 변수 참조 중첩, 변수 덮어 쓰기, 맞춤 변수 구문, serverless.env.yml 마이그레이션, 의사 매개 변수 참조, 문자열 변수 값을 부울 값으로 읽기
   11. Packaging
   12. IAM
   13. Plugins
   14. Workflow
   15. Serverless.yml
2. CLI references
3. Events
4. Examples

---

## Gudies

---

### 1. Intro

- serverless framework는 코드, 인프라를 관리하고 여러 언어를 지원하며 함수 및 이벤트로 구성된 이벤트 중심의 서버리스 아키텍처를 구축.
- **핵심 개념**
  1. Functions
  - AWS Lambda Function
  - Micro Service와 같은 독립적인 배포 단위
  2. Events
  - AWS Lambda 함수를 트리거하는 모든 것은 Framework에서 Events로 간주됨.
  - AWS Lambda 함수에 대한 이벤트를 정의하면 프레임워크는 해당 이벤트에 필요한 모든 인프라를 자동으로 생성하고 이를 수신하도록 AWS Lambda 함수를 구성함.
  - AWS API Gateway HTTP Enpoint 요청, AWS S3 Bucket 업로드, CloudWatch 타이머, AWS SNS, CloudWatch 경고...
  3. Resources
  - serverless framework는 함수와 이를 트리거하는 이벤트 뿐만아니라 함수가 의존하는 AWS 인프라 구성요소도 배포.
  - AWS 인프라 구성요소
    - AWS DynamoDB 테이블, AWS S3 Bucket, AWS SNS, CloudFormation에서 정의 할 수 있는 모든 것.
  4. Services
  - 함수, 이를 트리거하는 이벤트 및 함수가 사용하는 리소스를 정의함
  - Services는 yml, json, js, ts의 파일형식으로 정의가능.
    - serverless.yml
    - serverless.json
    - serverless.js
    - serverless.ts
  5. Plugins
  - Plugins를 사용해 framework 기능을 확장
  - serverless.yml
    ```yml
    plugins:
      - serverless-offline
      - serverless-secrets
    ```

---

### 2. Installation

1. Node.js 설치
   - Node.js 공식 웹사이트에서 설치
   - Node v6 이상
   - node --version
2. serverless framework 설치
   - npm i -g serverless
   - serverless
   - serverless --version
3. AWS 계정설정

---

### 3. Credentials

- serverless framework는 사용자를 대신해 리소스를 생성,관리 할 수 있도록 클라우드 공급자 계정에 대한 액세스 권한이 필요.

1. AWS 가입
2. IAM 사용자 및 액세스 키 생성
3. serverless config credentials
   - serverless config credentials --provider aws --key AKIAIOSFODNN7EXAMPLE --secret wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
4. aws-cli
   - npm i -g aws-cli
   - aws configure
5. 기존 AWS 프로필 사용
   - serverless deploy --aws-profile devProfile
   - 단계별 프로필
     ```yml
     service: new-service
     provider:
     name: aws
     runtime: nodejs12.x
     stage: ${opt:stage, self:custom.defaultStage}
     profile: ${self:custom.profiles.${opt:stage, self:provider.stage, 'dev'}}
     custom:
     defaultStage: dev
     profiles:
       dev: devProfile
       prod: prodProfile
     ```
6. invoke local을 사용해 프로파일링
   - CLI 명령을 사용해 로컬에서 람다함수를 호출하는 경우 IAM 역할 및 프로필은 serverless.yml 파일에 설정된 것과 다를 수 있음.

---

### 4. Services

1. Organization
   - 단일 서비스
     ```markup
     myService/
         serverless.yml
     ```
   - 여러 서비스
     ```markup
     users/
         serverless.yml
     posts/
         serverless.yml
     comments/
         serverless.yml
     ```
2. 생성

   - serverless create --template aws-nodejs --path myService

3. 생성된 파일

   - **serverless.yml**

     ```yml
     # serverless.yml

     service: users

     provider:
     name: aws
     runtime: nodejs12.x
     stage: dev # Set the default stage used. Default is dev
     region: us-east-1 # Overwrite the default region used. Default is us-east-1
     stackName: my-custom-stack-name-${opt:stage, self:provider.stage, 'dev'} # Overwrite default CloudFormation stack name. Default is ${self:service}-${opt:stage, self:provider.stage, 'dev'}
     apiName: my-custom-api-gateway-name-${opt:stage, self:provider.stage, 'dev'} # Overwrite default API Gateway name. Default is ${opt:stage, self:provider.stage, 'dev'}-${self:service}
     profile: production # The default profile to use with this service
     memorySize: 512 # Overwrite the default memory size. Default is 1024
     deploymentBucket:
         name: com.serverless.${self:provider.region}.deploys # Overwrite the default deployment bucket
         serverSideEncryption: AES256 # when using server-side encryption
         tags: # Tags that will be added to each of the deployment resources
         key1: value1
         key2: value2
     deploymentPrefix: serverless # Overwrite the default S3 prefix under which deployed artifacts should be stored. Default is serverless
     versionFunctions: false # Optional function versioning
     stackTags: # Optional CF stack tags
         key: value
     stackPolicy: # Optional CF stack policy. The example below allows updates to all resources except deleting/replacing EC2 instances (use with caution!)
         - Effect: Allow
         Principal: '*'
         Action: 'Update:*'
         Resource: '*'
         - Effect: Deny
         Principal: '*'
         Action:
             - Update:Replace
             - Update:Delete
         Resource: '*'
         Condition:
             StringEquals:
             ResourceType:
                 - AWS::EC2::Instance

     functions:
     usersCreate: # A Function
         handler: users.create
         events: # The Events that trigger this Function
         - http: post users/create
     usersDelete: # A Function
         handler: users.delete
         events: # The Events that trigger this Function
         - http: delete users/delete

     # The "Resources" your "Functions" use.  Raw AWS CloudFormation goes in here.
     resources:
     Resources:
         usersTable:
         Type: AWS::DynamoDB::Table
         Properties:
             TableName: usersTable
             AttributeDefinitions:
             - AttributeName: email
                 AttributeType: S
             KeySchema:
             - AttributeName: email
                 KeyType: HASH
             ProvisionedThroughput:
             ReadCapacityUnits: 1
             WriteCapacityUnits: 1
     ```

   - **handler.js**

4. Deployment
   - 서비스를 배포하면 serverless.yml의 모든 함수, 이벤트, 리소스가 AWS CloudFormatino 템플릿으로 변환되고 단일 CloudFormation 스택으로 배포됨.
   - serverless deploy
   - serverless deploy --stage prod --region us-east-1
5. Removal
   - AWS 계정에서 서비스 제거
   - serverless remove -v
6. Version Pinning
   - frameworkVersion 속성 정의
   - 정확한 버전
     ```yml
     frameworkVersion: '2.1.0'
     ```
   - 버전 범위
     ```yml
     frameworkVersion: '^2.1.0'
     ```
7. 기존 서비스에서 서버리스 설치
   - npm i -D serverless

---

### 5. Functions

1. Configuration

   - serverless.yml의 functions 속성
   - provider에서 functions 설정을 상속하거나 functions 수준에서 속성을 지정할 수 있음.

   ```yml
   # serverless.yml
   service: myService

   provider:
   name: aws
   runtime: nodejs12.x
   memorySize: 512 # optional, in MB, default is 1024
   timeout: 10 # optional, in seconds, default is 6
   versionFunctions: false # optional, default is true
   tracing:
     lambda: true # optional, enables tracing for all functions (can be true (true equals 'Active') 'Active' or 'PassThrough')

   functions:
   hello:
     handler: handler.hello # required, handler set in AWS Lambda
     name: ${opt:stage, self:provider.stage, 'dev'}-lambdaName # optional, Deployed Lambda name
     description: Description of what the lambda function does # optional, Description to publish to AWS
     runtime: python2.7 # optional overwrite, default is provider runtime
     memorySize: 512 # optional, in MB, default is 1024
     timeout: 10 # optional, in seconds, default is 6
     provisionedConcurrency: 3 # optional, Count of provisioned lambda instances
     reservedConcurrency: 5 # optional, reserved concurrency limit for this function. By default, AWS uses account concurrency limit
     tracing: PassThrough # optional, overwrite, can be 'Active' or 'PassThrough'
   ```

   ```javascript
   //handler.js
   // handler.js
   module.exports.functionOne = function (event, context, callback) {};
   ```

   - 함수를 다른 파일로 분리할때 함수 배열을 지정할 수 있음
     ```yml
     # serverless.yml
     ---
     functions:
       - ${file(../foo-functions.yml)}
       - ${file(../bar-functions.yml)}
     ```
     ```yml
     # foo-functions.yml
     getFoo:
     handler: handler.foo
     deleteFoo:
     handler: handler.foo
     ```

2. Permissions

   - AWS Lambda 함수에는 계정 내의 다른 AWS 인프라 리소스와 상호작용할 수 있는 권한이 필요함. AWS IAM을 통해 설정
   - provider.iamRoleStatements 속성 설정

     ```yml
     # serverless.yml
     service: myService

     provider:
     name: aws
     runtime: nodejs12.x
     iamRoleStatements: # permissions for all of your functions can be set here
         - Effect: Allow
         Action: # Gives permission to DynamoDB tables in a specific region
             - dynamodb:DescribeTable
             - dynamodb:Query
             - dynamodb:Scan
             - dynamodb:GetItem
             - dynamodb:PutItem
             - dynamodb:UpdateItem
             - dynamodb:DeleteItem
         Resource: 'arn:aws:dynamodb:us-east-1:*:*'

     functions:
     functionOne:
         handler: handler.functionOne
         memorySize: 512
     ```

   - role 속성에 IAM 역할 ARN을 추가해 기존 IAM 역할을 사용할 수 있음.
     ```yml
     # serverless.yml
     service: new-service
     provider:
     name: aws
     role: arn:aws:iam::YourAccountNumber:role/YourIamRole
     ```

3. VPC Configuration

   - provider, functions 객체 속성에 vpc.securityGroupIds 및 vpc.subnetIds 속성을 추가해 VPC구성

     ```yml
     # serverless.yml
     service: service-name
     provider:
     name: aws
     vpc:
       securityGroupIds:
         - securityGroupId1
         - securityGroupId2
       subnetIds:
         - subnetId1
         - subnetId2

     functions:
     hello: # this function will overwrite the service level vpc config above
       handler: handler.hello
       vpc:
       securityGroupIds:
         - securityGroupId1
         - securityGroupId2
       subnetIds:
         - subnetId1
         - subnetId2
     users: # this function will inherit the service level vpc config above
       handler: handler.users
     ```

4. Environment Variables

   - provider, functions 객체 속성에 environment 속성을 사용해 환경변수를 설정할 수 있음.

     ```yml
     # serverless.yml
     service: service-name
     provider:
     name: aws
     environment:
       SYSTEM_NAME: mySystem
       TABLE_NAME: tableName1

     functions:
     hello:
       # this function will have SYSTEM_NAME=mySystem and TABLE_NAME=tableName1 from the provider-level environment config above
       handler: handler.hello
     users:
       # this function will have SYSTEM_NAME=mySystem from the provider-level environment config above
       # but TABLE_NAME will be tableName2 because this more specific config will override the default above
       handler: handler.users
       environment:
       TABLE_NAME: tableName2
     ```

5. Tags

   - provider, functions 객체 속성에 tags 속성을 사용해 AWS Console에서 태그별로 함수를 그룹화하거나 공통 태그가 있는 함수를 쉽게 찾을 수 있음(비용 추적, 레거시 코드 추적 유지)

     ```yml
     # serverless.yml
     service: service-name
     provider:
     name: aws
     tags:
       foo: bar
       baz: qux

     functions:
     hello:
       # this function will inherit the service level tags config above
       handler: handler.hello
     users:
       # this function will overwrite the foo tag and inherit the baz tag
       handler: handler.users
       tags:
       foo: quux
     ```

6. Layers
   - functions 객체 속성에 layers 속성을 사용해 함수에서 Lambda 계층을 사용할 수 있음.
     ```yml
     functions:
     hello:
       handler: handler.hello
       layers:
         - arn:aws:lambda:region:XXXXXX:layer:LayerName:Y
     ```
7. Log Group Resources
   - 기본적으로 serverless framework는 Lambda 함수에 대한 LogGroups를 생성함.
   - fucntions의 disableLogs: true로 기본동작으로 해제할 수 있음
     ```yml
     functions:
       hello:
         handler: handler.hello
         disableLogs: true
     ```
8. Versioning Deployed Functions
   - 기본적으로 framwork는 모든 배포에 대한 함수 버전을 생성함.
   - provider의 versionFunctions:false로 기능 해제.
9. DLQ(Dead Letter Queue)

   - AWS Lambda 함수가 실패하면 재시도를 하게 되는데 이또한 실패하는 경우 AWS에는 람다 실패를 추적,진단하는 사용하는 DLQ라는 SNS, SQS에 실패한 요청에 대한 정보를 보내는 기능이 있음.
   - functions의 onError 속성

     - SNS를 통한 DLQ

     ```yml
     service: service

     provider:
     name: aws
     runtime: nodejs12.x

     functions:
     hello:
       handler: handler.hello
       onError: arn:aws:sns:us-east-1:XXXXXX:test # Ref, Fn::GetAtt and Fn::ImportValue are supported as well
     ```

     - SQS가 있는 DLQ

10. KMS Keys

    - Lambda는 AWS Key Management Service(KMS)를 사용해 미사용 환경 변수를 암호화
    - awsKmsKeyArn 속성

      ```yml
      service:
        name: service-name
        awsKmsKeyArn: arn:aws:kms:us-east-1:XXXXXX:key/some-hash

      provider:
        name: aws
        environment:
          TABLE_NAME: tableName1

      functions:
        hello: # this function will OVERWRITE the service level environment config above
          handler: handler.hello
          awsKmsKeyArn: arn:aws:kms:us-east-1:XXXXXX:key/some-hash
          environment:
          TABLE_NAME: tableName2
        goodbye: # this function will INHERIT the service level environment config above
          handler: handler.goodbye
      ```

11. AWS X-Ray Tracing

    - provider, functions의 tracing 속성으로 Lambda 함수에서 AWS X-Ray 추적을 활성화 할 수 있음

      ```yml
      service: myService

      provider:
      name: aws
      runtime: nodejs12.x
      tracing:
        lambda: true

      functions:
        hello:
          handler: handler.hello
          tracing: Active
        goodbye:
          handler: handler.goodbye
          tracing: PassThrough
      ```

12. Asynchronous invocation
    - 함수를 비동기적으로 호출
    - destinations 속성
      ```yml
      functions:
        asyncHello:
          handler: handler.asyncHello
          destinations:
          onSuccess: otherFunctionInService
          onFailure: arn:aws:sns:us-east-1:xxxx:some-topic-name
      ```
    - 최대 이벤트 기간 및 최대 재시도 횟수
      ```yml
      functions:
      asyncHello:
        handler: handler.asyncHello
        maximumEventAge: 7200
        maximumRetryAttempts: 1
      ```
13. EFS Configuration

    - Lambda에서 Amazon EFS를 사용할 수 있음

      ```yml
      # serverless.yml
      service: service-name
      provider: aws

      functions:
        hello:
          handler: handler.hello
          fileSystemConfig:
            localMountPath: /mnt/example
            arn: arn:aws:elasticfilesystem:us-east-1:111111111111:access-point/fsap-0d0d0d0d0d0d0d0d0
          vpc:
            securityGroupIds:
              - securityGroupId1
            subnetIds:
              - subnetId1
      ```

---

### 6. Events

- 이벤트는 함수 실행을 트리거 하는 것.

1. 구성
   - 이벤트는 각 함수에 속하며 events 속성으로 정의
     ```yml
     # 'functions' in serverless.yml
     functions:
     createUser: # Function name
       handler: handler.createUser # Reference to file handler.js & exported function 'createUser'
       events: # All events associated with this function
         - http:
             path: users/create
             method: post
     ```
   - 한 함수당 여러 이벤트를 설정할 수 있음
     ```yml
     # 'functions' in serverless.yml
     functions:
     createUser: # Function name
       handler: handler.users # Reference to file handler.js & exported function 'users'
       events: # All events associated with this function
         - http:
             path: users/create
             method: post
         - http:
             path: users/update
             method: put
         - http:
             path: users/delete
             method: delete
     ```
2. 종류
3. PathParamters
   - 람다 함수에 경로 매개 변수를 전달하도록 HTTP 이벤트 구성
     ```yml
     # 'functions' in serverless.yml
     functions:
     createUser: # Function name
       handler: handler.users # Reference to file handler.js & exported function 'users'
       events: # All events associated with this function
         - http:
             path: users/{id}
             method: get
     ```
4. 배포
   - serverlss deploy

---

### 7. Resources

1. 구성

   - CloudFormation 스택에 모든 종류의 리소스를 연결할 수 있음.
   - resources

     ```yml
     # serverless.yml
     service: usersCrud
     provider: aws
     functions:

     resources: # CloudFormation template syntax
     Resources:
         usersTable:
            Type: AWS::DynamoDB::Table
            Properties:
                TableName: usersTable
                AttributeDefinitions:
                - AttributeName: email
                    AttributeType: S
                KeySchema:
                - AttributeName: email
                    KeyType: HASH
                ProvisionedThroughput:
                ReadCapacityUnits: 1
                WriteCapacityUnits: 1
     ```

2. AWS CloudFormation 리소스 참조
   - 배포되는 CloudFormation 템플릿에서 일관된 이름을 지정하기 위해 표준 패턴을 사용함
     - {Function Name}{Cloud Formation Resource Type}{Resource Name}{SequentialID,instanceId or Random String}
3. AWS CloudFormation 리소스 재정의

   - 특정 CloudFormation 리소스를 재정의해 자체 옵션을 적용할 수 있음.
   - 기존 리소스 재정의시 유의 사항

     - 대문자로 시작
     - Dash는 -로, Underscore는 \_로 변경됨.

       ```yml
       functions:
         write-post:
         handler: handler.writePost
         events:
           - http:
               method: post
               path: ${self:service}/api/posts/new
               cors: true

       resources:
         extensions:
         WriteDashPostLogGroup:
           Properties:
           RetentionInDays: '30'
       ```

---

### 8. Deploying

1. 모두 배포
   - serverless deploy
   - **작동원리**
     - serverless.yml의 모든 구문을 단일 AWS CloudFormation 템플릿으로 변환됨.
   - **팁**
     - CICD 시스템에서 사용
     - verbose 모드를 사용하면 배포 중에 진행상황을 볼 수 있음
       - serverless deploy --verbose
     - AWS CloudFormaion Stack Update 방법을 사용하므로 느림. 더 빨리 하려면 serverless deploy function 사용
     - 기본적으로 stage는 dev, region은 us-east-1
     - CLI에 플래그를 사용해 다른 단계와 지역에 배포 할 수 있음
       - serverless deploy --stage production --region eu-central-1
     - --aws-s3-accelerate를 사용해 S3에 더 빠르게 업로드 할 수 있음
2. function 배포
   - AWS CloudFormation 스택에 영향을 주지 않음. 대신 AWS에서 현재 함수의 zip 파일을 덮어씀. CloudFormation에 의존하지 않기 때문에 훨씬 빠름
   - serverless deploy function --function myFunction
   - **작동원리**
     - framework는 대상 AWS Lambda 함수를 zip 파일로 패키징함.
     - 프레임워크는 이미 업로드 된 함수 .zip 파일의 해시를 가져와서 로컬 .zip파일 해시와 비교함.
     - 두 해시가 동일하면 framework는 종료됨.
     - 이 zip 파일은 CloudFormation 스택이 가리키는 이전 함수와 동일한 이름을 사용해 S3 버킷에 업로드됨.
   - **팁**
     - 개발 중이고 훨씬 더 빠르기 때문에 AWS에서 테스트하려는 경우 사용.
3. package 배포
   - 이미 생성된 배포 디렉토리를 가져와 serverless package 클라우드 공급자에 배포함
   - serverless deploy --package path-to-package
   - **작동원리**
     - --package 플래그에 대한 인수는 이전에 Serverless에 의해 패키징된 디렉터리.
     - 배포 프로세스는 패키지 단계를 건너뛰고 기존 패키지를 사용해 CloudFormation 스택을 배포 및 업데이트함.

---

### 9. Testing

---

### 10. Variables

- Variables를 사용해 serverless.yml에서 구성 값을 동적으로 변경함.
- 사용할 서비스에 대한 비밀을 제공하고 여러 단계로 작업 할 때 유용함.

1. Syntax
   - \${} 대괄호로 묶인 값을 참조해서 변수 값을 사용함
     ```yml
     # serverless.yml file
     yamlKeyXYZ: ${variableSource}
     otherYamlKey: ${variableSource, defaultValue}
     ```
2. 재귀적으로 속성 참조
   ```yml
   provider:
     name: aws
     stage: ${opt:stage, 'dev'}
     environment:
       MY_SECRET: ${file(../config.${opt:stage, self:provider.stage, 'dev'}.json):CREDS}
   ```
   - sls deploy --stage qa 시 config.qa.json 파일 사용
   - --stage 플래그가 제공되지 않으면 config.dev.json 파일 사용
3. serverless.yml의 참조 속성

   ```yml
   service: new-service
   provider: aws
   custom:
     globalSchedule: rate(10 minutes)
     newService: ${self:}
     # the following will resolve identically in other serverless.yml files so long as they define
     # `custom.newService: ${file(<relative-path-to-this-file>/serverless.yml)}`
     exportName: ${self:custom.newService.service}-export

   functions:
     hello:
       handler: handler.hello
       events:
         - schedule: ${self:custom.globalSchedule}
     world:
       handler: handler.world
       events:
         - schedule: ${self:custom.globalSchedule}
     resources:
     Outputs:
       NewServiceExport:
       Value: 'A Value To Export'
       Export:
         Name: ${self:custom.exportName}
   ```

4. 서버리스 코어 변수 참조

   - intanceId, 서버리스 CLI가 실행될때마다 생성되는 임의의 ID로 {sls:} 접두사와 함께 사용

     ```yml
     service: new-service
     provider: aws

     functions:
       func1:
         name: function-1
         handler: handler.func1
         environment:
         APIG_DEPLOYMENT_ID: ApiGatewayDeployment${sls:instanceId}
     ```

5. 환경 변수 참조
   - \${env:SOME_VAR}
     ```yml
     service: new-service
     provider: aws
     functions:
       hello:
         name: ${env:FUNC_PREFIX}-hello
         handler: handler.hello
       world:
         name: ${env:FUNC_PREFIX}-world
         handler: handler.world
     ```
6. CLI 옵션 참조
   - \${opt:some_option}
     ```yml
     service: new-service
     provider: aws
     functions:
       hello:
         name: ${opt:stage}-hello
         handler: handler.hello
       world:
         name: ${opt:stage}-world
         handler: handler.world
     ```
7. CloudFormation 출력 참조
   - CloudFormation 스택 출력 값을 cf:stackName.outputKey 구문을 사용해 서비스에서 사용할 변수의 소스로 참조할 수 있음
     ```yml
     service: new-service
     provider: aws
     functions:
       hello:
         name: ${cf:another-service-dev.functionPrefix}-hello
         handler: handler.hello
       world:
         name: ${cf:another-stack.functionPrefix}-world
         handler: handler.world
     ```
8. S3 객체 참조
   - s3:bucketName/key 구문을 사용해 서비스에서 사용할 변수의 소스로 S3 값을 참조할 수 있음
     ```yml
     service: new-service
     provider: aws
     functions:
       hello:
         name: ${s3:myBucket/myKey}-hello
         handler: handler.hello
     ```
9. SSM 매개 변수 저장소를 사용하는 참조 변수
   - ssm:/path/to/param 구문을 사용해 SSM 매개 변수를 변수의 소스로 참조
     ````yml
     service: ${ssm:/path/to/service/id}-service
     provider:
         name: aws
     functions:
         hello:
             name: ${ssm:/path/to/service/myParam}-hello
             handler: handler.hello
         ```
     ````
10. AWS Secrets Manager를 사용하는 참조 변수
    - AWS Secrets Manager 변수는 SSM을 사용해 참조할 수 있음
    - ssm:/aws/reference/secretsmanager/secret_ID_in_Secrets_Manager~true 구문 사용
      ```yml
      service: new-service
      provider: aws
      functions:
        hello:
          name: hello
          handler: handler.hello
        custom:
          supersecret: ${ssm:/aws/reference/secretsmanager/secret_ID_in_Secrets_Manager~true}
      ```
11. 다른 파일의 참조 변수
    - 다른 yaml, json 파일의 변수를 참조할 수 있음
    - \${file(../myFile.yml):someProperty}
    - \${file(../myFile.json):someProperty}
      ```yml
      # myCustomFile.yml
      globalSchedule: rate(10 minutes)
      ```
      ```yml
      # serverless.yml
      service: new-service
      provider: aws
      custom: ${file(../myCustomFile.yml)} # You can reference the entire file
      functions:
        hello:
          handler: handler.hello
          events:
            - schedule: ${file(../myCustomFile.yml):globalSchedule} # Or you can reference a specific property
        world:
          handler: handler.world
          events:
            - schedule: ${self:custom.globalSchedule} # This would also work in this case
      ```
12. 자바스크립트 파일의 참조 변수

    - \${file(../myFile.js):someModule}
    - \${file(../myFile.js)}

      ```javascript
      // scheduleConfig.js
      module.exports.rate = 'rate(10 minutes)';
      ```

      ```javascript
      // config.js
      module.exports = (serverless) => {
        serverless.cli.consoleLog(
          'You can access Serverless config and methods as well!'
        );

        return {
          property1: 'some value',
          property2: 'some other value',
        };
      };
      ```

      ```yml
      # serverless.yml
      service: new-service
      provider: aws

      custom: ${file(../config.js)}

      functions:
      hello:
        handler: handler.hello
        events:
          - schedule: ${file(../scheduleConfig.js):rate} # Reference a specific module
      ```

13. 여러 구성 파일
    - serverless.yml에 많은 사용자 지정 리소스를 추가하면 전체 파일 코드량이 커지므로 서버리스 변수 구문을 사용해 이를 분할함
      ```yml
      resources:
        Resources: ${file(cloudformation-resources.json)}
      ```
14. 변수 참조 중첩

    - 다른 변수를 기반으로 특정 변수 참조

      ```yml
      service: new-service
      provider: aws
      custom:
        myFlexibleArn: ${env:${opt:stage}_arn}

      functions:
        hello:
          handler: handler.hello
      ```

15. 변수 덮어 쓰기

    - 다른 소스의 변수가 누락된 경우 특정 소스의 기본값을 사용함.

      ```yml
      service: new-service
      provider:
        name: aws
        stage: dev
      custom:
        myStage: ${opt:stage, self:provider.stage}
        myRegion: ${opt:region, 'us-west-1'}
        myCfnRole: ${opt:role, false}
        myLambdaMemory: ${opt:memory, 1024}

      functions:
        hello:
          handler: handler.hello
      ```

16. 맞춤 변수 구문 사용
17. serverless.env.yml 마이그레이션
18. 의사 매개 변수 참조
    - AWS Pseudo 파라미터 참조
      ```yml
      Resources:
          - 'Fn::Join':
              - ':'
              - - 'arn:aws:logs'
                  - Ref: 'AWS::Region'
                  - Ref: 'AWS::AccountId'
                  - 'log-group:/aws/lambda/*:*:*'
      ```
19. 문자열 변수 값을 부울 값으로 읽기
    ```yml
    provider:
      tracing:
        apiGateway: ${strToBool(${ssm:API_GW_DEBUG_ENABLED})}
    ```

---

### 11. Packaging

1. 패키지 CLI 명령
2. 패키지 구성

---

### 12. IAM

1. 기본 IAM Role
2. Custom IAM Role

---

### 13. Plugins

1. Plugins 설치
2. 서비스 로컬 플러그인
3. 플러그인 작성

---

### 14. Workflow

1. Workflow 팁
2. Cheat Sheet

---

### 15. Serverless.yml

- AWS serverless.yml 에서 사용가능한 모든 속성 목록

```yml
# serverless.yml

service: myService

frameworkVersion: '2'
enableLocalInstallationFallback: false # If set to 'true', guarantees that it's a locally (for service, in its node_modules) installed framework which processes the command

disabledDeprecations: # Disable deprecation logs by their codes. Default is empty.
  - DEP_CODE_1 # Deprecation code to disable
  - '*' # Disable all deprecation messages

provider:
  name: aws
  runtime: nodejs12.x
  stage: ${opt:stage, 'dev'} # Set the default stage used. Default is dev
  region: ${opt:region, 'us-east-1'} # Overwrite the default region used. Default is us-east-1
  stackName: custom-stack-name # Use a custom name for the CloudFormation stack
  apiName: custom-api-name # Use a custom name for the API Gateway API
  websocketsApiName: custom-websockets-api-name # Use a custom name for the websockets API
  websocketsApiRouteSelectionExpression: $request.body.route # custom route selection expression
  profile: production # The default profile to use with this service
  memorySize: 512 # Overwrite the default memory size. Default is 1024
  timeout: 10 # The default is 6 seconds. Note: API Gateway current maximum is 30 seconds
  logRetentionInDays: 14 # Set the default RetentionInDays for a CloudWatch LogGroup
  kmsKeyArn: arn:aws:kms:us-east-1:XXXXXX:key/some-hash # KMS key arn which will be used for encryption for all functions
  deploymentBucket:
    name: com.serverless.${self:provider.region}.deploys # Deployment bucket name. Default is generated by the framework
    maxPreviousDeploymentArtifacts: 10 # On every deployment the framework prunes the bucket to remove artifacts older than this limit. The default is 5
    blockPublicAccess: true # Prevents public access via ACLs or bucket policies. Default is false
    serverSideEncryption: AES256 # server-side encryption method
    sseKMSKeyId: arn:aws:kms:us-east-1:xxxxxxxxxxxx:key/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa # when using server-side encryption
    sseCustomerAlgorithim: AES256 # when using server-side encryption and custom keys
    sseCustomerKey: string # when using server-side encryption and custom keys
    sseCustomerKeyMD5: md5sum # when using server-side encryption and custom keys
    tags: # Tags that will be added to each of the deployment resources
      key1: value1
      key2: value2
  deploymentPrefix: serverless # The S3 prefix under which deployed artifacts should be stored. Default is serverless
  role: arn:aws:iam::XXXXXX:role/role # Overwrite the default IAM role which is used for all functions
  rolePermissionsBoundary: arn:aws:iam::XXXXXX:policy/policy # ARN of an Permissions Boundary for the role.
  cfnRole: arn:aws:iam::XXXXXX:role/role # ARN of an IAM role for CloudFormation service. If specified, CloudFormation uses the role's credentials
  cloudFront:
    myCachePolicy1: # used as a reference in function.events[].cloudfront.cachePolicy.name
      DefaultTTL: 60
      MinTTL: 30
      MaxTTL: 3600
      Comment: my brand new cloudfront cache policy # optional
      ParametersInCacheKeyAndForwardedToOrigin:
        CookiesConfig:
          CookieBehavior: whitelist # Possible values are 'none', 'whitelist', 'allExcept' and 'all'
          Cookies:
            - my-public-cookie
        EnableAcceptEncodingBrotli: true # optional
        EnableAcceptEncodingGzip: true
        HeadersConfig:
          HeadersBehavior: whitelist # Possible values are 'none' and 'whitelist'
          Headers:
            - authorization
            - content-type
        QueryStringsConfig:
          QueryStringBehavior: allExcept # Possible values are 'none', 'whitelist', 'allExcept' and 'all'
          QueryStrings:
            - not-cached-query-string
  versionFunctions: false # Optional function versioning
  environment: # Service wide environment variables
    serviceEnvVar: 123456789
  endpointType: regional # Optional endpoint configuration for API Gateway REST API. Default is Edge.
  apiKeys: # List of API keys to be used by your service API Gateway REST API
    - myFirstKey
      value: myFirstKeyValue
      description: myFirstKeyDescription
      customerId: myFirstKeyCustomerId
    - ${opt:stage}-myFirstKey
    - ${env:MY_API_KEY} # you can hide it in a serverless variable
  apiGateway: # Optional API Gateway global config
    restApiId: xxxxxxxxxx # REST API resource ID. Default is generated by the framework
    restApiRootResourceId: xxxxxxxxxx # Root resource ID, represent as / path
    restApiResources: # List of existing resources that were created in the REST API. This is required or the stack will be conflicted
      '/users': xxxxxxxxxx
      '/users/create': xxxxxxxxxx
    websocketApiId: # Websocket API resource ID. Default is generated by the framework
    apiKeySourceType: HEADER # Source of API key for usage plan. HEADER or AUTHORIZER.
    minimumCompressionSize: 1024 # Compress response when larger than specified size in bytes (must be between 0 and 10485760)
    description: Some Description # Optional description for the API Gateway stage deployment
    binaryMediaTypes: # Optional binary media types the API might return
      - '*/*'
    metrics:  false # Optional detailed Cloud Watch Metrics
    shouldStartNameWithService: false # Use `${service}-${stage}` naming for API Gateway. Will be `true` by default in next major version.
  alb:
    targetGroupPrefix: xxxxxxxxxx # Optional prefix to prepend when generating names for target groups
    authorizers:
      myFirstAuth:
        type: 'cognito'
        userPoolArn: 'arn:aws:cognito-idp:us-east-1:123412341234:userpool/us-east-1_123412341', # required
        userPoolClientId: '1h57kf5cpq17m0eml12EXAMPLE', # required
        userPoolDomain: 'your-test-domain' # required
        onUnauthenticatedRequest: 'deny' # If set to 'allow' this allows the request to be forwarded to the target when user is not authenticated. When omitted it defaults 'deny' which makes a HTTP 401 Unauthorized error be returned. Alternatively configure to 'authenticate' to redirect request to IdP authorization endpoint.
        requestExtraParams: # optional. The query parameters (up to 10) to include in the redirect request to the authorization endpoint
          prompt: 'login'
          redirect: false
        scope: 'first_name age' # Can be a combination of any system-reserved scopes or custom scopes associated with the client. The default is openid
        sessionCookieName: '🍪' # The name of the cookie used to maintain session information. The default is AWSELBAuthSessionCookie
        sessionTimeout: 7000 # The maximum duration of the authentication session, in seconds. The default is 604800 seconds (7 days).
      mySecondAuth:
        type: 'oidc'
        authorizationEndpoint: 'https://example.com', # required. The authorization endpoint of the IdP. Must be a full URL, including the HTTPS protocol, the domain, and the path
        clientId: 'i-am-client', # required
        clientSecret: 'i-am-secret', # if creating a rule this is required. If modifying a rule, this can be omitted if you set useExistingClientSecret to true (as below)
        useExistingClientSecret: true # only required if clientSecret is omitted
        issuer: 'https://www.iamscam.com', # required. The OIDC issuer identifier of the IdP. This must be a full URL, including the HTTPS protocol, the domain, and the path
        tokenEndpoint: 'http://somewhere.org', # required
        userInfoEndpoint: 'https://another-example.com' # required
        onUnauthenticatedRequest: 'deny' # If set to 'allow' this allows the request to be forwarded to the target when user is not authenticated. Omit or set to 'deny' (default) to make a HTTP 401 Unauthorized error be returned instead. Alternatively configure to 'authenticate' to redirect request to IdP authorization endpoint.
        requestExtraParams:
          prompt: 'login'
          redirect: false
        scope: 'first_name age'
        sessionCookieName: '🍪'
        sessionTimeout: 7000
  httpApi:
    id: 'my-id' # If we want to attach to externally created HTTP API its id should be provided here
    name: 'dev-my-service' # Use custom name for the API Gateway API, default is ${opt:stage, self:provider.stage, 'dev'}-${self:service}
    payload: '1.0' # Specify payload format version for Lambda integration ('1.0' or '2.0'), default is '1.0'
    cors: true # Implies default behavior, can be fine tuned with specficic options
    authorizers:
      # JWT authorizers to back HTTP API endpoints
      someJwtAuthorizer:
        identitySource: $request.header.Authorization
        issuerUrl: https://cognito-idp.us-east-1.amazonaws.com/us-east-1_xxxxx
        audience:
          - xxxx
          - xxxx
  usagePlan: # Optional usage plan configuration
    quota:
      limit: 5000
      offset: 2
      period: MONTH
    throttle:
      burstLimit: 200
      rateLimit: 100
  stackTags: # Optional CF stack tags
    key: value
  iamManagedPolicies: # Optional IAM Managed Policies, which allows to include the policies into IAM Role
    - arn:aws:iam:*****:policy/some-managed-policy
  iamRoleStatements: # IAM role statements so that services can be accessed in the AWS account
    - Effect: 'Allow'
      Action:
        - 's3:ListBucket'
      Resource:
        Fn::Join:
          - ''
          - - 'arn:aws:s3:::'
            - Ref: ServerlessDeploymentBucket
  stackPolicy: # Optional CF stack policy. The example below allows updates to all resources except deleting/replacing EC2 instances (use with caution!)
    - Effect: Allow
      Principal: '*'
      Action: 'Update:*'
      Resource: '*'
    - Effect: Deny
      Principal: '*'
      Resource: '*'
      Action:
        - Update:Replace
        - Update:Delete
      Condition:
        StringEquals:
          ResourceType:
            - AWS::EC2::Instance
  vpc: # Optional VPC. But if you use VPC then both subproperties (securityGroupIds and subnetIds) are required
    securityGroupIds:
      - securityGroupId1
      - securityGroupId2
    subnetIds:
      - subnetId1
      - subnetId2
  notificationArns: # List of existing Amazon SNS topics in the same region where notifications about stack events are sent.
    - 'arn:aws:sns:us-east-1:XXXXXX:mytopic'
  stackParameters:
    - ParameterKey: 'Keyname'
      ParameterValue: 'Value'
  resourcePolicy:
    - Effect: Allow
      Principal: '*'
      Action: execute-api:Invoke
      Resource:
        - execute-api:/*/*/*
      Condition:
        IpAddress:
          aws:SourceIp:
            - '123.123.123.123'
    rollbackConfiguration:
      MonitoringTimeInMinutes: 20
      RollbackTriggers:
        - Arn: arn:aws:cloudwatch:us-east-1:000000000000:alarm:health
          Type: AWS::CloudWatch::Alarm
        - Arn: arn:aws:cloudwatch:us-east-1:000000000000:alarm:latency
          Type: AWS::CloudWatch::Alarm
  tags: # Optional service wide function tags
    foo: bar
    baz: qux
  tracing:
    apiGateway: true
    lambda: true # Optional, can be true (true equals 'Active'), 'Active' or 'PassThrough'
  logs:
    restApi: # Optional configuration which specifies if API Gateway logs are used. This can either be set to `true` to use defaults, or configured via subproperties.
      accessLogging: true # Optional configuration which enables or disables access logging. Defaults to true.
      format: 'requestId: $context.requestId' # Optional configuration which specifies the log format to use for access logging.
      executionLogging: true # Optional configuration which enables or disables execution logging. Defaults to true.
      level: INFO # Optional configuration which specifies the log level to use for execution logging. May be set to either INFO or ERROR.
      fullExecutionData: true # Optional configuration which specifies whether or not to log full requests/responses for execution logging. Defaults to true.
      role: arn:aws:iam::123456:role # Existing IAM role for ApiGateway to use when managing CloudWatch Logs. If 'role' is not configured, a new role is automatically created.
      roleManagedExternally: false # Specifies whether the ApiGateway CloudWatch Logs role setting is not managed by Serverless. Defaults to false.
    websocket: # Optional configuration which specifies if Websocket logs are used. This can either be set to `true` to use defaults, or configured via subproperties.
      level: INFO # Optional configuration which specifies the log level to use for execution logging. May be set to either INFO or ERROR.
    httpApi: # Optional configuration which specifies if HTTP API logs are used. This can either be set to `true` (to use defaults as below) or specific log format configuration can be provided
      format: '{ "requestId":"$context.requestId", "ip": "$context.identity.sourceIp", "requestTime":"$context.requestTime", "httpMethod":"$context.httpMethod","routeKey":"$context.routeKey", "status":"$context.status","protocol":"$context.protocol", "responseLength":"$context.responseLength" }'

    frameworkLambda: true # Optional, whether to write CloudWatch logs for custom resource lambdas as added by the framework

package: # Optional deployment packaging configuration
  include: # Specify the directories and files which should be included in the deployment package
    - src/**
    - handler.js
  exclude: # Specify the directories and files which should be excluded in the deployment package
    - .git/**
    - .travis.yml
  excludeDevDependencies: false # Config if Serverless should automatically exclude dev dependencies in the deployment package. Defaults to true
  artifact: path/to/my-artifact.zip # Own package that should be used. You must provide this file.
  individually: true # Enables individual packaging for each function. If true you must provide package for each function. Defaults to false

functions:
  usersCreate: # A Function
    handler: users.create # The file and module for this specific function.
    name: ${opt:stage, self:provider.stage, 'dev'}-lambdaName # optional, Deployed Lambda name
    description: My function # The description of your function.
    memorySize: 512 # memorySize for this specific function.
    reservedConcurrency: 5 # optional, reserved concurrency limit for this function. By default, AWS uses account concurrency limit
    provisionedConcurrency: 3 # optional, Count of provisioned lambda instances
    runtime: nodejs12.x # Runtime for this specific function. Overrides the default which is set on the provider level
    timeout: 10 # Timeout for this specific function.  Overrides the default set above.
    role: arn:aws:iam::XXXXXX:role/role # IAM role which will be used for this function
    onError: arn:aws:sns:us-east-1:XXXXXX:sns-topic # Optional SNS topic / SQS arn (Ref, Fn::GetAtt and Fn::ImportValue are supported as well) which will be used for the DeadLetterConfig
    kmsKeyArn: arn:aws:kms:us-east-1:XXXXXX:key/some-hash # Optional KMS key arn which will be used for encryption (overwrites the one defined on the provider level)
    disableLogs: false # Disables creation of CloudWatch Log Group
    environment: # Function level environment variables
      functionEnvVar: 12345678
    tags: # Function specific tags
      foo: bar
    vpc: # Optional VPC. But if you use VPC then both subproperties (securityGroupIds and subnetIds) are required
      securityGroupIds:
        - securityGroupId1
        - securityGroupId2
      subnetIds:
        - subnetId1
        - subnetId2
    package:
      include: # Specify the directories and files which should be included in the deployment package for this specific function.
        - src/**
        - handler.js
      exclude: # Specify the directories and files which should be excluded in the deployment package for this specific function.
        - .git/**
        - .travis.yml
      artifact: path/to/my-artifact.zip # Own package that should be use for this specific function. You must provide this file.
      individually: true # Enables individual packaging for specific function. If true you must provide package for each function. Defaults to false
    layers: # An optional list Lambda Layers to use
      - arn:aws:lambda:region:XXXXXX:layer:LayerName:Y # Layer Version ARN
    tracing: Active # optional, can be 'Active' or 'PassThrough' (overwrites the one defined on the provider level)
    condition: SomeCondition # optional, adds 'Condition' clause
    dependsOn: # optional, appends these additional resources to the 'DependsOn' list
      - MyThing
      - MyOtherThing
    destinations: # optional, destinations for async invocations
      onSuccess: functionName # function name or ARN of a target (externally managed lambda, EventBridge event bus, SQS queue or SNS topic)
      onFailure: xxx:xxx:target # function name or ARN of a target (externally managed lambda, EventBridge event bus, SQS queue or SNS topic)
    fileSystemConfig:
      arn: arn:aws:elasticfilesystem:us-east-1:111111111111:access-point/fsap-a1a1a1a1a1a1a1a1a # ARN of EFS Access Point
      localMountPath: /mnt/example # path under which EFS will be mounted and accessible by Lambda function
    events: # The Events that trigger this Function
      - http: # This creates an API Gateway HTTP endpoint which can be used to trigger this function.  Learn more in "events/apigateway"
          path: users/create # Path for this endpoint
          method: get # HTTP method for this endpoint
          cors: true # Turn on CORS for this endpoint, but don't forget to return the right header in your response
          private: true # Requires clients to add API keys values in the `x-api-key` header of their request
          authorizer: # An AWS API Gateway custom authorizer function
            name: authorizerFunc # The name of the authorizer function (must be in this service)
            arn: xxx:xxx:Lambda-Name # Can be used instead of name to reference a function outside of service
            resultTtlInSeconds: 0
            identitySource: method.request.header.Authorization
            identityValidationExpression: someRegex
            type: token # token or request. Determines input to the authorizer function, called with the auth token or the entire request event. Defaults to token
          request: # configure method request and integration request settings
            uri: http://url/{paramName} # Define http endpoint URL and map path parameters for HTTP and HTTP_PROXY requests
            parameters: # Optional request parameter configuration
              paths:
                paramName: true # mark path parameter as required
              headers:
                headerName: true # mark header required
                custom-header: # Optional add a new header to the request
                  required: true
                  mappedValue: context.requestId # map the header to a static value or integration request variable
              querystrings:
                paramName: true # mark query string
            schema: # Optional request schema validation; mapped by content type
              application/json: ${file(create_request.json)} # define the valid JSON Schema for a content-type
            template: # Optional custom request mapping templates that overwrite default templates
              application/json: '{ "httpMethod" : "$context.httpMethod" }'
            passThrough: NEVER # Optional define pass through behavior when content-type does not match any of the specified mapping templates
      - httpApi: # HTTP API endpoint
          method: GET
          path: /some-get-path/{param}
          authorizer: # Optional
            name: someJwtAuthorizer # References by name authorizer defined in provider.httpApi.authorizers section
            scopes: # Optional
              - user.id
              - user.email
      - websocket:
          route: $connect
          routeResponseSelectionExpression: $default # optional, setting this enables callbacks on websocket requests for two-way communication
          authorizer:
            # name: auth    NOTE: you can either use "name" or arn" properties
            arn: arn:aws:lambda:us-east-1:1234567890:function:auth
            identitySource:
              - 'route.request.header.Auth'
              - 'route.request.querystring.Auth'
      - s3:
          bucket: photos
          event: s3:ObjectCreated:*
          rules:
            - prefix: uploads/
            - suffix: .jpg
          existing: true # optional, if you're using an existing Bucket
      - schedule:
          name: my scheduled event
          description: a description of my scheduled event's purpose
          rate: rate(10 minutes)
          enabled: false
          # Note, you can use only one of input, inputPath, or inputTransformer
          input:
            key1: value1
            key2: value2
            stageParams:
              stage: dev
          inputPath: '$.stageVariables'
          inputTransformer:
            inputPathsMap:
              eventTime: '$.time'
            inputTemplate: '{"time": <eventTime>, "key1": "value1"}'
      - sns:
          topicName: aggregate
          displayName: Data aggregation pipeline
          filterPolicy:
            pet:
              - dog
              - cat
          redrivePolicy:
              # (1) ARN
              deadLetterTargetArn: arn:aws:sqs:us-east-1:11111111111:myDLQ
              # (2) Ref (resource defined in same CF stack)
              deadLetterTargetRef: myDLQ
              # (3) Import (resource defined in outer CF stack)
              deadLetterTargetImport:
                arn: MyShared-DLQArn
                url: MyShared-DLQUrl
      - sqs:
          arn: arn:aws:sqs:region:XXXXXX:myQueue
          batchSize: 10
          enabled: true
      - stream:
          arn: arn:aws:kinesis:region:XXXXXX:stream/foo
          batchSize: 100
          maximumRecordAgeInSeconds: 120
          startingPosition: LATEST
          enabled: true
      - msk:
          arn: arn:aws:kafka:us-east-1:111111111111:cluster/ClusterName/a1a1a1a1a1a1a1a1a # ARN of MSK Cluster
          topic: kafkaTopic # name of Kafka topic to consume from
          batchSize: 100 # optional, must be in 1-10000 range
          startingPosition: LATEST # optional, can be set to LATEST or TRIM_HORIZON
          enabled: true # optional, true by default, can be used to disable event without deleting resource
      - alexaSkill:
          appId: amzn1.ask.skill.xx-xx-xx-xx
          enabled: true
      - alexaSmartHome:
          appId: amzn1.ask.skill.xx-xx-xx-xx
          enabled: true
      - iot:
          name: myIoTEvent
          description: An IoT event
          enabled: true
          sql: "SELECT * FROM 'some_topic'"
          sqlVersion: beta
      - cloudwatchEvent:
          event:
            source:
              - 'aws.ec2'
            detail-type:
              - 'EC2 Instance State-change Notification'
            detail:
              state:
                - pending
          # Note, you can use only one of input, inputPath, or inputTransformer
          input:
            key1: value1
            key2: value2
            stageParams:
              stage: dev
          inputPath: '$.stageVariables'
          inputTransformer:
            inputPathsMap:
              eventTime: '$.time'
            inputTemplate: '{"time": <eventTime>, "key1": "value1"}'
      - cloudwatchLog:
          logGroup: '/aws/lambda/hello'
          filter: '{$.userIdentity.type = Root}'
      - cognitoUserPool:
          pool: MyUserPool
          trigger: PreSignUp
          existing: true # optional, if you're referencing an existing User Pool
      - alb:
          listenerArn: arn:aws:elasticloadbalancing:us-east-1:12345:listener/app/my-load-balancer/50dc6c495c0c9188/
          priority: 1
          conditions:
            host: example.com
            path: /hello
          healthCheck: # optional, can also be set using a boolean value
            path: / # optional
            intervalSeconds: 35 # optional
            timeoutSeconds: 30 # optional
            healthyThresholdCount: 5 # optional
            unhealthyThresholdCount: 5 # optional
            matcher: # optional
              httpCode: '200'
      - eventBridge:
          # using the default AWS event bus
          schedule: rate(10 minutes)
          # creating an event bus
          eventBus: custom-saas-events
          pattern:
            source:
              - saas.external
          # re-using an existing event bus
          eventBus: arn:aws:events:us-east-1:12345:event-bus/custom-private-events
          pattern:
            source:
              - custom.private
          inputTransformer:
            inputPathsMap:
              eventTime: '$.time'
            inputTemplate: '{"time": <eventTime>, "key1": "value1"}'
          # using `inputs`
          pattern:
            source:
              - 'aws.ec2'
            detail-type:
              - 'EC2 Instance State-change Notification'
            detail:
              state:
                - pending
          input:
            key1: value1
            key2: value2
            stageParams:
              stage: dev
          # using `inputPath`
          pattern:
            source:
              - 'aws.ec2'
            detail-type:
              - 'EC2 Instance State-change Notification'
            detail:
              state:
                - pending
          inputPath: '$.stageVariables'
          # using `inputTransformer`
          pattern:
            source:
              - 'aws.ec2'
            detail-type:
              - 'EC2 Instance State-change Notification'
            detail:
              state:
                - pending
          inputTransformer:
            inputPathsMap:
              eventTime: '$.time'
            inputTemplate: '{"time": <eventTime>, "key1": "value1"}'
      - cloudFront:
          eventType: viewer-response
          includeBody: true
          pathPattern: /docs*
          cachePolicy:
            # Note, you can use only one of name or id
            name: myCachePolicy1 # Refers to a Cache Policy defined in provider.cloudFront.cachePolicies
            id: 658327ea-f89d-4fab-a63d-7e88639e58f6 # Refers to any external Cache Policy id
          origin:
            DomainName: serverless.com
            OriginPath: /framework
            CustomOriginConfig:
              OriginProtocolPolicy: match-viewer

configValidationMode: warn # Modes for config validation. `error` throws an exception, `warn` logs error to console, `off` disables validation at all. The default is warn.

layers:
  hello: # A Lambda layer
    path: layer-dir # required, path to layer contents on disk
    name: ${opt:stage, self:provider.stage, 'dev'}-layerName # optional, Deployed Lambda layer name
    description: Description of what the lambda layer does # optional, Description to publish to AWS
    compatibleRuntimes: # optional, a list of runtimes this layer is compatible with
      - python3.8
    licenseInfo: GPLv3 # optional, a string specifying license information
    allowedAccounts: # optional, a list of AWS account IDs allowed to access this layer.
      - '*'
    retain: false # optional, false by default. If true, layer versions are not deleted as new ones are created

# The "Resources" your "Functions" use.  Raw AWS CloudFormation goes in here.
resources:
  Resources:
    usersTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: usersTable
        AttributeDefinitions:
          - AttributeName: email
            AttributeType: S
        KeySchema:
          - AttributeName: email
            KeyType: HASH
        ProvisionedThroughput:
          ReadCapacityUnits: 1
          WriteCapacityUnits: 1
  extensions:
    # override Properties or other attributes of Framework-created resources.
    # See https://serverless.com/framework/docs/providers/aws/guide/resources#override-aws-cloudformation-resource for more details
    UsersCreateLogGroup:
      Properties:
        RetentionInDays: '30'

  # The "Outputs" that your AWS CloudFormation Stack should produce.  This allows references between services.
  Outputs:
    UsersTableArn:
      Description: The ARN for the User's Table
      Value:
        'Fn::GetAtt': [usersTable, Arn]
      Export:
        Name: ${self:service}:${opt:stage}:UsersTableArn # see Fn::ImportValue to use in other services and http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/outputs-section-structure.html for documentation on use.
```

---
