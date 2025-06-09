# AdvancedNodeStarter

Starting project for a course on Advanced Node @ Udemy

### Setup

- Run `npm install` in the root of the project to install server dependencies
- Change into the client directory and run `npm install --legacy-peer-deps`
- start redis server: `redis-server`
- Change back into the root of the project and run `npm run dev` to start both the server and the client
- Access the application at `localhost:3000` in your browser

**Important:**
- The credentials for the Mongo Atlas DB in `dev.js` are read only. If you attempt to log in without first adding your own connection string (covered later in the course) you will see an error: `[0] MongoError: user is not allowed to do action [insert] on [advnode.users]`
- Without starting the Redis server, the app will not be able to connect to it and will not load data properly.
- I ran the application commands inside an ubuntu terminal.

**Passport Version Notice:**

This project uses an older version of Passport (v0.5.3) to ensure compatibility with `cookie-session`.

The `express-session` package is a more advanced and flexible session middleware compared to `cookie-session`.

If you replace `cookie-session` with `express-session`, the login tests will no longer work without modifications.

In that case, you will need to redesign your testing strategy for authentication to accommodate the change.












