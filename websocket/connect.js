import { success } from '../libs/response-lib';

export async function main(event, context) {
  console.log("event:", event);
  return success();
}