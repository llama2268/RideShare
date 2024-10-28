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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userLogout = exports.refresh_access_token = exports.login = exports.register = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const salt_rounds = 10;
const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const isTokenExpired = (token) => {
    const decodedToken = jsonwebtoken_1.default.decode(token);
    return decodedToken.exp * 1000 < Date.now();
};
const register = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const hashed_password = yield bcrypt_1.default.hash(user.password, salt_rounds);
    try {
        yield prisma.user.create({
            data: {
                name: user.name,
                email: user.email,
                password: hashed_password
            }
        });
    }
    catch (error) {
        throw error;
    }
});
exports.register = register;
const login = (user) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const found_user = yield prisma.user.findUnique({
            where: {
                name: user.name,
                email: user.email
            }
        });
        if (!found_user) {
            throw new Error("User not found");
        }
        const password_valid = bcrypt_1.default.compare(found_user.password, user.password);
        if (!password_valid) {
            throw new Error("Password invalid");
        }
        const access_token = jsonwebtoken_1.default.sign({ id: found_user.id, email: found_user.email, name: found_user.name,
            password: found_user.password, role: found_user.role }, JWT_SECRET, { expiresIn: '15m' });
        let refreshToken;
        let storedrefreshToken = yield prisma.refreshToken.findFirst({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
        });
        if (storedrefreshToken && !isTokenExpired(storedrefreshToken.token)) {
            refreshToken = storedrefreshToken.token;
            return refreshToken + " :User is logged in already";
        }
        else {
            refreshToken = jsonwebtoken_1.default.sign({ id: found_user.id }, REFRESH_TOKEN_SECRET, { expiresIn: '24h' });
        }
        yield prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
            },
        });
        return { user: { id: found_user.id, email: found_user.email, name: found_user.name,
                password: found_user.password, role: found_user.role }, access_token, refreshToken };
    }
    catch (error) {
        throw error;
    }
});
exports.login = login;
//If refresh token exists, keep refreshing the access token
const refresh_access_token = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payload = jsonwebtoken_1.default.verify(refreshToken, REFRESH_TOKEN_SECRET);
        const userId = payload.id;
        const storedRefreshToken = yield prisma.refreshToken.findUnique({ where: {
                token: refreshToken
            } });
        if (!storedRefreshToken || isTokenExpired(storedRefreshToken.token)) {
            throw new Error("Invalid or expired refresh token");
        }
        const user = yield prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new Error("User not found");
        }
        const accessToken = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
        return { accessToken, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
    }
    catch (error) {
        throw new Error("Failed to refresh access token");
    }
});
exports.refresh_access_token = refresh_access_token;
const userLogout = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deletedToken = yield prisma.refreshToken.deleteMany({
            where: { token: refreshToken }
        });
        if (deletedToken.count == 0) {
            return new Error("Refresh token not found");
        }
    }
    catch (error) {
        throw new Error("Failed to log out user");
    }
});
exports.userLogout = userLogout;
