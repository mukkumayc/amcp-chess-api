import * as dynamoDbLib from '../libs/dynamodb-lib';
import { success, failure } from '../libs/response-lib';

export async function main(event, context) {
  console.log('event:', event);
  let body = JSON.parse(event.body);
  // let connectionId = body.connectionId;
  let params = {
    TableName: process.env.OpenRoomsTableName,
    Key: {
      gameId: event.pathParameters.id,
    }
  };
  try {
    const result = await dynamoDbLib.call("get", params);
    if (result.Item) {
      let updateExpression;
      let deleteNote = false;
      if (result.Item.playerId1 === event.requestContext.identity.cognitoIdentityId) {
         updateExpression = "REMOVE connectionId1";
         deleteNote = true;
      }
      else {
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
        deleteNote
        ? await dynamoDbLib.call("delete", params)
        : await dynamoDbLib.call("update", params);
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