import { PrismaClient } from '@prisma/client';
import { Request, Response, NextFunction } from "express";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const salt_rounds = 10
const JWT_SECRET = process.env.JWT_SECRET as string;
 

export const register = async(user: {name: string, email: string, password: string} ) => {
  const hashed_password = await bcrypt.hash(user.password, salt_rounds, )
  try {
    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: hashed_password
      }
    }
  )
  }catch (error) {
    throw error;
  }
}


export const login = async(user:{ name: string, email: string, password:string}) => {
  try{
  const found_user = await prisma.user.findUnique({
    where: {
      name: user.name,
      email: user.email
    }
  })
  if (!found_user){
    throw new Error("User not found")
  }
  const password_valid = bcrypt.compare(found_user.password,user.password)
  if (!password_valid){
    throw new Error ("Password invalid")
    
  }
  const token = jwt.sign({id:found_user.id, email:found_user.email,name:found_user.name,
    password:found_user.password,role:found_user.role},JWT_SECRET)
  
  return {user: {id: found_user.id, email: found_user.email, name:found_user.name,
    password:found_user.password,role:found_user.role},token}
  }
  catch (error){
    throw error
  }
}