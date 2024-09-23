const passport = require("passport"); // Import passport
const DiscordStrategy = require("passport-discord").Strategy; // Import Discord strategy
const User = require("../models/discord-user"); // Adjust the path based on your project structure

passport.use(
  new DiscordStrategy(
    {
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_SECRET_ID,
      callbackURL: `${process.env.API_URL}/auth/discord/callback`,
      scope: ["identify"], // Ensure you have the identify scope to get avatar info
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Log the profile to see what data is returned by Discord
        console.log("Discord Profile:", profile);

        // Check if the user exists in your database
        let user = await User.findOne({ discordId: profile.id });

        // If the user doesn't exist, create a new record
        if (!user) {
          user = await User.create({
            discordId: profile.id,
            username: profile.username,
            avatar: profile.avatar, // Store the avatar hash here
          });
        } else {
          // Update the user's data if necessary (e.g., if their avatar changed)
          user.username = profile.username;
          user.avatar = profile.avatar;
          await user.save();
        }

        return done(null, user); // Pass the user to the callback function
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport;
