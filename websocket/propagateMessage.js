import * as dynamoDbLib from '../libs/dynamodb-lib';
import { success, failure } from '../libs/response-lib';
import AWS from "aws-sdk";

export async function main(event, context) {
  console.log("event:", event);
  let body = JSON.parse(event.body);
  try {
    let params = {
      TableName: process.env.RoomsTableName,
      Key: {
        gameId: body.gameId,
      }
    };
    const result = await dynamoDbLib.call("get", params);
    if (result.Item) {
      const apigwManagementApi = new AWS.ApiGatewayManagementApi({
        apiVersion: '2018-11-29',
        endpoint: event.requestContext.domainName + '/' + event.requestContext.stage,
      });
      try {
        if (result.Item.connectionId1) {
          await apigwManagementApi.postToConnection({
            ConnectionId: result.Item.connectionId1,
            Data: JSON.stringify({
              action: "sendMessage",
              message: body.message,
            }),
          }).promise();
        }
        if (result.Item.connectionId2) {
          await apigwManagementApi.postToConnection({
            ConnectionId: result.Item.connectionId2,
            Data: JSON.stringify({
              action: "sendMessage",
              message: body.message,
            }),
          }).promise();
        }
        return success();
      }
      catch(e) {
        console.log("error:", e);
        return failure();
      }
    }
    else {
      return failure({ status: false, error: "Item not found." });
    }
  }
  catch(e) {
    console.log("error:", e);
    return failure();
  }

}