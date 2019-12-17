import uuid from "uuid"
import * as dynamoDbLib from "../libs/dynamodb-lib";
import {success, failure} from "../libs/response-lib";

export async function main(event, context) {
    const data = JSON.parse(event.body);
    const params = {
        TableName: process.env.GamesArchive,
        Item: {
            user1Id: event.requestContext.identity.cognitoIdentityId,
            user2Id: event.requestContext.identity.cognitoIdentityId,
            gameId: uuid.v1(),
            content: data.content,
            attachment: data.attachment,
            createdAt:Date.now()
        }
    };

    try {
        await dynamoDbLib.call("put", params);
        return success(params.Item);
    } catch(e){
        return failure({status:false});
    }
}