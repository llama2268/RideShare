"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReview = exports.updateReview = exports.createReview = void 0;
const errors_util_1 = require("../utils/errors.util");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/*model Review {
    id                Int       @id @default(autoincrement())
    createdAt         DateTime  @default(now())
    updatedAt         DateTime  @updatedAt
    content           String?   // Optional review content or feedback
    rating            Int       // Rating (e.g., 1-5 stars)
    author            User      @relation("AuthorReviews", fields: [authorId], references: [id])
    authorId          Int
    reviewedUser      User      @relation("ReceivedUserReviews",fields: [reviewedUserId], references: [id])
    reviewedUserId    Int
    ride              Ride      @relation(fields: [rideId], references: [id])
    rideId            Int*/
const createReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { content, rating, authorId, reviewedUserId, rideId } = req.body;
    try {
        const newRating = yield prisma.review.create({
            data: {
                content,
                rating,
                authorId,
                reviewedUserId,
                rideId
            }
        });
        res.status(201).json(newRating);
    }
    catch (error) {
        res.status(500).json((0, errors_util_1.getErrorMessage)(error));
    }
});
exports.createReview = createReview;
const updateReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { reviewId } = req.params;
    const { content, rating } = req.body;
    const updatedCounter = {};
    if (content) {
        updatedCounter.content = content;
    }
    if (rating) {
        updatedCounter.rating = rating;
    }
    try {
        const updatedReview = yield prisma.review.update({
            where: { id: parseInt(reviewId) },
            data: updatedCounter
        });
        res.status(201).json(updatedReview);
    }
    catch (error) {
        res.status(500).json((0, errors_util_1.getErrorMessage)(error));
    }
});
exports.updateReview = updateReview;
const deleteReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { reviewId } = req.params;
    try {
        const deletedReview = yield prisma.review.delete({
            where: { id: parseInt(reviewId) }
        });
        res.status(200).json({ message: "Successfully deleted review: ",
            deletedReview: deletedReview });
    }
    catch (error) {
        res.status(500).json((0, errors_util_1.getErrorMessage)(error));
    }
});
exports.deleteReview = deleteReview;
