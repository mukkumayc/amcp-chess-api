import uuid from "uuid";
import * as dynamoDbLib from "../libs/dynamodb-lib";
import {success, failure} from "../libs/response-lib";


function randomString(length) {
  let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var result = '';
  for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

export async function main (event) {
  let items = new Array(10);
  for (let i = 0; i < 10; ++i) {
    const params = {
      TableName: process.env.WebSocketConnectionsTableName,
      Item: {
          connectionId: randomString(15) + '=',
          gameId: uuid.v1(),
      }
    };
    try {
      await dynamoDbLib.call("put", params);
      items[i] = params.Item;
    } catch(e) {
      return failure({status:false});
    }
  }
  return success({items});
}