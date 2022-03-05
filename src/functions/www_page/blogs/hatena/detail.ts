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

    if (typeof event.hatenaPostTitle !== 'string') {
      throw new Error('require: payload hatenaPostTitle');
    }

    const hatenaPostTitle = event.hatenaPostTitle;

    const hatenaDetailResponse = await fetch(
      Variables.backupHatenaDetailURI(hatenaPostTitle),
    );
    const hatenaDetail = await hatenaDetailResponse.text();

    const nextLink = `/blogs/hatena/${hatenaPostTitle}`;
    const url = `${process.env.HTTP_WWW_HOST}${nextLink}`;
    const ogp = `${process.env.HTTP_OGP_HOST}/api/www?path=${nextLink}&width=630&height=630`;
    const content = hatenaDetail
      .replace(/\n/g, '')
      .replace(/<style>.+<\/style>/g, '')
      .replace(/<(".*?"|'.*?'|[^'"])*?>/g, '');
    const date = hatenaPostTitle.match(/\d\d\d\d-\d\d-\d\d/)[0];
    const time = hatenaPostTitle.match(/ \d\d-\d\d-\d\d/)[0].replace(/-/g, ':');

    const algolia = algoliasearch(
      process.env.ALGOLIA_APPLICATION_ID,
      process.env.ALGOLIA_ADMIN_API_KEY,
    );

    const algoliaIndex = algolia.initIndex(process.env.ALGOLIA_WWW_PAGE_INDEX);
    await algoliaIndex.setSettings({
      attributesForFaceting: ['tags'],
      customRanking: ['desc(datetime)'],
    });
    await algoliaIndex.saveObject(
      {
        objectID: createHmac('sha256', '').update(url).digest('hex').toString(),
        url,
        ogp,
        title: hatenaPostTitle,
        description: content.slice(0, 90),
        content: content,
        nextLink,
        tags: ['blog', 'hatena'],
        datetime: new Date(`${date}${time}`).getTime(),
      },
      { autoGenerateObjectIDIfNotExist: true },
    );
  } catch (e) {
    console.error(e);
    callback(new Error(e));
  }

  const infoLog = `algolia ${process.env.ALGOLIA_WWW_PAGE_INDEX} index: updating blog_hatena_detail ${event.hatenaPostTitle}...`;
  console.info(infoLog);
  callback(null, infoLog);
};
