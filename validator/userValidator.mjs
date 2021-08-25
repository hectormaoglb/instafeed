import * as yup from "yup";

import { ServiceException } from "../exc/serviceException.mjs";

const schema = {
  login: yup.string().required(),
  password: yup.string().required(),
  roles: yup.array(yup.string()).min(0).required(),
};

export const validateUser = async (user) => {
  try {
    await yup.object().shape(schema).validate(user);
    return true;
  } catch (error) {
    const msg = error.errors.join("\n");
    throw new ServiceException(400, msg);
  }
};
