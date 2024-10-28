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

export const refreshToken = async (req:Request, res:Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400).json({ message: "Refresh token is required" });
  }
  try {
    const result = await userServices.refresh_access_token(refreshToken);

    if (result.accessToken) {
      res.status(200).json(result);
    } else {
      res.status(403).json({ message: "Invalid or expired refresh token" });
    }
  } catch (error) {
    res.status(500).send(getErrorMessage(error));
  }
}

export const logOut = async (req: Request, res: Response) => {
  const {refreshToken} = req.body
  if (!refreshToken) {
    res.status(400).json({message:"Refresh token is required, failed to acquire token"})
  }
  try {
    const result = await userServices.userLogout(refreshToken)
      if (result){
        res.status(200).json({message:"Successfully logged out user"})
      }
    
  }catch(error){
    res.status(500).send(getErrorMessage(error))
  }
}