import bodyParser from 'body-parser';
import cors from 'cors';
import express, { Request, Response } from 'express';
import { connectDB } from './config';
import router from './routes';

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(router);

connectDB();

app.get('/', (req: Request, res: Response) => {
    res.send('Welcome to Task Management API')
})

//for the middleware
app.use((err: any, req: Request, res: Response, next: any) => {
    console.error(err.stack);
    res.status(500).send("There's something wrong...")
})

//start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})