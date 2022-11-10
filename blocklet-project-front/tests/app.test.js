const timeout = 5000;
const responseData = (page) => {
  return new Promise((resolve) => {
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('blockchain.info/rawblock')) {
        const result = await response.json();
        resolve(result.hash);
      }
    });
  });
};
describe(
  '/',
  () => {
    let page;
    beforeAll(async () => {
      page = await globalThis.__BROWSER_GLOBAL__.newPage();
      await page.goto('http://localhost:8090');
    }, timeout);
    it('should load without error and have a input element', async () => {
      const input = await page.waitForSelector('input');
      expect(input.toString()).toBe('JSHandle@node');
    });
    it('should load without error and search with a block hash', async () => {
      let isContain = false;
      const input = await page.waitForSelector('input');
      await input.type('123');
      await page.waitForTimeout(1000);
      await page.keyboard.press('Enter');
      page.on('response', (response) => {
        if (response.url().includes('https://blockchain.info/rawblock/')) {
          isContain = true;
        }
        expect(isContain).toBe(true);
      });
    });
    it('should load without error and search with any block hash', async () => {
      const arr = [];
      const input = await page.waitForSelector('input');
      await input.type('123');
      await page.waitForTimeout(1000);
      await page.keyboard.press('Enter');
      arr.push(await responseData(page));
      await page.waitForTimeout(1000);
      // 清空后在输入
      await page.evaluate(() => document.execCommand('selectall', false, null));
      await page.keyboard.press('Backspace');
      await input.type('321');
      await page.waitForTimeout(1000);
      await page.keyboard.press('Enter');
      arr.push(await responseData(page));
      await page.waitForTimeout(1000);
      expect([...new Set(arr)].length).toBe(2);
    });
  },
  timeout
);
