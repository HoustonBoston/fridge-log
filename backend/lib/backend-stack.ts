import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { aws_dynamodb, aws_lambda_nodejs, aws_apigateway } from 'aws-cdk-lib';
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

    // Lambdas
    const CapturePhotoFn = new aws_lambda_nodejs.NodejsFunction(this, 'CapturePhoto', {
      runtime: Runtime.NODEJS_20_X,
      entry: path.join(__dirname, LAMBDA_PATH + '/CapturePhoto/capture_photo.mjs'),
      handler: 'handler',
      timeout: cdk.Duration.seconds(15)
    })

    new aws_lambda_nodejs.NodejsFunction(this, 'CheckEmailExistence', {
      runtime: Runtime.NODEJS_20_X,
      entry: path.join(__dirname, LAMBDA_PATH + '/CheckEmailExistence/check_email_existence.mjs'),
      handler: 'handler',
      timeout: cdk.Duration.seconds(15)
    })

    new aws_lambda_nodejs.NodejsFunction(this, 'DeleteItemDDB', {
      runtime: Runtime.NODEJS_20_X,
      entry: path.join(__dirname, LAMBDA_PATH + '/DeleteItemDDB/delete_item.mjs'),
      handler: 'handler',
      timeout: cdk.Duration.seconds(15)
    })

    new aws_lambda_nodejs.NodejsFunction(this, 'ReadDDB', {
      runtime: Runtime.NODEJS_20_X,
      entry: path.join(__dirname, LAMBDA_PATH + '/ReadDDB/read_from_ddb.mjs'),
      handler: 'handler',
      timeout: cdk.Duration.seconds(15)
    })

    new aws_lambda_nodejs.NodejsFunction(this, 'ScanSendNotif', {
      runtime: Runtime.NODEJS_20_X,
      entry: path.join(__dirname, LAMBDA_PATH + '/ScanSendNotif/scan_send_notif.mjs'),
      handler: 'handler',
      timeout: cdk.Duration.seconds(15)
    })

    new aws_lambda_nodejs.NodejsFunction(this, 'WriteDDB', {
      runtime: Runtime.NODEJS_20_X,
      entry: path.join(__dirname, LAMBDA_PATH + '/WriteDDB/write_to_ddb.mjs'),
      handler: 'handler',
      timeout: cdk.Duration.seconds(15)
    })


    // API Gateway
    const CapturePhotoApi = new aws_apigateway.RestApi(this, 'CapturePhotoApi', {
      restApiName: 'Capture photo API'
    })
    const captureIntegration = new aws_apigateway.LambdaIntegration(CapturePhotoFn)
    CapturePhotoApi.root.addResource("capturePhoto/item").addMethod("GET", captureIntegration)

    // EventBridge

    // SES?
  }
}
