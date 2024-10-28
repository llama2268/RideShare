"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.logOut = exports.refreshToken = exports.registerOne = exports.loginOne = void 0;
const userServices = __importStar(require("../services/user.service"));
const errors_util_1 = require("../utils/errors.util");
const loginOne = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const foundUser = yield userServices.login(req.body);
        res.status(200).json(foundUser);
    }
    catch (error) {
        res.status(500).send((0, errors_util_1.getErrorMessage)(error));
    }
});
exports.loginOne = loginOne;
const registerOne = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield userServices.register(req.body);
        res.status(200).send('User registered successfully');
    }
    catch (error) {
        res.status(500).send((0, errors_util_1.getErrorMessage)(error));
    }
});
exports.registerOne = registerOne;
const refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        res.status(400).json({ message: "Refresh token is required" });
    }
    try {
        const result = yield userServices.refresh_access_token(refreshToken);
        if (result.accessToken) {
            res.status(200).json(result);
        }
        else {
            res.status(403).json({ message: "Invalid or expired refresh token" });
        }
    }
    catch (error) {
        res.status(500).send((0, errors_util_1.getErrorMessage)(error));
    }
});
exports.refreshToken = refreshToken;
const logOut = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        res.status(400).json({ message: "Refresh token is required, failed to acquire token" });
    }
    try {
        const result = yield userServices.userLogout(refreshToken);
        if (result) {
            res.status(200).json({ message: "Successfully logged out user" });
        }
    }
    catch (error) {
        res.status(500).send((0, errors_util_1.getErrorMessage)(error));
    }
});
exports.logOut = logOut;
