import { Router } from 'express';
import * as reviewController from '../controllers/review.controller';
import { auth } from '../middleware/auth';

const router = Router();

router.post('/create',auth,reviewController.createReview)
router.delete('/delete/:reviewId/review',auth,reviewController.deleteReview)
router.put('/update/:reviewId/review',auth,reviewController.updateReview)

export default router