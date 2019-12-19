import * as dynamoDbLib from '../libs/dynamodb-lib';
import { failure, success } from '../libs/response-lib';
import AWS from "aws-sdk";

async function notifyGameStart(event, connectionId, yourMove) {
  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: event.requestContext.domainName + '/' + event.requestContext.stage,
  });

  await apigwManagementApi.postToConnection({
    ConnectionId: connectionId,
    Data: JSON.stringify({
      action: "gameStarted",
      text: yourMove ? "Your move" : "Wait for your opponent move",
    }),
  }).promise();
}

export async function main(event, context) {
  let gameId = JSON.parse(event.body).gameId;
  try {
    let params = {
      TableName: process.env.RoomsTableName,
      Key: {
        gameId: gameId,
      }
    };
    const result = await dynamoDbLib.call("get", params);
    let gameStart = false;
    if (result.Item) {
      let updateExpression;
      if (!result.Item.connectionId1) {
         updateExpression = "SET connectionId1 = :connectionId, isStarted = :flag";
      }
      else if (!result.Item.connectionId2) {
        updateExpression = "SET connectionId2 = :connectionId, isStarted = :flag";
        gameStart = true;
      }
      else {
        console.log("Game started");
      }
      params = {
        TableName: process.env.RoomsTableName,
        Key: {
          gameId: gameId,
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: {
          ":connectionId": event.requestContext.connectionId,
          ":flag": gameStart,
        },
      };
      try {
        await dynamoDbLib.call("update", params);
      }
      catch(e) {
        console.log("error:", e);
        console.log("event:", event);
        return failure({status: false});
      }

      if (gameStart) {
        await notifyGameStart(event, result.Item.connectionId1, true);
        await notifyGameStart(event, event.requestContext.connectionId, false);
      }
    }
    else {
      console.log("Item not found");
      return failure({ status: false, error: "Item not found." });
    }
  } catch (e) {
    console.log("error:", e);
    console.log("event:", event);
    return failure(e);
  }

  return success();
}