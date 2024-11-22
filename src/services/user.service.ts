import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getErrorMessage } from '../utils/errors.util';

const prisma = new PrismaClient()
const salt_rounds = 10
const JWT_SECRET = process.env.JWT_SECRET as string;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;
 
const isTokenExpired = (token: string): boolean => {
  const decodedToken = jwt.decode(token) as {exp: number}
  return decodedToken.exp * 1000 < Date.now()
}

export const register = async(user: {name: string, email: string, password: string} ) => {
  const hashed_password = await bcrypt.hash(user.password, salt_rounds, )
  try {
    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        clerkUserId: "",
        password: hashed_password
      }
    }
  )
  }catch (error) {
    throw error;
  }
}


export const login = async(user:{id:number, name: string, email: string, password:string}) => {
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
  const access_token = jwt.sign({id:found_user.id, email:found_user.email,name:found_user.name,
    password:found_user.password,role:found_user.role},JWT_SECRET,
  {expiresIn: '15m'})
  
  let refreshToken: string;
  let storedrefreshToken = await prisma.refreshToken.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  if (storedrefreshToken && !isTokenExpired(storedrefreshToken.token)) {
    refreshToken = storedrefreshToken.token;
    return refreshToken + " :User is logged in already"
  } else {
    refreshToken = jwt.sign({ id: found_user.id }, REFRESH_TOKEN_SECRET, { expiresIn: '24h' });
  }
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
    },
  });
  
  return {user: {id: found_user.id, email: found_user.email, name:found_user.name,
    password:found_user.password,role:found_user.role},access_token, refreshToken}
  }
  catch (error){
    throw error
  }
}

//If refresh token exists, keep refreshing the access token
export const refresh_access_token = async(refreshToken: string) => {
  try {
    const payload = jwt.verify(refreshToken,REFRESH_TOKEN_SECRET) as {id: number}
    const userId = payload.id

    const storedRefreshToken = await prisma.refreshToken.findUnique({where:{
      token: refreshToken
    }})

    if (!storedRefreshToken || isTokenExpired(storedRefreshToken.token)){
      throw new Error("Invalid or expired refresh token")
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user){
      throw new Error("User not found")
    }
    const accessToken = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '15m' })

    return {accessToken, user:{id: user.id, email:user.email, name:user.name, role:user.role}}
  }catch(error){
    throw new Error("Failed to refresh access token")
}
}

export const userLogout = async(refreshToken: string) => {
  try {
    const deletedToken = await prisma.refreshToken.deleteMany({
      where: {token: refreshToken}
    })
    if (deletedToken.count == 0){
      return new Error("Refresh token not found")
    }
  }catch(error){
    throw new Error("Failed to log out user")
  }
}