import { Handler } from 'aws-lambda';
import algoliasearch from 'algoliasearch';
import fetch from 'node-fetch';

export const handler: Handler = async () => {
  if (!process.env.ALGOLIA_APPLICATION_ID) {
    console.error('error: .env setting ALGOLIA_APPLICATION_ID ');

    return;
  }

  if (!process.env.ALGOLIA_ADMIN_API_KEY) {
    console.error('error: .env setting ALGOLIA_ADMIN_API_KEY ');

    return;
  }

  if (!process.env.ALGOLIA_WWW_PAGE_INDEX) {
    console.error('error: .env setting ALGOLIA_WWW_PAGE_INDEX ');

    return;
  }

  const qiitaListResponse = await fetch(
    'https://api.github.com/repos/igara/qiita-export/contents/data/igara',
  );
  const qiitaListJSON = await qiitaListResponse.json();
  console.log(qiitaListJSON);

  // const algolia = algoliasearch(
  //   process.env.ALGOLIA_APPLICATION_ID,
  //   process.env.ALGOLIA_ADMIN_API_KEY,
  // );

  // const algoliaIndex = algolia.initIndex(process.env.ALGOLIA_WWW_PAGE_INDEX);

  console.info(`algolia ${process.env.ALGOLIA_WWW_PAGE_INDEX} index: update finish.`);

  return;
};
