import { JSDOM } from 'jsdom';
import { CrawlResult } from './types'
import { chain } from 'lodash';


const getUrl = (sourceUrl: URL) => (url: string) => {
    const urlStr = url?.startsWith("//") ? sourceUrl.protocol + url :
        url?.startsWith("/") ? sourceUrl.origin + url : url;
    try {
        return new URL(urlStr);
    } catch {
        return null;
    }
}

const isTag = (tagName: string) => (el: Node) =>
    (el as Element).tagName.toUpperCase() === tagName.toUpperCase();

const getImageSourceUrl = (url: URL) => (el: Node) =>
    getUrl(url)(isTag("img")(el)
        ? (el as HTMLImageElement).src
        : (el as HTMLElement).style?.backgroundImage)

const isWebUrl = (url: URL | null) => {
    return !!url && url.protocol.startsWith('http');
}


const getElements = async (gotBody: (url: string) => Promise<string>, url: URL) => {
    try {
        const body = await gotBody(url.href);
        const dom = new JSDOM(body);
        return Array.from(dom.window.document.querySelectorAll('*'));
    } catch (error) {
        console.error(error);
        return [] as Element[];
    }
}

const getImageUrls = (domElements: Element[], sourceUrl: URL, imageMap: Map<string, CrawlResult>) =>
    chain(domElements)
        .map(getImageSourceUrl(sourceUrl))
        .map(url => url?.href as string)
        .filter(u => !!u && !imageMap.has(u)).value();

const getLinks = (domElements: Element[], sourceUrl: URL, linksSet: Set<string>) =>
    chain(domElements).filter(isTag("a"))
        .map(a => getUrl(sourceUrl)((a as HTMLAnchorElement).href))
        .uniqBy(u => u?.href)
        .filter(u => isWebUrl(u) && !linksSet.has((u as URL).href)).value()

export const webCrawler = async (gotBody: (url: string) => Promise<string>, startUrl: string, maxDepth: number) => {
    const stack: Array<{ url: URL, depth: number }> = [{ url: new URL(startUrl), depth: 0 }];
    const imageMap = new Map<string, CrawlResult>();
    const linksSet = new Set<string>();
    while (stack.length > 0) {
        const { url, depth } = stack.shift() as { url: URL, depth: number };
        const domElements = await getElements(gotBody, url);
        getImageUrls(domElements, url, imageMap).forEach(u => {
            imageMap.set(u, { depth, sourceUrl: url.href, imageUrl: u } as CrawlResult)
        })
        if (depth < maxDepth) {
            getLinks(domElements, url, linksSet).forEach(u => {
                stack.push({ url: u as URL, depth: depth + 1 })
                linksSet.add((u as URL).href);
            });
        }
    }
    return Array.from(imageMap.values());
}