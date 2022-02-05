import { Handler } from 'aws-lambda';
import AWS from 'aws-sdk';
import * as Variables from 'syonet_eight_variables';
import fetch from 'node-fetch';
import { validation } from '../../validation';
import algoliasearch from 'algoliasearch';

const lambda = new AWS.Lambda({
  endpoint: process.env.ALGOLIA_LAMBDA_ENDPOINT,
});

export const handler: Handler = async (event, _context, callback) => {
  try {
    validation();

    if (typeof event.qiitaPostTitle !== 'string') {
      throw new Error('require: payload qiitaPostTitle');
    }

    // const algolia = algoliasearch(
    //   process.env.ALGOLIA_APPLICATION_ID,
    //   process.env.ALGOLIA_ADMIN_API_KEY,
    // );

    // const algoliaIndex = algolia.initIndex(process.env.ALGOLIA_WWW_PAGE_INDEX);

    const qiitaDetailResponse = await fetch(
      Variables.backupQiitaDetailURI(event.qiitaPostTitle),
    );
    const qiitaDetail = await qiitaDetailResponse.text();

    // console.log(qiitaDetail);
  } catch (e) {
    console.error(e);
    callback(new Error(e));
  }

  const infoLog = `algolia ${process.env.ALGOLIA_WWW_PAGE_INDEX} index: updating blog_qiita_detail ${event.qiitaPostTitle}...`;
  console.info(infoLog);
  callback(null, infoLog);
};
