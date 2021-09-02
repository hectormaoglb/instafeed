import fs from "fs/promises";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

import { validateUser } from "../../../validator/userValidator.mjs";
import { ServiceException } from "../../../exc/serviceException.mjs";

chai.use(chaiAsPromised);
chai.should();

describe("User Validator Test", () => {
  let user;

  beforeAll(async () => {
    user = JSON.parse(await fs.readFile("./test/fixtures/validUser.json"));
  });

  it("Valid User", async () => {
    const resultPromise = validateUser(user);
    return resultPromise.should.be.fulfilled;
  });

  it("Invalid User - without login", async () => {
    const testUser = {
      ...user,
      login: undefined,
    };
    const resultPromise = validateUser(testUser);
    return resultPromise.should.be.rejectedWith(ServiceException);
  });

  it("Invalid User - without password", async () => {
    const testUser = {
      ...user,
      password: undefined,
    };
    const resultPromise = validateUser(testUser);
    return resultPromise.should.be.rejectedWith(ServiceException);
  });

  it("Invalid User - without roles", async () => {
    const testUser = {
      ...user,
      roles: undefined,
    };
    const resultPromise = validateUser(testUser);
    return resultPromise.should.be.rejectedWith(ServiceException);
  });
});
