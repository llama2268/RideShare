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
exports.findRides = exports.removePassengerFromRide = exports.deleteRide = exports.updateRide = exports.join_ride = exports.ride_is_complete = exports.createRide = void 0;
const errors_util_1 = require("../utils/errors.util");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createRide = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { driverId, locationStart, locationEnd, driverNotes, date, time } = req.body;
    try {
        const newRide = yield prisma.ride.create({
            data: {
                driverId,
                locationStart,
                locationEnd,
                driverNotes,
                date,
                time,
                isComplete: false,
            },
        });
        const user = yield prisma.user.findUnique({
            where: { id: driverId },
            include: {
                ridesOffered: true,
                passengersForRide: true,
            },
        });
        if (user) {
            let newRole = '';
            const hasRides = user.ridesOffered.length > 0;
            const isPassenger = user.passengersForRide.length > 0;
            if (hasRides && isPassenger) {
                newRole = client_1.Role.RIDER_AND_PASSENGER;
            }
            else if (hasRides) {
                newRole = client_1.Role.RIDER;
            }
            else if (isPassenger) {
                newRole = client_1.Role.PASSENGER;
            }
            if (newRole && user.role !== newRole) {
                yield prisma.user.update({
                    where: { id: driverId },
                    data: { role: newRole },
                });
            }
        }
        res.status(201).json(newRide);
    }
    catch (error) {
        res.status(500).json({ message: (0, errors_util_1.getErrorMessage)(error) });
    }
});
exports.createRide = createRide;
const ride_is_complete = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { rideId } = req.params;
    const foundRide = yield prisma.ride.findUnique({
        where: { id: parseInt(rideId) },
    });
    try {
        if (!foundRide) {
            res.status(404).json({ message: "Ride not found" });
            return;
        }
        else if (foundRide.isComplete) {
            const time_taken = new Date(foundRide.time).getTime() - new Date(foundRide.date).getTime();
            const hours = Math.floor(time_taken / (1000 * 60 * 60));
            const minutes = Math.floor((time_taken % (1000 * 60 * 60)) / (1000 * 60));
            res.status(200).json({
                message: "Ride is complete",
                timeTaken: `${hours} hours and ${minutes} minutes`
            });
        }
        else {
            const updatedRide = yield prisma.ride.update({
                where: { id: parseInt(rideId) },
                data: { isComplete: true },
            });
            const startDateTime = new Date(`${foundRide.date.toString().split('T')[0]}T${foundRide.time}`);
            // Calculate time taken as the difference between now and startDateTime
            const now = new Date();
            const time_taken_ms = now.getTime() - startDateTime.getTime();
            const hours = Math.floor(time_taken_ms / (1000 * 60 * 60));
            const minutes = Math.floor((time_taken_ms % (1000 * 60 * 60)) / (1000 * 60));
            res.status(200).json({
                message: "Ride has been marked as complete",
                timeTaken: `${hours} hours and ${minutes} minutes`,
            });
        }
    }
    catch (error) {
        res.status(500).json({ message: (0, errors_util_1.getErrorMessage)(error) });
    }
});
exports.ride_is_complete = ride_is_complete;
const join_ride = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { rideId } = req.params;
    const { userId } = req.body;
    const foundRide = prisma.ride.findUnique({ where: { id: parseInt(rideId) } });
    if (!foundRide) {
        res.status(404).json({ message: "Ride not found" });
        return;
    }
    try {
        yield prisma.passenger.create({ data: {
                userId,
                rideId: parseInt(rideId)
            } });
        res.status(201).json({ message: "Joined the ride successfully" });
    }
    catch (error) {
        res.status(500).json({ message: (0, errors_util_1.getErrorMessage)(error) });
    }
});
exports.join_ride = join_ride;
const updateRide = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { rideId } = req.params;
    const { locationStart, locationEnd, driverNotes, date, time } = req.body;
    let updateData = {};
    if (locationStart)
        updateData.locationStart = locationStart;
    if (locationEnd)
        updateData.locationEnd = locationEnd;
    if (driverNotes)
        updateData.driverNotes = driverNotes;
    if (date)
        updateData.date = date;
    if (time)
        updateData.time = time;
    try {
        const updated_ride = yield prisma.ride.update({
            where: { id: parseInt(rideId) },
            data: updateData,
        });
        res.status(200).json(updated_ride);
    }
    catch (error) {
        res.status(500).json({ message: errors_util_1.getErrorMessage });
    }
});
exports.updateRide = updateRide;
const deleteRide = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { rideId } = req.params;
    try {
        let passengers = yield prisma.passenger.deleteMany({
            where: { rideId: parseInt(rideId) },
        });
        const deletedRide = yield prisma.ride.delete({
            where: { id: parseInt(rideId) }
        });
        res.status(202).json({ message: "Successfully removed ride", deletedRide, passengers });
    }
    catch (error) {
        res.status(500).json({ message: (0, errors_util_1.getErrorMessage)(error) });
    }
});
exports.deleteRide = deleteRide;
const removePassengerFromRide = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { rideId } = req.params;
    const { userId } = req.body;
    if (!rideId || !userId) {
        res.status(400).json({ message: "rideId and userId not found" });
    }
    try {
        const passenger = yield prisma.passenger.findFirst({ where: {
                rideId: parseInt(rideId),
                userId: userId
            }
        });
        if (!passenger) {
            res.status(404).json({ message: "Passenger was not found" });
        }
        else {
            yield prisma.passenger.delete({
                where: {
                    id: passenger.id
                }
            });
            res.status(200).json({ message: "Passenger was removed successfully" });
        }
    }
    catch (error) {
        throw new Error("Passenger was not removed successfully");
    }
});
exports.removePassengerFromRide = removePassengerFromRide;
const findRides = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { date, startTime, origin, destination } = req.body;
    try {
        const filters = {};
        if (date) {
            filters.date = date;
        }
        if (startTime) {
            filters.time = startTime;
        }
        if (origin) {
            filters.locationStart = origin;
        }
        if (destination) {
            filters.locationEnd = destination;
        }
        const rides = yield prisma.ride.findMany({
            where: filters,
            include: { driver: true,
                passengers: true
            }
        });
        if (rides.length == 0) {
            res.status(404).json({ message: "No rides found matching criteria" });
        }
        res.status(200).json(rides);
    }
    catch (error) {
        console.error("Error finding rides:", error);
        res.status(500).send((0, errors_util_1.getErrorMessage)(error));
    }
});
exports.findRides = findRides;
