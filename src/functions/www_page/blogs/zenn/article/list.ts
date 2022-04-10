import { Handler } from 'aws-lambda';
import AWS from 'aws-sdk';
import * as Variables from 'syonet_eight_variables';
import fetch from 'node-fetch';
import { validation } from '../../../validation';

const lambda = new AWS.Lambda({
  endpoint: process.env.ALGOLIA_LAMBDA_ENDPOINT,
});

export const handler: Handler = async (_event, _context, callback) => {
  try {
    validation();

    const zennListResponse = await fetch(Variables.backupZennArticleListURI);
    const zennListJSON =
      (await zennListResponse.json()) as Variables.BackupZennArticleList;

    zennListJSON.forEach((zennList) => {
      lambda
        .invoke({
          FunctionName: `syonet-algolia-${process.env.ENV}-www_page_blogs_zenn_article_detail`,
          InvocationType: 'Event',
          Payload: JSON.stringify({
            zennMarkdownName: zennList.name,
          }),
        })
        .promise();
    });
  } catch (e) {
    console.error(e);
    callback(new Error(e));
  }

  const infoLog = `algolia ${process.env.ALGOLIA_WWW_PAGE_INDEX} index: updating blog_zenn_artile_list...`;
  console.info(infoLog);
  callback(null, infoLog);
};
