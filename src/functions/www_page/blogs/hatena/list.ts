import { Handler } from 'aws-lambda';
import AWS from 'aws-sdk';
import * as Variables from 'syonet_eight_variables';
import fetch from 'node-fetch';
import { validation } from '../../validation';

const lambda = new AWS.Lambda({
  endpoint: process.env.ALGOLIA_LAMBDA_ENDPOINT,
});

export const handler: Handler = async (_event, _context, callback) => {
  try {
    validation();

    const hatenaListResponse = await fetch(Variables.backupHatenaListURI);
    const hatenaListJSON =
      (await hatenaListResponse.json()) as Variables.BackupHatenaList;

    hatenaListJSON.forEach((hatenaList) => {
      lambda
        .invoke({
          FunctionName: `syonet-algolia-production-www_page_blogs_hatena_detail`,
          InvocationType: 'Event',
          Payload: JSON.stringify({
            hatenaPostTitle: hatenaList.name,
          }),
        })
        .promise();
    });
  } catch (e) {
    console.error(e);
    callback(new Error(e));
  }

  const infoLog = `algolia ${process.env.ALGOLIA_WWW_PAGE_INDEX} index: updating blog_hatena_list...`;
  console.info(infoLog);
  callback(null, infoLog);
};
