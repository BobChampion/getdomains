const htpps = require('https');
const fs = require('fs');
const puppeteer = require('puppeteer');

async function getDomains(searchText) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('https://domainwheel.com/');
  await page.setViewport({ width: 1080, height: 1024 });
  await page.focus('#keyword');
  await page.keyboard.type(searchText);
  await page.click('.form-domain-search-btn');

  const pageTarget = page.target();
  const newTarget = await browser.waitForTarget((target) => target.opener() === pageTarget);
  //get the new page object:
  const newPage = await newTarget.page();
  await newPage.waitForSelector('.btn-select-filter');
  await newPage.click('.btn-select-filter');
  try {
  } catch (error) {
    if (error) {
      console.log(error);
    }
  }

  await newPage.waitForSelector('.checkbox-input');
  await newPage.click('#info');
  await newPage.click('#org');
  await newPage.click('#net');
  await newPage.click('#blog');
  await newPage.waitForSelector('.filter-menu .filter-menu-right .btn-container> a.btn-primary');
  await newPage.click('.filter-menu .filter-menu-right .btn-container> a.btn-primary');

  await newPage.waitForSelector('.domain-name .text');
  let domains = await newPage.evaluate(() => {
    let domainsElements = document.querySelectorAll('.domain-name .text');

    let domainTexts = Object.values(domainsElements).map((domainsElement) => ({
      name: domainsElement.innerHTML,
    }));

    return domainTexts;
  });

  console.log(domains);

  fs.writeFile(`${searchText}.json`, JSON.stringify(domains, null, ' '), (err) => {
    if (err) return err;
    console.log('domains > domains.txt');
  });

  await browser.close();
}

// getDomains('bonus');
getDomains('tech');
