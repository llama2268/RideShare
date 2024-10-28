import {Request, Response} from 'express';
import { getErrorMessage } from '../utils/errors.util';
import { PrismaClient} from '@prisma/client';

const prisma = new PrismaClient()

export const createReview = async(req: Request, res: Response) => {
    const {content ,rating, authorId, reviewedUserId, rideId} = req.body
    try {
        const newRating = await prisma.review.create({
            data:{
                content,
                rating,
                authorId,
                reviewedUserId,
                rideId
            }
        })
        res.status(201).json(newRating)
    } catch(error){
        res.status(500).json(getErrorMessage(error))
    }
}

export const updateReview = async(req:Request, res:Response) => {
    const {reviewId} = req.params
    const {content, rating} = req.body
    const updatedCounter: any = {}
    if (content){
        updatedCounter.content = content
    }
    if (rating){
        updatedCounter.rating = rating
    }
    try {
        const updatedReview = await prisma.review.update({
            where: {id: parseInt(reviewId)},
            data: updatedCounter
        })
        res.status(201).json(updatedReview)
    }catch(error){
        res.status(500).json(getErrorMessage(error))
    }
}

export const deleteReview = async(req:Request, res:Response) => {
    const {reviewId} = req.params
    try {
        const deletedReview = await prisma.review.delete({
            where:{id: parseInt(reviewId)}
        })
        res.status(200).json({message:"Successfully deleted review: ",
            deletedReview: deletedReview})
    }catch(error){
        res.status(500).json(getErrorMessage(error))
    }
}