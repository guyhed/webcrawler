import { JSDOM } from 'jsdom';
import { CrawlResult } from './types'

const isTag = (tagName: string) => (el: Node) =>
    (el as Element).tagName.toUpperCase() === tagName.toUpperCase();

const getImageUrl = (el: Node) => isTag("img")(el)
    ? (el as HTMLImageElement).src
    : (el as HTMLElement).style?.backgroundImage;

const isWebUrl = (uri: string) => {
    try {
        const url = new URL(uri);
        return url.protocol.startsWith("http");
    } catch (e) {
        return false;
    }
}

const fixProtocol = (url: string, sourceUrl: string) => {
    if (url.startsWith("//")) return "https:" + url;
    else if (url.startsWith("/")) return (new URL(sourceUrl)).origin + url;
    else return url;
}

export const webCrawler = async (gotBody: (url: string) => Promise<string>, url: string, depth: number) => {
    try {
        const body = await gotBody(url);
        const dom = new JSDOM(body);
        const domElements = Array.from(dom.window.document.querySelectorAll('*'));
        const imageList = domElements.map(getImageUrl).filter(u => !!u)
            .map(imageUrl => ({ depth: 0, sourceUrl: url, imageUrl } as CrawlResult));
        const links = domElements.filter(isTag("a"))
            .map(a => fixProtocol((a as HTMLAnchorElement).href, url)).filter(isWebUrl);
        if (depth > 0) {
            const subLists = await Promise.all(links.map(l => webCrawler(gotBody, l, depth - 1)));
            const joined = ([] as CrawlResult[]).concat(...subLists);
            joined.forEach(i => i.depth++);
            imageList.push(...joined);
        }
        return imageList;
    } catch {
        return [] as CrawlResult[];
    }
}