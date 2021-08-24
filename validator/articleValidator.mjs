import * as yup from "yup";

import { ServiceException } from "../exc/serviceException.mjs";

const schema = {
  id: yup.string().min(36).max(36).required(),
  title: yup.string().min(1).max(255).required(),
  author: yup.string().uuid().required(),
  modifiedAt: yup.date().max(new Date()).required(),
  publishedAt: yup.date().max(new Date()).nullable().notRequired(),
  url: yup.string().when("publishedAt", {
    is: (value) => !!value,
    then: yup
      .string()
      .url()
      .matches(/^https:\/\/.*$/)
      .required(),
    otherwise: yup
      .string()
      .url()
      .matches(/^https:\/\/.*$/)
      .nullable()
      .notRequired(),
  }),
  keywords: yup.array(yup.string()).min(1).max(3).required(),
  readMins: yup.number().min(1).max(20).required(),
  source: yup
    .string()
    .oneOf(["ARTICLE", "BLOG", "TWEET", "NEWSPAPER"])
    .required(),
};

export const validateArticle = async (article) => {
  try {
    await yup.object().shape(schema).validate(article);
    return true;
  } catch (error) {
    const msg = error.errors.join("\n");
    throw new ServiceException(400, msg);
  }
};

export const validatePartialArticle = async (article) => {
  let partialSchema = Object.keys(article)
    .map((key) => ({ [key]: schema[key] }))
    .reduce((agg, cur) => ({ ...agg, ...cur }), {});

  if ("url" in partialSchema) {
    partialSchema = {
      ...partialSchema,
      url: yup
        .string()
        .url()
        .matches(/^https:\/\/.*$/)
        .required(),
    };
  }

  try {
    await yup.object().shape(partialSchema).validate(article);
    return true;
  } catch (error) {
    const msg = error.errors.join("\n");
    throw new ServiceException(400, msg);
  }
};
