import uuid from "uuid"
import * as dynamoDbLib from "./libs/dynamodb-lib";
import {success, failure} from "./libs/response-lib";

export async function main (event, context) {
    const counter = event.body;
    for (let i = 0; i<counter; i++){
        const params = {
            TableName: process.env.TableName,
            Item: {
                userId: uuid.v1(),
                Rating: Math.floor(Math.random() * 2700),
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
}