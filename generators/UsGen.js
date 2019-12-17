import uuid from "uuid";
import * as dynamoDbLib from "../libs/dynamodb-lib";
import {success, failure} from "../libs/response-lib";

export async function main (event) {
    let region = 'eu-central-1';
    var ids = new Array(10);
    for (let i = 0; i < 10; i++){
        const params = {
            TableName: process.env.UsersTableName,
            Item: {
                userId: region + ':' + uuid.v1(),
                rating: 0,
                createdAt: Date.now()
            }
        };

        try {
            await dynamoDbLib.call("put", params);
            ids[i] = params.Item.userId;
        } catch(e){
            return failure({status:false});
        }
    }
    return success(ids);
}