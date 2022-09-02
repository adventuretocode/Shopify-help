
const paginate = async (func, type, param) => {
  const data = await func(...param);

  const results = data[type];
  const { edges, pageInfo } = results;
  const lastNode = edges[edges.length - 1];
  const lastCursor = lastNode.cursor;

  const { hasNextPage } = pageInfo;
  return {
    hasNextPage,
    lastCursor,
    edges
  }
}

module.exports = paginate;
