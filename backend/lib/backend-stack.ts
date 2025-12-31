import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { aws_dynamodb } from 'aws-cdk-lib';

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

    // API Gateway

    // EventBridge

    // SES?
  }
}
