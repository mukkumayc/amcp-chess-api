import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context) {
  const params = {
    TableName: process.env.GamesArchiveTableName,
    FilterExpression: "user1Id = :userId or user2Id = :userId",
    ExpressionAttributeValues: {
      ":userId": event.requestContext.identity.cognitoIdentityId
    }
  };

  try {
    const result = await dynamoDbLib.call("scan", params);
    // Return the list of items in response body
    return success(result.Items);
  } catch (e) {
      console.log(e);
    return failure({ status: false });
  }
}