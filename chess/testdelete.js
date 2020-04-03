import * as dynamoDbLib from '../libs/dynamodb-lib';
import { success, failure } from '../libs/response-lib';

export async function main(event, context) {
  const userId = "eu-central-1:bfa09f30-2087-11ea-8b95-e71a0eb13e6e";
  const params = {
    TableName: process.env.UsersTableName,
    Key: {
      userId: userId,
    },
    UpdateExpression: "SET rating = rating + :count",
    ExpressionAttributeValues: {
      ":count": 5,
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
  return success();
}