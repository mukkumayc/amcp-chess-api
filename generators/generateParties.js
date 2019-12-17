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
      result = await dynamoDbLib.call("scan", params);
    }
    catch(e) {
      return failure({text: "Cannot load users"});
    }


    for (let i = 0; i < 100; ++i) {
      let first = randomInteger(0, result.Items.length - 1);
      let second = randomInteger(0, result.Items.length - 1);
      while (second === first) {
        second = randomInteger(0, result.Items.length - 1);
      }
      params = {
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
          await dynamoDbLib.call("put", params);
      } catch(e) {
          return failure({status:false});
      }
    }
    return success();
}