import uuid from 'uuid';
import * as dynamoDbLib from './libs/dynamodb-lib';
import { success, failure } from './libs/response-lib';

export async function main(event, context) {
  const body = JSON.parse(event.body);
  let params = {
    TableName: process.env.ProblemsTableName,
    Item: {
      problemId: uuid.v1(),
      notation: body.notation,
      solution: body.solution,
      reaction: body.reaction,

    },
  };

  try {
    await dynamoDbLib.call("put", params);
  }
  catch(e) {
    return failure(e);
  }

  return success();
}