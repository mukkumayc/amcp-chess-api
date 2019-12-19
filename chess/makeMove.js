import * as dynamoDbLib from '../libs/dynamodb-lib';
import { success, failure } from '../libs/response-lib';
import AWS from "aws-sdk";
import Chess from 'chess.js';

async function notifyMove(event, connectionId, yourMove, move) {
  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: event.requestContext.domainName + '/' + event.requestContext.stage,
  });

  await apigwManagementApi.postToConnection({
    ConnectionId: connectionId,
    Data: JSON.stringify({
      action: "move",
      text: yourMove ? "Your move" : "Wait for your opponent move",
      move: move,
    }),
  }).promise();
}

async function notifyGameOver(event, connectionId, yourStatus, reason) {
  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: event.requestContext.domainName + '/' + event.requestContext.stage,
  });

  await apigwManagementApi.postToConnection({
    ConnectionId: connectionId,
    Data: JSON.stringify({
      action: "gameOver",
      text: yourStatus + ":" + reason,
    }),
  }).promise();
}

export async function main(event, context) {
  console.log("event:", event);
  let body = JSON.parse(event.body);
  let params = {
    TableName: process.env.OpenRoomsTableName,
    Key: {
      gameId: body.gameId,
    }
  };
  try {
    const result = await dynamoDbLib.call("get", params);
    if (result.Item) {
      let chess = new Chess();
      chess.load_pgn(result.Item.notation || '');
      let [idCurr, idNext] = (chess.turn() == 'w'
      ? [result.Item.connectionId1, result.Item.connectionId2]
      : [result.Item.connectionId2, result.Item.connectionId1]);

      if (event.requestContext.connectionId != idCurr) { // check if it's our move
        return failure({text: "Not your move"});
      }

      if (!chess.move(body.move, {sloppy: true})) { // trying to make move
        return failure({text: "Impossible move"});
      }

      let params = {
        TableName: process.env.OpenRoomsTableName,
        UpdateExpression: "SET notation = :notation",
        ExpressionAttributeValues: {
          ":notation": chess.pgn(),
        },
        Key: {
          gameId: body.gameId,
        }
      };
      await dynamoDbLib.call("update", params);

      if (chess.game_over()) { // check if game is over
        let reason;
        let isDraw = true;
        if (chess.in_checkmate()) {
          reason = "checkmate";
          isDraw = false;
        }
        else if (chess.in_draw()) {
          reason = "draw";
        }
        else if (chess.in_stalemate()) {
          reason = "stalemate";
        }
        else if (chess.in_threefold_repetition()) {
          reason = "threefold repetition";
        }
        else failure({text: "Unknown gameover reason"});


        if (isDraw) {
          await notifyGameOver(event, idCurr, "draw", reason);
          await notifyGameOver(event, idNext, "draw", reason);
        }
        else {
          await notifyGameOver(event, idCurr, "win", reason);
          await notifyGameOver(event, idNext, "lose", reason);
        }

        params = {
          TableName: process.env.GamesArchiveTableName,
          Item: {
            gameId: body.gameId,
            user1Id: result.Item.playerId1,
            user2Id: result.Item.playerId2,
            createdAt: result.Item.createdAt,
            notation: result.Item.notation,
          }
        };
        await dynamoDbLib.call("put", params);

        params = {
          TableName: process.env.OpenRoomsTableName,
          Key: {
            gameId: body.gameId,
          }
        };
        await dynamoDbLib.call("delete", params);
      }
      else {
        await notifyMove(event, idCurr, false, body.move);
        await notifyMove(event, idNext, true, body.move);
      }
    }
    else {
      return failure({ status: false, error: "Item not found." });
    }
  }
  catch(e) {
    console.log("error:", e);
    return failure();
  }

  return success();
}