import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context) {
  const data = JSON.parse(event.body);
  let params = {
    TableName: process.env.RoomsTableName,
    Key:{
        gameId: data.gameId,
    }
  };
  const result = await dynamoDbLib.call("get", params);
  if (result.Item) {
    let updateExpression;
    if (!result.Item.playerId1) {
      updateExpression = "SET playerId1 = :playerId";
    }
    else if (!result.Item.playerId2) {
      updateExpression = "SET playerId2 = :playerId";
    }
    else {
      return success({text: "Room is full"});
    }
    params = {
      TableName: process.env.RoomsTableName,
      Key: {
        gameId: data.gameId,
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: {
        ":playerId": event.requestContext.identity.cognitoIdentityId,
      },
    };
    try {
      await dynamoDbLib.call("update", params);
    } catch(e) {
      console.log("error: ", e);
      console.log("event:", event);
      return failure({status: false});
    }
    return success();
  }
  else {
    console.log("Item not found");
    return failure({status:false, error:"Item not found"});
  }
}