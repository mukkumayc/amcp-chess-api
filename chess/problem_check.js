import * as dynamoDbLib from '../libs/dynamodb-lib';
import { success, failure, userFailure } from '../libs/response-lib';
import AWS from "aws-sdk";
import Chess from 'chess.js';

async function updateCounter(count, problemId){
    let params = {
        TableName: process.env.ProblemsTableName,
        Key: {
            problemId: problemId,
        },
        UpdateExpression: "SET counter = :count",
        ExpressionAttributeValues :{
            ":count" : count,
        },
    };
    await dynamoDbLib.call("update", params);
}

async function updateCurPosition(fen, problemId){
    let params = {
        TableName: process.env.ProblemsTableName,
        Key: {
            problemId: problemId,
        },
        UpdateExpression: "SET currentPosition = :current",
        ExpressionAttributeValues :{
            ":current" : fen,
        },
    };
    await dynamoDbLib.call("update", params);
}

export async function main(problemId, move){
    let params = {
        TableName: process.env.ProblemsTableName,
        Key: {
            problemId: problemId,
        }
    };
    try{
        const result = await dynamoDbLib.call("get", params);
        if (result.Item) {
            let chess = new Chess(result.Item.curPosition || result.Item.Position);
            let counter = result.Item.counter;
            if (counter < result.Item.solution.length){
                if (move != result.Item.solution[counter]){
                    return userFailure({text: "Incorrect move"});
                }
                chess.move(solution[counter]);
                let answer = '';
                let pos = '';
                if (counter < (result.Item.solution.length - 1)){
                    chess.move(reaction[counter]);
                    answer = reaction[counter];
                    counter ++;
                    pos = chess.fen();
                }else{
                    counter = 0;
                    answer = "You solved it";
                    pos = result.Item.position;
                }
                await updateCounter(counter, problemId);
                await updateCurPosition(pos, problemId);
                return answer;
            }
            return "Position has been solved";
        }else{
            return userFailure({text: "NonExisting problem"});
        }
    }catch(e) {
        console.log("error ", e);
        return failure(e);
    }
}