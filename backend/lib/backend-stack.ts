import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { aws_dynamodb, aws_lambda_nodejs, aws_apigateway, aws_events, aws_events_targets, aws_ssm } from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import path from 'path';
import { LogGroup, LogRetention, RetentionDays } from 'aws-cdk-lib/aws-logs';

const LAMBDA_PATH = '../lambdas'

// Bundling options to skip Docker
const bundlingOptions = {
  minify: false,
  sourceMap: false,
  format: aws_lambda_nodejs.OutputFormat.ESM,
  mainFields: ['module', 'main'],
  banner: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
  forceDockerBundling: false,
}

process.loadEnvFile(path.join(__dirname, '../.env'));

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB - Import existing tables
    const fridgeItemsTable = aws_dynamodb.TableV2.fromTableName(this, 'FridgeLogItem', 'FridgeLogItem')
    const fridgeLogUserTable = aws_dynamodb.TableV2.fromTableName(this, 'FridgeLogUser', 'FridgeLogUser')

    // DynamoDB
    // const fridgeItemsTable = new aws_dynamodb.TableV2(this, 'FridgeLogItem', {
    //   tableName: 'FridgeLogItem',
    //   partitionKey: {name: 'user_email', type: aws_dynamodb.AttributeType.STRING},
    //   sortKey: {name: 'timestamp', type: aws_dynamodb.AttributeType.NUMBER}
    // })
    // fridgeItemsTable.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN)  // prevent deletion on stack removal

    // const fridgeLogUserTable = new aws_dynamodb.TableV2(this, 'FridgeLogUser', {
    //   tableName: 'FridgeLogUser',
    //   partitionKey: {name: 'user_email', type: aws_dynamodb.AttributeType.STRING}
    // })
    // fridgeLogUserTable.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN)  // prevent deletion on stack removal

    // Lambdas & their log groups
    const capturePhotoLogGroup = new LogGroup(this, 'CapturePhotoLogGroup', {
      logGroupName: `/aws/lambda/CapturePhoto`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      retention: RetentionDays.ONE_WEEK
    });
    const CapturePhotoFn = new aws_lambda_nodejs.NodejsFunction(this, 'CapturePhoto', {
      runtime: Runtime.NODEJS_22_X,
      entry: path.join(__dirname, LAMBDA_PATH + '/CapturePhoto/capture_photo.mjs'),
      handler: 'handler',
      timeout: cdk.Duration.seconds(15),
      environment : {
        MOONDREAM_API_KEY: process.env.MOONDREAM_API_KEY || ''
      },
      bundling: {
        ...bundlingOptions,
        nodeModules: ['moondream'],
      },
      depsLockFilePath: path.join(__dirname, LAMBDA_PATH + '/CapturePhoto/package-lock.json'),
      functionName: 'CapturePhoto',
      logGroup: capturePhotoLogGroup
    })

    const checkEmailExistenceLogGroup = new LogGroup(this, 'CheckEmailExistenceLogGroup', {
      logGroupName: `/aws/lambda/CheckEmailExistence`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      retention: RetentionDays.ONE_WEEK
    });
    const CheckEmailExistenceFn = new aws_lambda_nodejs.NodejsFunction(this, 'CheckEmailExistence', {
      runtime: Runtime.NODEJS_22_X,
      entry: path.join(__dirname, LAMBDA_PATH + '/CheckEmailExistence/check_email_existence.mjs'),
      handler: 'handler',
      timeout: cdk.Duration.seconds(15),
      bundling: bundlingOptions,
      functionName: 'CheckEmailExistence',
      logGroup: checkEmailExistenceLogGroup
    })
    
    const deleteItemLogGroup = new LogGroup(this, 'DeleteItemDDBLogGroup', {
      logGroupName: `/aws/lambda/DeleteItemDDB`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      retention: RetentionDays.ONE_WEEK
    });
    const deleteItemDDBFn = new aws_lambda_nodejs.NodejsFunction(this, 'DeleteItemDDB', {
      runtime: Runtime.NODEJS_22_X,
      entry: path.join(__dirname, LAMBDA_PATH + '/DeleteItemDDB/delete_item.mjs'),
      handler: 'handler',
      timeout: cdk.Duration.seconds(15),
      bundling: bundlingOptions,
      functionName: 'DeleteItemDDB',
      logGroup: deleteItemLogGroup
    })
    
    const readDDBLogGroup =  new LogGroup(this, 'ReadDDBLogGroup', {
      logGroupName: `/aws/lambda/ReadDDB`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      retention: RetentionDays.ONE_WEEK
    });
    const ReadDDBFn = new aws_lambda_nodejs.NodejsFunction(this, 'ReadDDB', {
      runtime: Runtime.NODEJS_22_X,
      entry: path.join(__dirname, LAMBDA_PATH + '/ReadDDB/read_from_ddb.mjs'),
      handler: 'handler',
      timeout: cdk.Duration.seconds(15),
      bundling: bundlingOptions,
      functionName: 'ReadDDB',
      logGroup: readDDBLogGroup
    })

    const scanSendNotifLogGroup = new LogGroup(this, 'ScanSendNotifLogGroup', {
      logGroupName: `/aws/lambda/ScanSendNotif`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      retention: RetentionDays.ONE_WEEK
    });
    const scanSendNotifFn = new aws_lambda_nodejs.NodejsFunction(this, 'ScanSendNotif', {
      runtime: Runtime.NODEJS_22_X,
      entry: path.join(__dirname, LAMBDA_PATH + '/ScanSendNotif/scan_send_notif.mjs'),
      handler: 'handler',
      timeout: cdk.Duration.seconds(15),
      bundling: {
        ...bundlingOptions,
        nodeModules: ['dayjs'],
      },
      depsLockFilePath: path.join(__dirname, LAMBDA_PATH + '/ScanSendNotif/package-lock.json'),
      functionName: 'ScanSendNotif',
      logGroup: scanSendNotifLogGroup
    })

    const writeDDBLogGroup = new LogGroup(this, 'WriteDDBLogGroup', {
      logGroupName: `/aws/lambda/WriteDDB`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      retention: RetentionDays.ONE_WEEK
    });
    const writeDDBFn = new aws_lambda_nodejs.NodejsFunction(this, 'WriteDDB', {
      runtime: Runtime.NODEJS_22_X,
      entry: path.join(__dirname, LAMBDA_PATH + '/WriteDDB/write_to_ddb.mjs'),
      handler: 'handler',
      timeout: cdk.Duration.seconds(15),
      bundling: {
        ...bundlingOptions,
        nodeModules: ['uuid', 'dayjs'],
      },
      depsLockFilePath: path.join(__dirname, LAMBDA_PATH + '/WriteDDB/package-lock.json'),
      functionName: 'WriteDDB',
      logGroup: writeDDBLogGroup
    })

    // Grant Lambdas permissions to DynamoDB
    fridgeItemsTable.grantReadWriteData(CapturePhotoFn)
    fridgeLogUserTable.grantReadWriteData(CheckEmailExistenceFn)
    fridgeItemsTable.grantReadData(ReadDDBFn)
    fridgeItemsTable.grantWriteData(writeDDBFn)
    fridgeItemsTable.grantReadWriteData(scanSendNotifFn)
    fridgeItemsTable.grantReadWriteData(deleteItemDDBFn)

    // API Gateway
    const CapturePhotoApi = new aws_apigateway.RestApi(this, 'CapturePhotoApi', {
      restApiName: 'Capture photo API'
    })
    const captureIntegration = new aws_apigateway.LambdaIntegration(CapturePhotoFn, {proxy: true})
    const capResource = CapturePhotoApi.root.addResource("capturePhoto").addResource("item")  // e.g. /products/item
    capResource.addCorsPreflight({
      allowOrigins: aws_apigateway.Cors.ALL_ORIGINS,
      allowMethods: ['POST', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token']
    })
    capResource.addMethod("POST", captureIntegration)

    const CheckEmailExistenceApi = new aws_apigateway.RestApi(this, 'CheckEmailExistenceApi', {
      restApiName: 'Check Email Existence API'
    })
    const checkEmailIntegration = new aws_apigateway.LambdaIntegration(CheckEmailExistenceFn, {proxy: true})
    const checkEmailResource = CheckEmailExistenceApi.root.addResource("checkEmailExistence").addResource("email")
    checkEmailResource.addCorsPreflight({
      allowOrigins: aws_apigateway.Cors.ALL_ORIGINS,
      allowMethods: ['GET', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token']
    })
    checkEmailResource.addMethod("GET", checkEmailIntegration)

    const DeleteItemApi = new aws_apigateway.RestApi(this, 'DeleteItemApi', {
      restApiName: 'Delete Item API'
    })
    const deleteItemIntegration = new aws_apigateway.LambdaIntegration(deleteItemDDBFn, {proxy: true})
    const deleteItemResource = DeleteItemApi.root.addResource("DeleteItem").addResource("item").addResource("{email}")
    deleteItemResource.addCorsPreflight({
      allowOrigins: aws_apigateway.Cors.ALL_ORIGINS,
      allowMethods: ['DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token']
    })
    deleteItemResource.addMethod("DELETE", deleteItemIntegration, {
      requestParameters: {
        "method.request.path.email": true
      }
    })

    const GetItemsApi = new aws_apigateway.RestApi(this, 'GetItemsApi', {
      restApiName: 'Read DDB API'
    })
    const getItemsIntegration = new aws_apigateway.LambdaIntegration(ReadDDBFn, {proxy: true})
    const getItemsResource = GetItemsApi.root.addResource("ReadFromDDB").addResource("items")
    getItemsResource.addCorsPreflight({
      allowOrigins: aws_apigateway.Cors.ALL_ORIGINS,
      allowMethods: ['GET', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token']
    })
    getItemsResource.addMethod("GET", getItemsIntegration)

    const PutItemApi = new aws_apigateway.RestApi(this, 'PutItemApi', {
      restApiName: 'Write to DDB API'
    })
    const putItemIntegration = new aws_apigateway.LambdaIntegration(writeDDBFn, {proxy: true})
    const putItemResource = PutItemApi.root.addResource("WriteToDDB").addResource("putItem")
    putItemResource.addCorsPreflight({
      allowOrigins: aws_apigateway.Cors.ALL_ORIGINS,
      allowMethods: ['POST', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token']
    })
    putItemResource.addMethod("POST", putItemIntegration)

    // EventBridge
    const eventRule = new aws_events.Rule(this, 'SendNotifDailyRule', {
      schedule: aws_events.Schedule.cron({ minute: '0', hour: '8' }),  // every day at 8:00 AM UTC
      targets: [new aws_events_targets.LambdaFunction(scanSendNotifFn)]
    })
    aws_events_targets.addLambdaPermission(eventRule, scanSendNotifFn)

    // SSM
    new aws_ssm.StringParameter(this, 'CapturePhotoApiUrlParam', {
      parameterName: '/fridge-log/capture-photo-api-url',
      stringValue: CapturePhotoApi.url
    })

    new aws_ssm.StringParameter(this, 'CheckEmailExistenceApiUrlParam', {
      parameterName: '/fridge-log/check-email-existence-api-url',
      stringValue: CheckEmailExistenceApi.url
    })

    new aws_ssm.StringParameter(this, 'DeleteItemApiUrlParam', {
      parameterName: '/fridge-log/delete-item-api-url',
      stringValue: DeleteItemApi.url
    })

    new aws_ssm.StringParameter(this, 'GetItemsApiUrlParam', {
      parameterName: '/fridge-log/get-items-api-url',
      stringValue: GetItemsApi.url
    })

    new aws_ssm.StringParameter(this, 'PutItemApiUrlParam', {
      parameterName: '/fridge-log/put-item-api-url',
      stringValue: PutItemApi.url
    })

    // SES?
  }
}
