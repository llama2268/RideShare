"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const rider_1 = __importDefault(require("../routes/rider"));
const user_1 = __importDefault(require("../routes/user"));
const review_1 = __importDefault(require("../routes/review"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use(body_parser_1.default.json()); // Middleware for parsing JSON requests
// Set up your routes
app.use('/api/rider', rider_1.default);
app.use('/api/user', user_1.default);
app.use('/api/review', review_1.default);
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
