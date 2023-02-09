
// `https://${shop}.com/admin/api/${api_version}/${resource}.json?limit=${limit}&page_info=${page_info}`

/**
 * Create a cursor to paginate
 *
 * @param  {<Object>}       param               
 * @param  {String}         param.domain        Shopify store domain
 * @param  {String}         param.apiVersion    The Version of the Shopify Keys
 * @param  {String}         param.resource      Products, blogs, collections
 * @param  {String}         param.pageInfo      The cursor
 * @return {Promise<Object>}
 */
export const restApiPaginator = ({
  domain,
  apiVersion,
  resource,
  pageInfo,
  collectionId,
}) => {
  
  const shopifyAdminUrl = `https://${domain}.com/admin/api/${apiVersion}/${resource}.json?`;
  let searchQuery = [`?limit=250`];
  if(collectionId && !pageInfo) searchQuery.push(`collection=${collectionId}`);
  if(pageInfo) searchQuery.push(`page_info=${pageInfo}`);

  searchQuery = searchQuery.join("&");

  
}

