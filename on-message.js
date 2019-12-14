import * as dynamoDbLib from './libs/dynamodb-lib';
import { success, failure } from './libs/response-lib';
import AWS from "aws-sdk";

export async function main(event, context) {
  let params = {
    TableName: process.env.OpenRoomsTableName,

    Key: {
      gameId: event.pathParameters.id
    }
  };

  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    endpoint: event.requestContext.domainName + '/' + event.requestContext.stage
  });

  const postData = JSON.parse(event.body).data;

  try {
    const result = await dynamoDbLib.call("get", params);
    if (result.Item) {
      // for (id in [result.Item.connectionId1, result.Item.connectionId2]) {
      //   await apigwManagementApi.postToConnection({ ConnectionId: id, Data: postData }).promise();
      // }
      await apigwManagementApi.postToConnection({ ConnectionId: result.Item.connectionId1, Data: postData }).promise();
      await apigwManagementApi.postToConnection({ ConnectionId: result.Item.connectionId2, Data: postData }).promise();
      return success({status: true});
    }
    else {
      return failure({ status: false, error: "Item not found." });
    }
  }
  catch(e) {
    return failure(e);
  }
}