"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const config_1 = require("./config/config");
const routes_1 = __importDefault(require("./routes"));
const sequelize = (0, config_1.connectDB)();
const app = (0, express_1.default)();
app.use((0, express_session_1.default)({ secret: 'maybe_token', resave: false, saveUninitialized: true }));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.get('/', (req, res) => {
    res.send('<a href="/auth/google">Login with Google</a>');
});
app.get('/auth/google', passport_1.default.authenticate('google', { scope: ['email', 'profile'] }));
app.get('/auth/google/callback', passport_1.default.authenticate('google', {
    successRedirect: '/protected',
    failureRedirect: '/auth/google/failure'
}));
app.get('/protected', (req, res) => {
    res.send(`Hello ${req.user?.name}`);
});
app.get('/auth/google/failure', (req, res) => {
    res.send('Failed to authenticate..');
});
app.use(express_1.default.static('public'));
app.set('view engine', 'ejs');
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(routes_1.default);
app.get('/welcome', (req, res) => {
    res.send('Welcome to Task Management API');
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("There's something wrong...");
});
// Start the server
const PORT = 3000;
async function startServer() {
    const sequelize = await (0, config_1.connectDB)();
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
startServer();
//# sourceMappingURL=app.js.map