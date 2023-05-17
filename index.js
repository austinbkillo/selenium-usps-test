require('chromedriver');

const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const safari = require('selenium-webdriver/safari');

const helpers = require('./helpers.js');


const safariOptions = new safari.Options();
const chromeOptions = new chrome.Options();


const testPostalCalc = async (browser, params) => {
  const dimensions = params.length + 'x' + params.width + 'x' + params.height;

  let driver;
  switch (browser) {
    case 'chrome':
      driver = new Builder().forBrowser('chrome').setChromeOptions(chromeOptions).build();
      break;
    case 'safari':
      driver = new Builder().forBrowser('safari').setSafariOptions(safariOptions).build();
      break;
  }
  try {
    // first I need to open the website
    await driver.get('https://postcalc.usps.com');

    //start filling out the form
    await driver.findElement(By.id('Origin')).sendKeys('78727');
    await driver.findElement(By.id('Destination')).sendKeys('94107');

    //put shippingDate to variable because I access it twice.
    const shippingDate = await driver.findElement(By.id('ShippingDate'));
    await shippingDate.clear();
    await shippingDate.sendKeys('5/01/2023');

    await driver.findElement(By.id('ShippingTime')).sendKeys('between 12:30 PM and 1:00 PM');

    //go to next screen
    await driver.findElement(By.id('option_4')).click();

    // wait for page to load - after clicks sometimes it takes a second
    await driver.wait(until.elementLocated(By.id('Pounds')), 5000);

    //fill in weight and continue to next screen
    await driver.findElement(By.id('Pounds')).sendKeys('25');
    await driver.findElement(By.id('option_4')).click();

    // wait for page to load - after clicks sometimes it takes a second
    await driver.wait(until.elementLocated(By.id('Length')), 5000);

    //get dimension elements, fill them out, then continue to next screen
    const length = await driver.findElement(By.id('Length'));
    const width = await driver.findElement(By.id('Width'));
    const height = await driver.findElement(By.id('Height'));

    await length.clear();
    await length.sendKeys(params.length);
    await width.clear();
    await width.sendKeys(params.width);
    await height.clear();
    await height.sendKeys(params.height);
    await driver.findElement(By.css('#maincontent > form > div.row > div.col-xs-12.col-sm-3.col-md-3 > div.form-group.hidden-print > input')).click()

    // wait for page to load
    await driver.wait(until.elementLocated(By.css('#mail-services-sm-lg > div:nth-child(5) > div.col-sm-12.col-md-10 > table > tbody > tr > td:nth-child(3)')), 5000);

    // find price - error if its > 80
    const priceText = await driver.findElement(By.css('#mail-services-sm-lg > div:nth-child(5) > div.col-sm-12.col-md-10 > table > tbody > tr > td:nth-child(3)')).getAttribute("innerHTML");
    const price = priceText.split('$')[1];

    if (price > 80) {
      await helpers.takeScreenshot(driver, `screenshots/${dimensions}-${browser}.png`);
      return { status: "FAIL", message: `Price is too high: ${price}` }
    };

    // validate that there are images on the page
    const images = await driver.findElements(By.css('img'));
    if (images.length === 0) {
      await helpers.takeScreenshot(driver, `screenshots/${dimensions}-${browser}.png`);
      return { status: "FAIL", message: "No images found" }
    };
    await driver.quit();
    return { status: "PASS", message: "Test Passed"};

} catch (error) {
  await helpers.takeScreenshot(driver, `screenshots/${dimensions}-${browser}.png`);
  return { status: "FAIL", message: error.stack }
}
};

module.exports = {testPostalCalc};