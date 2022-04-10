import { Handler } from 'aws-lambda';
import AWS from 'aws-sdk';
import * as Variables from 'syonet_eight_variables';
import fetch from 'node-fetch';
import { validation } from '../../../validation';
import algoliasearch from 'algoliasearch';
import { createHmac } from 'crypto';

const lambda = new AWS.Lambda({
  endpoint: process.env.ALGOLIA_LAMBDA_ENDPOINT,
});

export const handler: Handler = async (event, _context, callback) => {
  try {
    validation();

    if (typeof event.zennMarkdownName !== 'string') {
      throw new Error('require: payload zennMarkdownName');
    }

    const zennMarkdownName = event.zennMarkdownName;

    const zennDetailResponse = await fetch(
      Variables.backupZennArticleDetailURI(zennMarkdownName),
    );
    const zennDetail = await zennDetailResponse.text();

    const zennDetailHistoryResponse = await fetch(
      `https://api.github.com/repos/igara/zenn-export/commits?path=/articles/${zennMarkdownName}`,
    );
    const zennDetailHistoryJSON =
      (await zennDetailHistoryResponse.json()) as Variables.BackupZennArticleDetailHistory;

    if (zennDetailHistoryJSON.length === 0) return;

    const nextLink = `/blogs/zenn/article/${zennMarkdownName}`;
    const url = `${process.env.HTTP_WWW_HOST}${nextLink}`;
    const ogp = `${process.env.HTTP_OGP_HOST}/api/www?path=${nextLink}&width=630&height=630`;
    const content = zennDetail
      .replace(/\n/g, '')
      .replace(/<style>.+<\/style>/g, '')
      .replace(/<(".*?"|'.*?'|[^'"])*?>/g, '');
    const date = new Date(
      zennDetailHistoryJSON[zennDetailHistoryJSON.length - 1].commit.committer.date,
    );

    const titleMatch = zennDetail.match(/title: &quot;.*&quot;/);
    if (!titleMatch) return;

    // const title = `${date.getFullYear()}-${
    //   date.getMonth() + 1
    // }-${date.getDate()} ${date.getHours()}-${date.getMinutes()}-${date.getSeconds()} ${titleMatch[0]
    //   .replace('title: &quot;', '')
    //   .replace('&quot;', '')}`;
    const title = titleMatch[0].replace('title: &quot;', '').replace('&quot;', '');

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
        title,
        description: content.slice(0, 90),
        content: content,
        nextLink,
        tags: ['blog', 'zenn'],
        datetime: date.getTime(),
      },
      { autoGenerateObjectIDIfNotExist: true },
    );
  } catch (e) {
    console.error(e);
    callback(new Error(e));
  }

  const infoLog = `algolia ${process.env.ALGOLIA_WWW_PAGE_INDEX} index: updating blog_zenn_article_detail ${event.zennMarkdownName}...`;
  console.info(infoLog);
  callback(null, infoLog);
};
