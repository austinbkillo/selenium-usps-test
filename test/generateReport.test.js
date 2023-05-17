const tests = require('../index.js');
const assert = require('assert');
const addContext = require('mochawesome/addContext');

const browsers = ['chrome', 'safari'];
const params = [
  {length: 16, width: 12, height: 12},
  {length: 22, width: 18, height: 12},
  {length: 28, width: 15, height: 16},
];

describe('test postal calc', function () {

  afterEach(function(){
    if (this.currentTest.state === 'failed') {
      addContext(this, '../screenshots/' + this.currentTest.title + '.png');
    }
  });

  for (let browser of browsers) {
    for (let param of params) {
      it(`${param.length}x${param.width}x${param.height}-${browser}`, async function () {
        this.timeout(12000); //allow up to 12 seconds - takes awhile
        const result = await tests.testPostalCalc(browser, param);
        const message = result.message;
        try {
          assert.equal(result.status, 'PASS', result.message);
        } catch (error) {
          // use this to clean up error message, rather than showing assertion errors
          console.error(message);
        }
        assert.equal(result.status, 'PASS', result.message);
      })
    }
  }
});