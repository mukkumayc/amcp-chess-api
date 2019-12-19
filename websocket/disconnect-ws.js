import * as dynamoDbLib from '../libs/dynamodb-lib';
import { success, failure } from '../libs/response-lib';

export async function main(event, context) {
  let params = {
    TableName: process.env.WebSocketConnectionsTableName,
    Key: {
      connectionId: event.requestContext.connectionId,
    }
  };
  try {
    await dynamoDbLib.call("delete", params);
  } catch (e) {
    console.log('error:', e);
    console.log('event:', event);
    return failure({ status: false });
  }
  return success();
}