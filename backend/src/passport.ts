import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

export default function initPassport() {
  // Serialize/deserialize user for session storage (adjust to your user shape)
  passport.serializeUser((user: any, done) => {
    done(null, user); // or user.id if you persist users in DB
  });
  passport.deserializeUser((obj: any, done) => {
    done(null, obj);
  });

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: `${process.env.BASE_URL}/auth/google/callback`,
      },
      // verify callback: profile contains Google user info
      (
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: Function
      ) => {
        // Here: find or create user in your DB.
        // For quick testing you can pass profile directly
        const user = {
          id: profile.id,
          displayName: profile.displayName,
          emails: profile.emails,
          photos: profile.photos,
          accessToken,
          refreshToken,
        };
        done(null, user);
      }
    )
  );
}
