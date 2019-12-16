import { success } from '../libs/response-lib';

export async function main(event, context) {
  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: event.requestContext.domainName + '/' + event.requestContext.stage,
  });
  await apigwManagementApi.postToConnection({
    ConnectionId: result.Item.connectionId1,
    Data: JSON.stringify({
      action: "getConnectionId",
      connectionId: event.requestContext.connectionId,
    }),
  }).promise();
  return success();
}