"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const port = process.env.PORT || 5000;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const route_1 = __importDefault(require("./tests/function/route"));
const route_2 = __importDefault(require("./tests/react/route"));
// ==== Server Setup ====
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// ==== Grading Route ==== //
app.use("/grade/js", route_1.default);
app.use("/grade/react", route_2.default);
// ==== Start Server ==== //
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
