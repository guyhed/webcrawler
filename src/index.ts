import { webCrawler } from './webCrawler';
import fs from 'fs';




const program = async (url: string, depth: number) => {
    const gotModule = await import('got');
    const gotBody = (url: string) => gotModule.got(url).then(r => r.body);
    const result = await webCrawler(gotBody, url, depth)
    await new Promise(resolve => fs.writeFile("results.json", JSON.stringify(result), resolve));
}


const [url, sDepth] = process.argv.slice(2);
program(url, parseInt(sDepth));

