import { JSDOM } from 'jsdom';
import { CrawlResult } from './types'

const getImageUrl = (el: Node) => (el as HTMLElement).tagName?.toLowerCase() === "img"
    ? (el as HTMLImageElement).src
    : (el as HTMLImageElement).style?.backgroundImage;

const isWebUrl = (uri: string) => {
    try {
        const url = new URL(uri);
        return url.protocol.startsWith("http");
    } catch (e) {
        return false;
    }
}

export const webCrawler = async (gotBody: (url:string)=>Promise<string>, url: string, depth: number) => {
    const body = await gotBody(url);
    const dom = new JSDOM(body);
    const domElements = Array.from(dom.window.document.querySelectorAll('*'));
    const imageList = domElements.map(getImageUrl).filter(u => !!u)
        .map(imageUrl => ({ depth: 0, sourceUrl: url, imageUrl } as CrawlResult));
    const links = domElements.filter(el => (el as Element).tagName === "a")
        .map(a => (a as HTMLAnchorElement).href).filter(isWebUrl);
    if (depth > 0) {
        const subLists = await Promise.all(links.map(l => webCrawler(gotBody, l, depth - 1)));
        subLists.forEach(list => list.forEach(i => i.depth++));
        imageList.concat(...subLists);
    }
    return imageList;
}