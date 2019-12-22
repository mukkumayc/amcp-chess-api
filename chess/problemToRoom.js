import * as dynamoDbLib from '../libs/dynamodb-lib';
import { success, failure, userFailure } from '../libs/response-lib';
import AWS from "aws-sdk";
import Chess from 'chess.js';
import uuid from 'uuid';

export async function main(event, context){
    body = JSON.parse(event.body);
    let params = {
        TableName: process.env.ProblemsTableName,
        Key: {
            problemId: body.problemId,
        },
    }
    try {
        const result = await dynamoDbLib.call("get", params);
        params = {
            TableName: process.env.OpenRoomsTable,
            Key: {
                gameId: uuid.v1(),
            },
            solution: result.Item.solution,
            reaction: result.Item.reaction,
            position: result.Item.position,
            counter: 0,
            movesToWin: result.Item.solution.length,
        }
        await dynamoDbLib.call("put", params);
    }catch(e){
        console.log("Error while creating a problem room");
        throw {text: "Couldn't create a problem room", error: e};
    }
    return success(result);
}