// $ npm run mocha ./cleanIDGraphql.test.js 

const expect = require("chai").expect;
const cleanIDGraphql = require("./cleanIDGraphql");

describe("cleanIDGraphql", function () {
  it("gid://shopify/Product/2178453471321", function () {
    expect(cleanIDGraphql("gid://shopify/Product/2178453471321")).to.equal(2178453471321);
  });

  it("gid://shopify/Product/4201936715875", function () {
    expect(cleanIDGraphql("gid://shopify/Product/4201936715875")).to.equal(4201936715875);
  });
});
