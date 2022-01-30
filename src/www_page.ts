import { Handler } from 'aws-lambda';

export const handler: Handler = () => {
  console.info(`algolia ${process.env.ALGOLIA_WWW_PAGE_INDEX} index: update finish.`);

  return;
};
