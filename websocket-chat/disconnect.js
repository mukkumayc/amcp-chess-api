import * as dynamoDbLib from '../libs/dynamodb-lib';
import { success, failure } from '../libs/response-lib';

export async function main(event, context) {
  let playerId = event.requestContext.identity.cognitoIdentityId;
  let params = {
    TableName: process.env.OpenRoomsTableName,
    Key: {
      gameId: event.pathParameters.id
    }
  };
  try {
    const result = await dynamoDbLib.call("get", params);
    if (result.Item) {
      let updateExpression;
      if (!result.Item.playerId1 == playerId) {
         updateExpression = "REMOVE connectionId1";
      }
      else {
        updateExpression = "REMOVE connectionId2";
      }
      params = {
        TableName: process.env.OpenRoomsTableName,
        Key: {
          gameId: event.pathParameters.id
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: {
          ":connectionId": event.requestContext.connectionId,
        },
      };
      try {
        await dynamoDbLib.call("update", params);
        return success({status: true});
      }
      catch(e) {
        console.log(e);
        return failure({status: false});
      }
    }
    else {
      return failure({ status: false, error: "Item not found." });
    }
  } catch (e) {
    console.log(e);
    return failure({ status: false });
  }
}