import { Handler } from 'aws-lambda';
import AWS from 'aws-sdk';
import * as Variables from 'syonet_eight_variables';
import fetch from 'node-fetch';
import { validation } from '../../validation';
import algoliasearch from 'algoliasearch';
import { createHmac } from 'crypto';

const lambda = new AWS.Lambda({
  endpoint: process.env.ALGOLIA_LAMBDA_ENDPOINT,
});

export const handler: Handler = async (event, _context, callback) => {
  try {
    validation();

    if (typeof event.qiitaPostTitle !== 'string') {
      throw new Error('require: payload qiitaPostTitle');
    }

    const qiitaPostTitle = event.qiitaPostTitle;

    const qiitaDetailResponse = await fetch(
      Variables.backupQiitaDetailURI(qiitaPostTitle),
    );
    const qiitaDetail = await qiitaDetailResponse.text();

    const nextLink = `/blogs/qiita/${qiitaPostTitle}`;
    const url = `${process.env.HTTP_WWW_HOST}${nextLink}`;
    const content = qiitaDetail
      .replace(/\n/g, '')
      .replace(/<style>.+<\/style>/g, '')
      .replace(/<(".*?"|'.*?'|[^'"])*?>/g, '');

    const algolia = algoliasearch(
      process.env.ALGOLIA_APPLICATION_ID,
      process.env.ALGOLIA_ADMIN_API_KEY,
    );

    const algoliaIndex = algolia.initIndex(process.env.ALGOLIA_WWW_PAGE_INDEX);
    await algoliaIndex.saveObject(
      {
        objectID: createHmac('sha256', '').update(url).digest('hex').toString(),
        url,
        title: qiitaPostTitle,
        description: content.slice(0, 90),
        content: content,
        nextLink,
      },
      { autoGenerateObjectIDIfNotExist: true },
    );
  } catch (e) {
    console.error(e);
    callback(new Error(e));
  }

  const infoLog = `algolia ${process.env.ALGOLIA_WWW_PAGE_INDEX} index: updating blog_qiita_detail ${event.qiitaPostTitle}...`;
  console.info(infoLog);
  callback(null, infoLog);
};
