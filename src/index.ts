import { webCrawler } from './webCrawler';



const program = async (url:string, depth: number) => {
    const gotModule = await import('got');
    const gotBody = (url: string) => gotModule.got (url).then(r => r.body);
    const result = await webCrawler(gotBody, url, depth)
    console.log(result);
}


const [url, sDepth] = process.argv.slice(2);
program(url,parseInt(sDepth));

