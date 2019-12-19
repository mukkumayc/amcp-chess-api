import uuid from 'uuid';
import * as dynamoDbLib from './libs/dynamodb-lib';
import { success, failure } from './libs/response-lib';

export async function main(event, context) {
  const data = JSON.parse(event.body);
  let isHidden;
  switch (data.roomType) {
    case "open": 
      isHidden = false;
      break;
    case "hidden":
      isHidden = true;
      break;
    default:
      console.log("Unknown room type", data.roomType);
      return failure();
  }
  const params = {
    TableName: process.env.RoomsTableName,
    Item: {
      gameId: uuid.v1(),
      createdAt: Date.now(),
      isStarted: false,
      isHidden: isHidden,
    }
  };

  try {
    await dynamoDbLib.call('put', params);
    return success(params.Item);
  } catch (e) {
      console.log(e);
    return failure({ status: false });
  }
}