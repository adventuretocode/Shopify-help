import { URL } from 'url';

export class InvalidPaginationLinksError extends Error {}


/**
 * Get Next and previous link from Shopify header response
 *
 * @param  {String} linkHeader  Link: <https://store_domain.myshopify.com/ADMIN/RESOUREC.json?limit=250&page_info=PAGE_INFO_HASH>; rel="next"
 * @return {Object}             { nextLink { url }, previousLink { url } }
 */

export class PaginationLinkHeaders {
  constructor(linkHeader) {
    const links = this.parseLinkHeader(linkHeader);
    this.previousLink = links.find((link) => link.rel === 'previous');
    this.nextLink = links.find((link) => link.rel === 'next');
  }

  parseLinkHeader(linkHeader) {
    if (!linkHeader) {
      return [];
    }

    const links = linkHeader.split(',');
    return links.map((link) => {
      const parts = link.split('; ');
      if (parts.length !== 2) {
        throw new InvalidPaginationLinksError('Invalid link header: url and rel expected');
      }

      const url = parts[0].match(/<(.*)>/)[1];
      const rel = parts[1].match(/rel="(.*)"/)[1];

      return new LinkHeader(new URL(url), rel);
    });
  }
}

class LinkHeader {
  constructor(url, rel) {
    this.url = url;
    this.rel = rel;
  }
}
