import {webCrawler} from "../src/webCrawler";
import {testCases} from "./testCases";

const gotBody = (url:string) => {
     const tc = testCases.find(t => t.url === url);
     return tc ? Promise.resolve(tc.body) : Promise.reject(new Error("Not Found"));
}

describe('webCrawler', () => {

    describe('page with one image', () => {
        test('get the image', async () => {
            const r = await webCrawler(gotBody, testCases[0].url, 2);
            expect(r.length).toEqual(1);
            expect(r[0].depth).toEqual(0);
        });
    });
    describe('page with one child', () => {
        test('get the image', async () => {
            const r = await webCrawler(gotBody, testCases[1].url, 2);
            expect(r.length).toEqual(1);
            expect(r[0].depth).toEqual(1);
        });
    });
    describe('page with children nad loop', () => {
        test('get the images', async () => {
            const r = await webCrawler(gotBody, testCases[2].url, 3);
            expect(r.length).toEqual(2);
            expect(r[0].depth).toEqual(0);
            expect(r[1].depth).toEqual(1);
        });
    });

});



