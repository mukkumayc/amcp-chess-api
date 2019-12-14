import * as dynamoDbLib from './libs/dynamodb-lib';
import { failure } from './libs/response-lib';

export async function main(event, context) {
  try {
    let playerId = event.requestContext.identity.cognitoIdentityId;
    let params = {
      TableName: process.env.OpenRoomsTableName,
      Key: {
        gameId: event.pathParameters.id
      }
    };
    const result = await dynamoDbLib.call("get", params);
    if (result.Item) {
      let updateExpression;
      if (result.Item.playerId1 == playerId) {
         updateExpression = "SET connectionId1 = :connectionId";
      }
      else {
        updateExpression = "SET connectionId2 = :connectionId";
      }
      params = {
        TableName: process.env.OpenRoomsTableName,
        Key: {
          // playerId1: event.requestContext.identity.cognitoIdentityId,
          gameId: event.pathParameters.id
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: {
          ":connectionId": event.requestContext.connectionId,
        },
      };
      try {
        await dynamoDbLib.call("update", params);
        // return success({status: true});
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
      return failure({ status: false, error: "Item not found." });
    }
  } catch (e) {
    console.log("error:", e);
    console.log("event:", event);
    return failure(e);
  }
}