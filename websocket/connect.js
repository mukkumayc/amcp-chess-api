import * as dynamoDbLib from '../libs/dynamodb-lib';
import { success, failure } from '../libs/response-lib';

export async function main(event, context) {
  const params = {
    TableName: process.env.QuickPairingTableName,
    Item: {
      connectionId: event.requestContext.connectionId
    }
  };

  try {
    await dynamoDbLib.call("put", params);
  }
  catch(e) {
    return failure();
  }
  return success();
}