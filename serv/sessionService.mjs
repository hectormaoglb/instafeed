import { ServiceException } from "../exc/serviceException.mjs";
import { findById } from "../repo/userRepo.mjs";

const createSession = async (auth) => {
  const match = auth.match(/(.*) (.*)/);
  if (!match) {
    new ServiceException(401, "Invalid Authorization header");
  }
};
