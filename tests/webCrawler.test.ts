import {webCrawler} from "../src/webCrawler";
import {testCases} from "./testCases";

const gotBody = (url:string) => url in testCases ?
     Promise.resolve(testCases[url].body) :
     Promise.reject(new Error("Not Found"));

describe('webCrawler', () => {

    describe('page with one image', () => {
        test('get the image', async () => {
            const r = await webCrawler(gotBody, 'https://single.image.com', 2);
            expect(r.length).toEqual(1);
            expect(r[0].depth).toEqual(0);
        });
    });

});



