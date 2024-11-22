import { Router } from 'express';
import * as reviewController from '../controllers/review.controller';
import {requireAuth} from "@clerk/express";
const router = Router();

router.post('/create',requireAuth(),reviewController.createReview)
router.delete('/delete/:reviewId/review',requireAuth(),reviewController.deleteReview)
router.put('/update/:reviewId/review',requireAuth(),reviewController.updateReview)

export default router