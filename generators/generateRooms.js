import uuid from "uuid";
import * as dynamoDbLib from "../libs/dynamodb-lib";
import {success, failure} from "../libs/response-lib";

function randomInteger(min, max) {
  let rand = min - 0.5 + Math.random() * (max - min + 1);
  return Math.round(rand);
}

function randomString(length) {
  let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var result = '';
  for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
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

  for (let i = 0; i < 4; ++i) {
    let first = randomInteger(0, result.Items.length - 1);
    let second = randomInteger(0, result.Items.length - 1);
    while (second === first) {
      second = randomInteger(0, result.Items.length - 1);
    }
    let tableName = i < 2
    ? process.env.RoomsTableName
    : process.env.HiddenRoomsTableName;
    let connectionId1 = randomString(15) + '=';
    let connectionId2 = randomString(15) + '=';

    params = { //generate room
      TableName: tableName,
      Item: {
        gameId: uuid.v1(),
        playerId1: result.Items[first].userId,
        playerId2: result.Items[second].userId,
        connectionId1: connectionId1,
        connectionId2: connectionId2,
        createdAt: Date.now()
      }
    };
    try {
      await dynamoDbLib.call("put", params); // add room to table
    } catch(e) {
      return failure({status: false});
    }
    params = {
      TableName: process.env.WebSocketConnectionsTableName,
      Item: {
        connectionId: connectionId1,
        gameId: params.Item.gameId,
      }
    };
    try {
      await dynamoDbLib.call("put", params); // add first connection
    } catch(e) {
      return failure({status: false});
    }
    params = {
      TableName: process.env.WebSocketConnectionsTableName,
      Item: {
        connectionId: connectionId2,
        gameId: params.Item.gameId,
      }
    };
    try {
      await dynamoDbLib.call("put", params); // add second connection
    } catch(e) {
      return failure({status: false});
    }
  }
  return success();
}