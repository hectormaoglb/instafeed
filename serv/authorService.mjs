import { ServiceException } from "../exc/serviceException.mjs";
import {
  findAll,
  findById,
  saveAuthor as save,
  deleteById,
  updateById,
} from "../repo/authorRepo.mjs";

import { v4 as uuidv4 } from "uuid";

import { validateAuthor } from "../validator/authorValidator.mjs";

export const getAllAuthors = async () => findAll();

export const getAuthorById = async (author) => {
  const result = await findById(author);
  if (!result) {
    throw new ServiceException(404, `Author Not Found [${author}]`);
  } else {
    return result;
  }
};

export const saveAuthor = async (author) => {
  const newAuthor = {
    ...author,
    id: uuidv4(),
    articles: [],
  };

  await validateAuthor(newAuthor);
  return save(newAuthor);
};

export const deleteAuthor = async (id) => {
  const result = await deleteById(id);
  if (!result) {
    throw new ServiceException(404, `Author ${id} not found`);
  }
  return result;
};

export const updateAuthor = async (id, newAuthorValues) => {
  const author = {
    ...newAuthorValues,
    id,
  };
  await validateAuthor(author);
  const result = await updateById(id, author);
  if (!result) {
    throw new ServiceException(404, `Author ${id} not found`);
  }
  return result;
};
