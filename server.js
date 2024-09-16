require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for handling data parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

// Connect to MongoDB and start server
mongoose.connect(process.env.DB)
    .then(() => {
        console.log('MongoDB connected...');

        // Start server after MongoDB is connected
        app.listen(PORT, () => {
            console.log(`Server running and connected to DB on port ${PORT}`);
        });
    })
    .catch(err => console.log('MongoDB connection error:', err));
