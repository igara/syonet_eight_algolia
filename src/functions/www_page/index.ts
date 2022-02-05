import { Handler } from 'aws-lambda';
import AWS from 'aws-sdk';
import { validation } from './validation';

const lambda = new AWS.Lambda({
  endpoint: process.env.ALGOLIA_LAMBDA_ENDPOINT,
});

export const handler: Handler = (_event, _context, callback) => {
  try {
    validation();

    lambda
      .invoke({
        FunctionName: `syonet-algolia-${process.env.ENV}-www_page_blogs_qiita_list`,
        InvocationType: 'Event',
        Payload: JSON.stringify({}),
      })
      .promise();
  } catch (e) {
    callback(new Error(e));
  }

  callback(null, `algolia ${process.env.ALGOLIA_WWW_PAGE_INDEX} index: updating...`);
};
