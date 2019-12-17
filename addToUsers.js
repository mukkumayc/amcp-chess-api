import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context){
    const params = {
        TableName: process.env.UsersTableName,
        userId: event.requestContext.identity.cognitoIdentityId,
    }
    try{
        await dynamoDbLib.call("put", params);
        return {
            statusCode: 200
        };
    }catch(e){
        console.log("error: ", e);
                console.log("event:", event);
                return failure({status: false});
    }
}