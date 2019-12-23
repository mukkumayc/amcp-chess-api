import uuid from 'uuid';
import * as dynamoDbLib from './libs/dynamodb-lib';
import { success, failure, userFailure } from './libs/response-lib';

export async function main(event, context) {
  const body = JSON.parse(event.body);
  let params = {
    TableName: process.env.ProblemsTableName,
    Key: {
      problemId: body.problemId,
    },
  };

  let result;
  try {
    result = await dynamoDbLib.call("get", params);
  }
  catch(e) {
    return failure({text: "Error while getting problem from db", error: e});
  }

  if (!result.Item) {
    return userFailure("Problem doesn't exist");
  }

  params = {
    TableName: process.env.RoomsTableName,
    Item: {
      gameId: uuid.v1(),
      createdAt: Date.now(),
      playerId: event.requestContext.identity.cognitoIdentityId,
      isHidden: true,
      problemId: body.problemId,
      notation: result.Item.notation,
      solution: result.Item.solution,
      reaction: result.Item.reaction,
      movesCounter: 0,
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