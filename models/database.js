// Shon Khundiashvili 332326305
// Netanel Yomtovian 207498700
// Chen Bello 315129015
require('dotenv').config();
const crypto = require('crypto');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
try {
  //Connecting to the database
  const userName = process.env.USER_NAME;
  const password = process.env.PASSWORD;
  const url = `mongodb+srv://${userName}:${password}@serverside.djqrb8k.mongodb.net/Server-Side-Project?retryWrites=true&w=majority`;

  mongoose.connect(url, { useNewUrlParser: true });
  const db = mongoose.connection;

  //Once the database is opened this event listener will be executed
  db.once('open', () => {
    console.log('connected !');
  });

  //Creating the user schema and cost schema
  const userSchema = new mongoose.Schema({
    id: String,
    first_name: String,
    last_name: String,
    birthday: Date,
  });

  const costSchema = new mongoose.Schema({
    user_id: {
      type: Number,
      require: true,
    },
    day: {
      type: Number,
      required: false,
      validate: [validateDay, 'Allowed session values are 1 to 31'],
    },
    month: {
      type: Number,
      required: false,
      validate: [validateMonth, 'Allowed session values are 1 to 12'],
    },
    year: {
      type: Number,
      required: false,
      validate: [validateYear, 'Allowed session values are 1900 to 2023'],
    },
    id: {
      type: String,
      index: true,
      required: true,
      unique: true,
      default: () => crypto.randomUUID(),
    },
    description: String,
    category: {
      type: String,
      enum: [
        `food`,
        `health`,
        `housing`,
        `sport`,
        `education`,
        `transportation`,
        `other`,
      ],
    },
    sum: Number,
  });

  function validateDay(v) {
    return v >= 1 && v <= 31;
  }
  function validateMonth(v) {
    return v >= 1 && v <= 12;
  }
  function validateYear(v) {
    return v >= 1900 && v <= 2023;
  }

  //Creating the Report Schema
  const reportSchema = new mongoose.Schema({
    report: {
      type: JSON,
      default: {
        food: [],
        housing: [],
        health: [],
        sport: [],
        education: [],
        transportation: [],
        other: [],
      },
    },
    user_id: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    month: {
      type: Number,
      required: true,
    },
  });

  //Define use and cost models
  const Report = mongoose.model('Report', reportSchema);
  const User = mongoose.model(`User`, userSchema);
  const Cost = mongoose.model(`Cost`, costSchema);

  // Creating a single document of a user
  var user = new User({
    id: `123123`,
    first_name: `Moshe`,
    last_name: `Israeli`,
    birthday: new Date(1990, 0, 11),
  });

  async function createUserIfNotExists(user) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ id: user.id });
      if (existingUser) {
        console.log(`The user: ${user} already exists, not creating.!`);
        return existingUser;
      }
      // Create new user
      const newUser = await User.create(user);
      console.log(`new User created: ${newUser}`);
      return newUser;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  createUserIfNotExists(user).catch(console.error);
  module.exports = { Cost, User, Report };
  // cannot connect
} catch (error) {
  console.log(error);
}
