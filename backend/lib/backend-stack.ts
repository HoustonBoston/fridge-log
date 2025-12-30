import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB

    // Lambdas

    // API Gateway

    // EventBridge

    // SES?
  }
}
