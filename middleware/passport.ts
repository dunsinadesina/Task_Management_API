import dotenv from 'dotenv';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import User from '../models/userModel';

dotenv.config();

export default function (passport: passport.PassportStatic) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID as string,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
                callbackURL: '/auth/google/callback',
                passReqToCallback: true
            },
            async (request: any, accessToken: string, refreshToken: string, profile: any, done: (error: any, user?: any) => void) => {
                // get the user data from google
                const newUser = {
                    googleId: profile.id,
                    displayName: profile.displayName,
                    firstName: profile.name.givenName,
                    lastName: profile.name.familyName,
                    image: profile.photos[0].value,
                    email: profile.emails[0].value,
                    password: null,
                    emailToken: null,
                    isVerified: true,
                };

                try {
                    // find the user in our database
                    let user = await User.findOne({ googleId });

                    if (user) {
                        // If user is present in our database.
                        done(null, user);
                    } else {
                        // If user is not present in our database, save user data to the database.
                        user = await User.create(newUser);
                        done(null, user);
                    }
                } catch (err) {
                    console.error(err);
                    done(err);
                }
            }
        )
    );

    // used to serialize the user for the session
    passport.serializeUser((user: any, done: (err: any, id?: string) => void) => {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser((id: string, done: (err: any, user?: any) => void) => {
        User.findByPk(id, (err: any, user: any) => {
            done(err, user);
        });
    });
}
