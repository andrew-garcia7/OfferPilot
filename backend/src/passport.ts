import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const backendBaseUrl =
  process.env.BACKEND_URL || "http://localhost:4000";

passport.use(
  new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL:  `${backendBaseUrl}/api/auth/callback/google`,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email  = profile.emails?.[0]?.value;
        const avatar = profile.photos?.[0]?.value;
        const name   = profile.displayName;

        if (!email) return done(new Error("No email from Google"));

        // Find existing user by googleId or email
        let user = await prisma.user.findFirst({
          where: { OR: [{ googleId: profile.id }, { email }] },
        });

        const isNew = !user;

        if (user) {
          // Link googleId if signing in via email/password account for first time
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              googleId:  user.googleId ?? profile.id,
              avatar:    user.avatar   ?? avatar,
              name:      user.name     ?? name,
              provider:  user.provider === "local" && !user.googleId ? "google" : user.provider,
              lastLogin: new Date(),
            },
          });
        } else {
          user = await prisma.user.create({
            data: {
              email,
              name,
              avatar,
              googleId: profile.id,
              provider: "google",
              lastLogin: new Date(),
            },
          });
        }

        return done(null, { ...user, isNew });
      } catch (err) {
        return done(err as Error);
      }
    }
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: `${backendBaseUrl}/api/auth/callback/github`,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email =
          profile.emails?.[0]?.value ||
          `${profile.username}@github.local`;

        const avatar = profile.photos?.[0]?.value;
        const name = profile.displayName || profile.username;

        let user = await prisma.user.findFirst({
          where: {
            OR: [{ githubId: profile.id }, { email }],
          },
        });

        const isNew = !user;

        if (user) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              githubId: user.githubId ?? profile.id,
              avatar: user.avatar ?? avatar,
              name: user.name ?? name,
              provider:
                user.provider === "local" && !user.githubId
                  ? "github"
                  : user.provider,
              lastLogin: new Date(),
            },
          });
        } else {
          user = await prisma.user.create({
            data: {
              email,
              name,
              avatar,
              githubId: profile.id,
              provider: "github",
              lastLogin: new Date(),
            },
          });
        }

        return done(null, { ...user, isNew });
      } catch (err) {
        return done(err as Error);
      }
    }
  )
);

// Minimal session serialization (session only used briefly during OAuth handshake)
passport.serializeUser((user: any, done) => {
  done(null, Number(user.id));
});

passport.deserializeUser(async (id: any, done) => {
  try {
    const numericId = Number(id);

    if (isNaN(numericId)) {
      return done(new Error("Invalid user id"));
    }

    const user = await prisma.user.findUnique({
      where: {
        id: numericId,
      },
    });

    done(null, user);
  } catch (err) {
    done(err);
  }
});

export default passport;
