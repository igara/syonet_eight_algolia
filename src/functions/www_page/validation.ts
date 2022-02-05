export const validation = () => {
  if (!process.env.ALGOLIA_APPLICATION_ID) {
    throw new Error('error: .env setting ALGOLIA_APPLICATION_ID ');
  }

  if (!process.env.ALGOLIA_ADMIN_API_KEY) {
    throw new Error('error: .env setting ALGOLIA_ADMIN_API_KEY ');
  }

  if (!process.env.ALGOLIA_WWW_PAGE_INDEX) {
    throw new Error('error: .env setting ALGOLIA_WWW_PAGE_INDEX ');
  }
};
