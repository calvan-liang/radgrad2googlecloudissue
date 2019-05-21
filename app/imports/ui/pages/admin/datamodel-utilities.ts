/**
 * Returns a link element for opening URL in a new tab.
 * @param url The URL.
 * @returns {string} The 'a' element for opening the URL in a new tab.
 * @memberOf ui/components/admin
 */
export function makeLink(url: string): string {
  return (url) ? `<a target='_blank' href="${url}">${url}</a>` : '';
}

export function makeMarkdownLink(url: string): string {
  return (url) ? `[${url}](${url})` : ' ';
}

export const makeYoutubeLink = (url: string): string => ( url ? `https://youtu.be/${url}` : '');
