const fs = require('fs');

const takeScreenshot = async(driver, filename) => {
  await driver.manage().window().fullscreen();
  const screenshot = await driver.takeScreenshot();
    fs.writeFileSync(filename, screenshot, 'base64');
    await driver.quit();
};

module.exports = {
  takeScreenshot
};