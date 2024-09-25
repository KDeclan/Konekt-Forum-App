const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;
const User = require("../models/discord-user");

passport.use(
  new DiscordStrategy(
    {
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_SECRET_ID,
      callbackURL: `${process.env.API_URL}/auth/discord/callback`,
      scope: ["identify"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ discordId: profile.id });

        if (!user) {
          user = await User.create({
            discordId: profile.id,
            username: profile.username,
            avatar: profile.avatar,
          });
        } else {
          user.username = profile.username;
          user.avatar = profile.avatar;
          await user.save();
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport;
