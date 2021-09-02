import fs from "fs/promises";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

import { validateAuthor } from "../../../validator/authorValidator.mjs";
import { ServiceException } from "../../../exc/serviceException.mjs";

chai.use(chaiAsPromised);
chai.should();

describe("Author Validator Test", () => {
  let author;

  beforeAll(async () => {
    author = JSON.parse(await fs.readFile("./test/fixtures/validAuthor.json"));
  });

  it("Valid Author", async () => {
    const resultPromise = validateAuthor(author);
    return resultPromise.should.be.fulfilled;
  });

  it("Invalid Author - without id", async () => {
    const testAuthor = {
      ...author,
      id: undefined,
    };
    const resultPromise = validateAuthor(testAuthor);
    return resultPromise.should.be.rejectedWith(ServiceException);
  });

  it("Invalid Author - without name", async () => {
    const testAuthor = {
      ...author,
      name: undefined,
    };
    const resultPromise = validateAuthor(testAuthor);
    return resultPromise.should.be.rejectedWith(ServiceException);
  });

  it("Invalid Author - without articles", async () => {
    const testAuthor = {
      ...author,
      articles: undefined,
    };
    const resultPromise = validateAuthor(testAuthor);
    return resultPromise.should.be.rejectedWith(ServiceException);
  });
});
