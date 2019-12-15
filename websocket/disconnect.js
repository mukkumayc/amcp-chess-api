import * as dynamoDbLib from '../libs/dynamodb-lib';
import { success, failure } from '../libs/response-lib';

export async function main(event, context) {
  console.log('event:', event);
  let body = JSON.parse(event.body);
  let connectionId = event.requestContext.connectionId;
  let params = {
    TableName: process.env.OpenRoomsTableName,
    Key: {
      gameId: body.gameId,
    }
  };
  try {
    const result = await dynamoDbLib.call("get", params);
    if (result.Item) {
      let updateExpression;
      if (result.Item.connectionId1 === connectionId) {
         updateExpression = "REMOVE connectionId1";
      }
      else if (result.Item.connectionId2 === connectionId) {
        updateExpression = "REMOVE connectionId2";
      }
      params = {
        TableName: process.env.OpenRoomsTableName,
        Key: {
          gameId: body.gameId,
        },
        UpdateExpression: updateExpression,
      };
      try {
        await dynamoDbLib.call("update", params);
        return success({ status: false });
      }
      catch(e) {
        console.log('error:', e);
        return failure({ status: false });
      }
    }
    else {
      return failure({ status: false, error: "Item not found." });
    }
  } catch (e) {
    console.log('error:', e);
    return failure({ status: false });
  }
}