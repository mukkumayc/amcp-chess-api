import * as dynamoDbLib from '../libs/dynamodb-lib';
import { success, failure } from '../libs/response-lib';
import AWS from "aws-sdk";

export async function main(event, context) {
  console.log("event:", event);
  let body = JSON.parse(event.body);
  try {
    let params = {
      TableName: process.env.WebSocketConnectionsTableName,
      FilterExpression: "gameId = :gameId",
      ExpressionAttributeValues: {
        ":gameId": body.gameId,
      }
    };
    const result = await dynamoDbLib.call("scan", params);

    const apigwManagementApi = new AWS.ApiGatewayManagementApi({
      apiVersion: '2018-11-29',
      endpoint: event.requestContext.domainName + '/' + event.requestContext.stage,
    });

    try {
      for (let i = 0; i < result.Items.length; ++i) {
        await apigwManagementApi.postToConnection({
          ConnectionId: result.Items[i].connectionId,
          Data: JSON.stringify({
            action: "sendMessage",
            message: body.message,
          }),
        }).promise();
      }
    }
    catch(e) {
      console.log("Error while sending message:", e);
      return failure();
    }
  }
  catch(e) {
    console.log("error:", e);
    return failure();
  }
  return success();
}