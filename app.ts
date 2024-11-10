import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import passport from 'passport';
import { connectDB } from './config/config';
import router from './routes';

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

app.use(session({ secret: 'maybe_token', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req: Request, res: Response) => {
    res.send('<a href="/auth/google">Login with Google</a>');
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

app.get('/protected', (req: Request, res: Response) => {
    res.send(`Hello ${req.user?.name}`);
});

app.get('/auth/google/failure', (req: Request, res: Response) => {
    res.send('Failed to authenticate..');
});

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(router);

app.get('/welcome', (req: Request, res: Response) => {
    res.send('Welcome to Task Management API');
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).send("There's something wrong...");
});

// Start the server
const PORT = 3000;
async function startServer() {
    const sequelize = await connectDB();
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

startServer();
