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

    const qiitaListResponse = await fetch(Variables.backupQiitaListURI);
    const qiitaListJSON = (await qiitaListResponse.json()) as Variables.BackupQiitaList;

    qiitaListJSON.forEach((qiitaList) => {
      lambda
        .invoke({
          FunctionName: `syonet-algolia-${process.env.ENV}-www_page_blogs_qiita_detail`,
          InvocationType: 'Event',
          Payload: JSON.stringify({
            qiitaPostTitle: qiitaList.name,
          }),
        })
        .promise();
    });
  } catch (e) {
    console.error(e);
    callback(new Error(e));
  }

  const infoLog = `algolia ${process.env.ALGOLIA_WWW_PAGE_INDEX} index: updating blog_qiita_list...`;
  console.info(infoLog);
  callback(null, infoLog);
};
