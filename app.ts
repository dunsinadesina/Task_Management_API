import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import passport from 'passport';
import { connectDB } from './config/config';
import router from './routes';
import cookieParser from 'cookie-parser';
import { cookie } from 'express-validator';

const sequelize = connectDB();

const app = express();

// Custom type definition for req.user
declare global {
    namespace Express {
        interface User {
            name: string;
            email: string;
        }
    }
}

app.use(session({
    secret: `${process.env.SECRET_TOKEN}`,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true }
}));
app.use(passport.initialize());
app.use(passport.session());
 app.use(cookieParser());

app.get('/', (req: Request, res: Response) => {
    res.send('<a href="/auth/google">Login with Google</a>');
});

app.get('/home', (req: Request, res: Response) => {
    res.send(`${process.env.FRONTEND_URL}/dashboard`);
});

app.get('/auth/google',
    passport.authenticate('google', { scope: ['email', 'profile'] })
);

app.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect: '/protected',
        failureRedirect: '/auth/google/failure'
    })
);

app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`Incoming Request: ${req.method} ${req.url}`);
    console.log('Request Headers:', req.headers);
    console.log('Request Body:', req.body);
    next();
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Error occurred:', err);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

app.get('/protected', (req: Request, res: Response) => {
    res.send(`Hello ${req.user?.name}`);
});

app.get('/auth/google/failure', (req: Request, res: Response) => {
    res.send('Failed to authenticate..');
});

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(cors({
    origin: `${process.env.FRONTEND_URL}`,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle OPTIONS requests
app.options('*', (req: Request, res: Response) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://taskify-lac-beta.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    res.status(204).end(); // Respond with 204 No Content
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(router);

app.get('/welcome', (req: Request, res: Response) => {
    res.send('Welcome to Task Management API');
});

// Error handling middleware
// app.use((err: any, req: Request, res: Response, next: NextFunction) => {
//     console.error(err.stack);
//     res.status(500).send("There's something wrong...");
// });

// Start the server
const PORT = 3000;
async function startServer() {
    const sequelize = await connectDB();
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

startServer();
