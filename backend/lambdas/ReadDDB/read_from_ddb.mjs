import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({})
const dynamo = DynamoDBDocumentClient.from(client)
const tableName = "FridgeLogItem"

export const handler = async (event, context) => {
    const email = event.queryStringParameters['email']
    const pageSize = event.queryStringParameters['pageSize'] ? parseInt(event.queryStringParameters['pageSize']) : 10
    const lastEvaluatedKey = event.queryStringParameters['lastKey'] ? JSON.parse(decodeURIComponent(event.queryStringParameters['lastKey'])) : undefined

    console.log('email param', email)
    console.log('pageSize', pageSize)
    console.log('lastEvaluatedKey', lastEvaluatedKey)

    try {
        console.log('trying in read_from_ddb handler')
        const queryParams = {
            TableName: tableName,
            KeyConditionExpression: "user_email = :userEmail",
            ExpressionAttributeValues: {
                ":userEmail": email
            },
            ScanIndexForward: false,
            Limit: pageSize
        }

        // Add ExclusiveStartKey if provided for pagination
        if (lastEvaluatedKey) {
            queryParams.ExclusiveStartKey = lastEvaluatedKey
        }

        let output = await dynamo.send(new QueryCommand(queryParams))

        return {
            "statusCode": 200,
            headers: {
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Origin": "*",  // Allow from anywhere 
                "Access-Control-Allow-Methods": "GET, OPTIONS"
            },
            body: JSON.stringify(output)
        }

    } catch (error) {
        console.log('catching error in read_from_ddb handler', error)
        return {
            "statusCode": 500,
            headers: {
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Origin": "*",  // Allow from anywhere 
                "Access-Control-Allow-Methods": "GET, OPTIONS"
            },
            body: JSON.stringify(error)
        }
    }
}