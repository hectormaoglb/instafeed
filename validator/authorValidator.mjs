import * as yup from "yup";

import { ServiceException } from "../exc/serviceException.mjs";

const schema = {
  id: yup.string().required(),
  name: yup.string().required(),
  articles: yup.array(yup.string()).min(0).required(),
};

export const validateAuthor = async (author) => {
  try {
    await yup.object().shape(schema).validate(author);
    return true;
  } catch (error) {
    const msg = error.errors.join("\n");
    throw new ServiceException(400, msg);
  }
};
