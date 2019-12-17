import * as dynamoDbLib from '../libs/dynamodb-lib';
import { failure } from '../libs/response-lib';

export async function main(event, context) {
  let gameId = JSON.parse(event.body).gameId;
  try {
    let params = {
      TableName: process.env.OpenRoomsTableName,
      Key: {
        gameId: gameId,
      }
    };
    const result = await dynamoDbLib.call("get", params);
    if (result.Item) {
      let updateExpression;
      if (!result.Item.connectionId1) {
         updateExpression = "SET connectionId1 = :connectionId";
      }
      else if (!result.Item.connectionId2) {
        updateExpression = "SET connectionId2 = :connectionId";
      }
      else {
        console.log("Game started");
      }
      params = {
        TableName: process.env.OpenRoomsTableName,
        Key: {
          gameId: gameId,
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: {
          ":connectionId": event.requestContext.connectionId,
        },
      };
      try {
        await dynamoDbLib.call("update", params);
        return {
          statusCode: 200
        };
      }
      catch(e) {
        console.log("error:", e);
        console.log("event:", event);
        return failure({status: false});
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
}