import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { aws_dynamodb, aws_lambda_nodejs, aws_apigateway, aws_events, aws_events_targets } from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import path from 'path';

const LAMBDA_PATH = '../lambdas'

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB
    const fridgeItemsTable = new aws_dynamodb.TableV2(this, 'FridgeLogItem', {
      partitionKey: {name: 'user_email', type: aws_dynamodb.AttributeType.STRING},
      sortKey: {name: 'timestamp', type: aws_dynamodb.AttributeType.NUMBER}
    })
    fridgeItemsTable.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN)  // prevent deletion on stack removal

    const fridgeLogUserTable = new aws_dynamodb.TableV2(this, 'FridgeLogUser', {
      partitionKey: {name: 'user_email', type: aws_dynamodb.AttributeType.STRING}
    })
    fridgeLogUserTable.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN)  // prevent deletion on stack removal

    // Lambdas
    const CapturePhotoFn = new aws_lambda_nodejs.NodejsFunction(this, 'CapturePhoto', {
      runtime: Runtime.NODEJS_22_X,
      entry: path.join(__dirname, LAMBDA_PATH + '/CapturePhoto/capture_photo.mjs'),
      handler: 'handler',
      timeout: cdk.Duration.seconds(15)
    })

    const CheckEmailExistenceFn = new aws_lambda_nodejs.NodejsFunction(this, 'CheckEmailExistence', {
      runtime: Runtime.NODEJS_22_X,
      entry: path.join(__dirname, LAMBDA_PATH + '/CheckEmailExistence/check_email_existence.mjs'),
      handler: 'handler',
      timeout: cdk.Duration.seconds(15)
    })

    const deleteItemDDBFn = new aws_lambda_nodejs.NodejsFunction(this, 'DeleteItemDDB', {
      runtime: Runtime.NODEJS_22_X,
      entry: path.join(__dirname, LAMBDA_PATH + '/DeleteItemDDB/delete_item.mjs'),
      handler: 'handler',
      timeout: cdk.Duration.seconds(15)
    })

    const ReadDDBFn = new aws_lambda_nodejs.NodejsFunction(this, 'ReadDDB', {
      runtime: Runtime.NODEJS_22_X,
      entry: path.join(__dirname, LAMBDA_PATH + '/ReadDDB/read_from_ddb.mjs'),
      handler: 'handler',
      timeout: cdk.Duration.seconds(15)
    })

    const scanSendNotifFn = new aws_lambda_nodejs.NodejsFunction(this, 'ScanSendNotif', {
      runtime: Runtime.NODEJS_22_X,
      entry: path.join(__dirname, LAMBDA_PATH + '/ScanSendNotif/scan_send_notif.mjs'),
      handler: 'handler',
      timeout: cdk.Duration.seconds(15)
    })

    const writeDDBFn = new aws_lambda_nodejs.NodejsFunction(this, 'WriteDDB', {
      runtime: Runtime.NODEJS_22_X,
      entry: path.join(__dirname, LAMBDA_PATH + '/WriteDDB/write_to_ddb.mjs'),
      handler: 'handler',
      timeout: cdk.Duration.seconds(15)
    })

    // Grant Lambdas permissions to DynamoDB
    fridgeItemsTable.grantReadWriteData(CapturePhotoFn)
    fridgeItemsTable.grantReadWriteData(CheckEmailExistenceFn)
    fridgeItemsTable.grantReadData(ReadDDBFn)
    fridgeItemsTable.grantWriteData(writeDDBFn)
    fridgeItemsTable.grantReadWriteData(scanSendNotifFn)
    fridgeItemsTable.grantReadWriteData(deleteItemDDBFn)

    // API Gateway
    const CapturePhotoApi = new aws_apigateway.RestApi(this, 'CapturePhotoApi', {
      restApiName: 'Capture photo API'
    })
    const captureIntegration = new aws_apigateway.LambdaIntegration(CapturePhotoFn, {proxy: true})
    const capResource = CapturePhotoApi.root.addResource("capturePhoto/item")
    capResource.addMethod("OPTIONS")  // for CORS preflight
    capResource.addMethod("POST", captureIntegration)

    const CheckEmailExistenceApi = new aws_apigateway.RestApi(this, 'CheckEmailExistenceApi', {
      restApiName: 'Check Email Existence API'
    })
    const checkEmailIntegration = new aws_apigateway.LambdaIntegration(CheckEmailExistenceFn, {proxy: true})
    const checkEmailResource = CheckEmailExistenceApi.root.addResource("checkEmailExistence/email")
    checkEmailResource.addMethod("OPTIONS")  // for CORS preflight
    checkEmailResource.addMethod("GET", checkEmailIntegration)

    const DeleteItemApi = new aws_apigateway.RestApi(this, 'DeleteItemApi', {
      restApiName: 'Delete Item API'
    })
    const deleteItemIntegration = new aws_apigateway.LambdaIntegration(deleteItemDDBFn, {proxy: true,
      requestParameters: {
        "integration.request.path.email": "method.request.path.email"
      }
    })
    const deleteItemResource = DeleteItemApi.root.addResource("DeleteItem/item/{email}")
    deleteItemResource.addMethod("OPTIONS")  // for CORS preflight
    deleteItemResource.addMethod("DELETE", deleteItemIntegration)

    const GetItemsApi = new aws_apigateway.RestApi(this, 'GetItemsApi', {
      restApiName: 'Read DDB API'
    })
    const getItemsIntegration = new aws_apigateway.LambdaIntegration(ReadDDBFn, {proxy: true})
    const getItemsResource = GetItemsApi.root.addResource("ReadFromDDB/items")
    getItemsResource.addMethod("OPTIONS")  // for CORS preflight
    getItemsResource.addMethod("GET", getItemsIntegration)

    const PutItemApi = new aws_apigateway.RestApi(this, 'PutItemApi', {
      restApiName: 'Write to DDB API'
    })
    const putItemIntegration = new aws_apigateway.LambdaIntegration(writeDDBFn, {proxy: true})
    const putItemResource = PutItemApi.root.addResource("WriteToDDB/putItem")
    putItemResource.addMethod("OPTIONS")  // for CORS preflight
    putItemResource.addMethod("POST", putItemIntegration)

    // EventBridge
    const eventRule = new aws_events.Rule(this, 'SendNotifDailyRule', {
      schedule: aws_events.Schedule.cron({ minute: '0', hour: '8' }),  // every day at 8:00 AM UTC
      targets: [new aws_events_targets.LambdaFunction(scanSendNotifFn)]
    })
    aws_events_targets.addLambdaPermission(eventRule, scanSendNotifFn)

    // SES?
  }
}
