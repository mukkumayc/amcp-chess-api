import uuid from 'uuid';
import * as dynamoDbLib from './libs/dynamodb-lib';
import { success, failure } from './libs/response-lib';

export async function main(event, context) {
  const params = {
    TableName: process.env.OpenRoomsTableName,
    Item: {
      gameId: uuid.v1(),
      playerId1: event.requestContext.identity.cognitoIdentityId,
      createdAt: Date.now()
    }
  };

  try {
    await dynamoDbLib.call('put', params);
    return success(params.Item);
  } catch (e) {
      console.log(e);
    return failure({ status: false });
  }
}