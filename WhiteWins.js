import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context) {
    const params1 = {
        TableName: process.env.GamesArchiveTableName,
        FilterExpression: "user1Id= :userId and winner = :result",
        ExpressionAttributeValues: {
            ":userId": event.requestContext.identity.cognitoIdentityId,
            ":result": 1,
        },
    };
    const params2 = {
        TableName: process.env.GamesArchiveTableName,
        FilterExpression: "user1Id= :userId",
        ExpressionAttributeValues: {
            ":userId": event.requestContext.identity.cognitoIdentityId,
        },
    };
    try {
        const Wins = await dynamoDbLib.call("scan", params1);
        const All = await dynamoDbLib.call("scan", params2);
        return success(Wins.Items.length/All.Items.length);
    }catch (e) {
        console.log(e);
        return failure({ status: false });
    }
}
