export type TestCase = {
    url: string;
    body: string,
    images: string[],
    children: string[]
}

export const testCases: TestCase[] = [
    {
        url: 'https://single.image.com/index.html',
        body: '<img src="//url1/image1.jpg">',
        images: ["//url1/image1.jpg"],
        children: []
    },
    {
        url: 'https://single.child.com/index.html',
        body: '<div><a href="https://single.image.com/index.html">s</a></div>',
        images: [],
        children: ["https://single.image.com/index.html"]
    }
]