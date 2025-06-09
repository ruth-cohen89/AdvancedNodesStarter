    const Page = require('./helpers/page');

let page;

beforeEach(async () => {
    // proxy
    page = await Page.build();
    await page.goto('http://localhost:3000');
})

afterEach(async() => {
  await page.close()
});

test('The header has the correct text', async() => {
    const text = await page.getContentsOf('a.brand-logo');

    expect(text).toEqual('Blogster');
});

test('clicking login start oauth flow', async() => {
  await page.click('.right a');

  const url = await page.url();

  await expect(url).toMatch(/accounts\.google\.com/);
})

test('When signed in, shows logout button', async() => {
    await page.login();
    const text = await page.getContentsOf('a[href="/auth/logout"]')
    expect(text).toEqual('Logout');
})

test('When signed in, shows my blogs button', async() => {
    await page.login();
    const text = await page.getContentsOf('.right a')

    expect(text).toEqual('My Blogs');
})


 // Can be added
// test('When logged in, Clicking my blogs button navigates to the right url', async() => {
//     await page.login();
//     await page.click('.right a')
//     await page.click('.material-icons');
//     const url = await page.url();
//
//    expect(url).toEqual('http://localhost:3000/blogs/new');
// })