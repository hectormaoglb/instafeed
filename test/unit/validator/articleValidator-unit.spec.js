import fs from "fs/promises";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

import { validateArticle } from "../../../validator/articleValidator.mjs";
import { ServiceException } from "../../../exc/serviceException.mjs";

chai.use(chaiAsPromised);
chai.should();

describe("Article Validator Test", () => {
  let article;

  beforeAll(async () => {
    article = JSON.parse(
      await fs.readFile("./test/fixtures/validArticle.json")
    );
  });

  it("Valid Article", async () => {
    const resultPromise = validateArticle(article);
    return resultPromise.should.be.fulfilled;
  });

  it("Invalid Article - without id", async () => {
    const testArticle = {
      ...article,
      id: undefined,
    };
    const resultPromise = validateArticle(testArticle);
    return resultPromise.should.be.rejectedWith(ServiceException);
  });

  it("Invalid Article - id length", async () => {
    const testArticle = {
      ...article,
      id: "InvalidIdLength",
    };
    const resultPromise = validateArticle(testArticle);
    return resultPromise.should.be.rejectedWith(ServiceException);
  });

  it("Invalid Article - without title", async () => {
    const testArticle = {
      ...article,
      title: undefined,
    };
    const resultPromise = validateArticle(testArticle);
    return resultPromise.should.be.rejectedWith(ServiceException);
  });

  it("Invalid Article - title length", async () => {
    const testArticle = {
      ...article,
      title: "",
    };
    const resultPromise = validateArticle(testArticle);
    return resultPromise.should.be.rejectedWith(ServiceException);
  });

  it("Invalid Article - without modifiedAt", async () => {
    const testArticle = {
      ...article,
      modifiedAt: null,
    };
    const resultPromise = validateArticle(testArticle);
    return resultPromise.should.be.rejectedWith(ServiceException);
  });

  it("Invalid Article - invalid modifiedAt format", async () => {
    const testArticle = {
      ...article,
      modifiedAt: "notADate",
    };
    const resultPromise = validateArticle(testArticle);
    return resultPromise.should.be.rejectedWith(ServiceException);
  });

  it("Invalid Article - modifiedAt in future", async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);

    const testArticle = {
      ...article,
      modifiedAt: futureDate.toLocaleDateString("en-US"),
    };
    const resultPromise = validateArticle(testArticle);
    return resultPromise.should.be.rejectedWith(ServiceException);
  });

  it("Invalid Article - publishedAt in future", async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);

    const testArticle = {
      ...article,
      publishedAt: futureDate.toLocaleDateString("en-US"),
    };
    const resultPromise = validateArticle(testArticle);
    return resultPromise.should.be.rejectedWith(ServiceException);
  });

  it("Valid Article - publishedAt null url null", async () => {
    const testArticle = {
      ...article,
      publishedAt: undefined,
      url: undefined,
    };
    const resultPromise = validateArticle(testArticle);
    return resultPromise.should.be.fulfilled;
  });

  it("Invalid Article - http url", async () => {
    const testArticle = {
      ...article,
      url: "http://bad-url.com",
    };
    const resultPromise = validateArticle(testArticle);
    return resultPromise.should.be.rejectedWith(ServiceException);
  });

  it("Invalid Article - keywords length 4", async () => {
    const testArticle = {
      ...article,
      keywords: ["1", "2", "3", "4"],
    };
    const resultPromise = validateArticle(testArticle);
    return resultPromise.should.be.rejectedWith(ServiceException);
  });

  it("Invalid Article - readMins 25", async () => {
    const testArticle = {
      ...article,
      readMins: 25,
    };
    const resultPromise = validateArticle(testArticle);
    return resultPromise.should.be.rejectedWith(ServiceException);
  });

  it("Invalid Article - readMins as String", async () => {
    const testArticle = {
      ...article,
      readMins: "invalid readMins",
    };
    const resultPromise = validateArticle(testArticle);
    return resultPromise.should.be.rejectedWith(ServiceException);
  });

  it("Invalid Article - source UNKNOWN", async () => {
    const testArticle = {
      ...article,
      source: "UNKNOWN",
    };
    const resultPromise = validateArticle(testArticle);
    return resultPromise.should.be.rejectedWith(ServiceException);
  });
});
