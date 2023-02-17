export const getTableName = (url: URL) => {
  const str = url.toString();
  return /.*\/([^?]+)/.exec(str)?.[1];
};
