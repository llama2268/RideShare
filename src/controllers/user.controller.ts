import {Request, Response} from 'express';
import * as userServices from '../services/user.service';
import { getErrorMessage } from '../utils/errors.util';

export const loginOne = async (req: Request, res: Response) => {
  try {
    const foundUser = await userServices.login(req.body);
    res.status(200).json(foundUser);
  } catch (error) {
    res.status(500).send(getErrorMessage(error));
  }
};

export const registerOne = async (req: Request, res: Response) => {
  try {
    await userServices.register(req.body);
    res.status(200).send('User registered successfully');
  } catch (error) {
    res.status(500).send(getErrorMessage(error));
  }
};