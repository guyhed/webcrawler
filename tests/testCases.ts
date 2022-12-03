export type TestCase = {
    body: string,
    images: string[],
    children: string[]
}

export const testCases: {[url:string]:TestCase}  = {
    'https://single.image.com' : {
        body: '<img src="//url1/image1.jpg">',
        images : ["//url1/image1.jpg"],
        children: []
    }
}