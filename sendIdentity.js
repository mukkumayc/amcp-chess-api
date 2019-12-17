import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context){
    const data = JSON.parse(event.body);
    let params = {
        TableName: process.env.OpenRoomsTableName,
        Key:{
            gameId: data.gameId,
        }
    }
    const result = await dynamoDbLib.call("get", params);
    if (result.Item){
        if (result.Item.playerId1 != event.requestContext.identity.cognitoIdentityId && !result.Item.playerId2){
            let updateExpression = "SET playerId2 = :playerId";
            params = {
                TableName: process.env.OpenRoomsTableName,
                Key: {
                    gameId: data,gameId,
                },
                UpdateExpression: updateExpression,
                ExpressionAttributeValues:{
                    ":playerId": event.requestContext.identity.cognitoIdentityId,
                },
            };
            try{
                await dynamoDbLib.call("update", params);
                return {
                    statusCode: 200
                };
            }catch(e){
                console.log("error: ", e);
                console.log("event:", event);
                return failure({status: false});
            }
        }
    }
    else{
        console.log("Item not found");
        return failure({status:false, error:"Item not found"});
    }
}