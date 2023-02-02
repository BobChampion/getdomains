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

    let domainTexts = Object.values(domainsElements).map(
      (domainsElement) => domainsElement.innerHTML,
    );
    domainTexts = domainTexts.filter((domainText) => domainText.split('.').at(-1) === 'com');

    return domainTexts;
  });

  console.log(domains);
  Array.prototype.diff = function (a) {
    return this.filter(function (i) {
      return a.indexOf(i) < 0;
    });
  };
  const path = `${searchText}.txt`;

  if (fs.existsSync(path)) {
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      var array = data.toString().split('\n');
      var diffDomains = domains.diff(array);
      diffDomains.forEach((diffDomain) => {
        fs.appendFile(path, diffDomain + '\n', function (err) {
          if (err) return console.log(err);
          console.log('Appended!');
        });
      });
    });
    console.log('file exists');
  } else {
    var file = fs.createWriteStream(path);
    domains.forEach(function (v) {
      file.write(v + '\n');
    });
    file.end();
    console.log('file not found!');
  }

  await browser.close();
}

// getDomains('bonus');
// getDomains('tech');
