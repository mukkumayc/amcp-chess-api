import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context) {
  const params = {
    TableName: process.env.QuickPairingTableName,
    Item: {
      userId: event.requestContext.identity.cognitoIdentityId
    }
  };

  try {
    await dynamoDbLib.call("put", params);
    return success(params.Item);
  } catch (e) {
      console.log(e);
    return failure({ status: false });
  }
}