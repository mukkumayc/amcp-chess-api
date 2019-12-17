import uuid from "uuid";
import * as dynamoDbLib from "../libs/dynamodb-lib";
import {success, failure} from "../libs/response-lib";

function randomInteger(min, max) {
  let rand = min - 0.5 + Math.random() * (max - min + 1);
  return Math.round(rand);
}

export async function main(event, context) {
  let params = {
    TableName: process.env.UsersTableName
  };
  let result;
  try {
    result = await dynamoDbLib.call("scan", params); // load all users
  }
  catch(e) {
    return failure({text: "Cannot load users"});
  }

  for (let i = 0; i < 200; ++i) {
    let first = randomInteger(0, result.Items.length - 1);
    let second = randomInteger(0, result.Items.length - 1);
    while (second === first) {
      second = randomInteger(0, result.Items.length - 1);
    }
    params = { //generate party
      TableName: process.env.GamesArchiveTableName,
      Item: {
        gameId: uuid.v1(),
        user1Id: result.Items[first].userId,
        user2Id: result.Items[second].userId,
        winner: randomInteger(1, 2),
        points: randomInteger(1, 10),
        createdAt: Date.now()
      }
    };
    try {
      await dynamoDbLib.call("put", params); // add party to table
    } catch(e) {
      return failure({status:false});
    }
    if (params.Item.winner == 1) { // add points to winner
      result.Items[first].rating += params.Item.points;
    }
    else {
      result.Items[second].rating += params.Item.points;
    }
  }

  for (let i = 0; i < result.Items.length; ++i) { // put users rating in table
    let item = result.Items[i];
    params = {
      TableName: process.env.UsersTableName,
      Key: {
        userId: item.userId,
      },
      UpdateExpression: "SET rating = :rating",
      ExpressionAttributeValues: {
        ":rating": item.rating,
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
  }

  return success();
}