import { ServiceException } from "../exc/serviceException.mjs";
import {
  findAll,
  findById,
  saveUser as save,
  deleteById,
  updateById,
  findByLogin,
} from "../repo/userRepo.mjs";

import { validateUser } from "../validator/userValidator.mjs";

import { createHash } from "crypto";

export const getAllUsers = async () => {
  const users = await findAll();
  return users.map((usr) => ({
    ...usr,
    password: undefined,
  }));
};

export const getUserById = async (login) => {
  const result = await findById(login);
  if (!result) {
    throw new ServiceException(404, `User Not Found [${login}]`);
  } else {
    return {
      ...result,
      password: undefined,
    };
  }
};

export const getUserByLogin = async (login, password) => {
  const result = await findByLogin(login, password);
  if (!result) {
    throw new ServiceException(404, `User Not Found [${login}]`);
  } else {
    return result;
  }
};

const encryptPassword = (password) =>
  createHash("sha256").update(password).digest("hex");

export const saveUser = async (user) => {
  await validateUser(user);
  const saltedPassword = encryptPassword(user.password);

  const newUser = {
    ...user,
    password: saltedPassword,
  };

  return save(newUser);
};

export const deleteUser = async (login) => {
  const result = await deleteById(login);
  if (!result) {
    throw new ServiceException(404, `User ${login} not found`);
  }
  return result;
};

export const updateUser = async (login, newUserValues) => {
  const user = {
    ...newUserValues,
    login,
  };
  await validateUser(user);
  const result = await updateById(login, user);
  if (!result) {
    throw new ServiceException(404, `User ${login} not found`);
  }
  return result;
};

export const login = async (username, password) => {
  const saltedPassword = encryptPassword(password);
  const user = await getUserByLogin(username, saltedPassword);
  if (!user) {
    return null;
  }
  return user;
};
