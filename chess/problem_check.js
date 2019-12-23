import * as dynamoDbLib from '../libs/dynamodb-lib';
import { success, failure, userFailure } from '../libs/response-lib';
import Chess from 'chess.js';

async function updateState(movesCounter, fen, gameId) {
    let params = {
        TableName: process.env.RoomsTableName,
        Key: {
            gameId: gameId,
        },
        UpdateExpression: "SET movesCounter = :movesCounter, notation = :notation",
        ExpressionAttributeValues: {
            ":movesCounter": movesCounter,
            ":notation": fen,
        },
    };
    await dynamoDbLib.call("update", params);
}

function movesAreEqual(move1, move2) {
    return move1 == move2;
}

export async function main(event, context) {
    let body = JSON.parse(event.body);
    let params = {
        TableName: process.env.RoomsTableName,
        Key: {
            gameId: body.gameId,
        }
    };
    let result;
    try {
        result = await dynamoDbLib.call("get", params);
    }
    catch(e) {
        return failure({text: "Cannot get room", params: params, error: e});
    }

    if (result.Item) {
        let chess = new Chess(result.Item.notation);
        let movesCounter = result.Item.movesCounter;
        if (movesCounter < result.Item.solution.length) {
            if (!movesAreEqual(body.move, result.Item.solution[movesCounter])) {
                return userFailure({
                    status: "wrong",
                });
            }
            chess.move(result.Item.solution[movesCounter]);
            if (movesCounter < result.Item.reaction.length) {
                chess.move(result.Item.reaction[movesCounter]);
                let move = result.Item.reaction[movesCounter];
                ++movesCounter;
                await updateState(movesCounter, chess.fen(), body.gameId);
                return success({
                    status: "right",
                    reaction: move,
                });
            }

            // player solved this problem,
            // we should add him in SolvedProblems table

            params = {
                TableName: process.env.SolvedProblemsTableName,
                Item: {
                    userId: result.Item.playerId,
                    problemId: result.Item.problemId,
                }
            };

            await dynamoDbLib.call("put", params);

            //and delete room
            params = {
                TableName: process.env.RoomsTableName,
                Key: {
                  gameId: body.gameId,
                }
            };

            await dynamoDbLib.call("delete", params);

            return success({
                status: "solved",
            });
        }
        return userFailure({text: "Position has been solved"});
    }
    else {
        return userFailure({text: "The room doesn't exist"});
    }
}