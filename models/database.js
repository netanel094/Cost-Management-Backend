// Shon Khundiashvili 332326305
// Netanel Yomtovian 207498700
// Chen Bello 315129015

const password = require('../info');
const crypto = require('crypto');
const mongoose = require('mongoose');
const { type } = require('os');
mongoose.set('strictQuery', true);

//Connecting to the database
mongoose.connect(password, { useNewUrlParser: true });

const db = mongoose.connection;

//If an error occured this event listener will be executed
db.on('error', () => {
  console.log('Error!\nCould not connect to the Data Base!');
});

//Once the database is opened this event listener will be executed
db.once('open', () => {
  console.log('connected !');
});

//Creating the user schema and cost schema
const userSchema = new mongoose.Schema({
  id: String,
  firstName: String,
  lastName: String,
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
    validate: [validateDay, '1-31'],
  },
  month: {
    type: Number,
    required: false,
    validate: [validateMonth, '1-12'],
  },
  year: {
    type: Number,
    required: false,
    validate: [validateYear, '1900-2023'],
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

// the 'pre' save the day, month and year to the current date if they are not specified.
costSchema.pre('save', function (next) {
  const currentData = new Date();
  if (!this.day) this.day = currentData.getDate();
  if (!this.month) this.month = currentData.getMonth() + 1;
  if (!this.year) this.year = currentData.getFullYear();
  next();
});

//Define use and cost models
const User = mongoose.model(`User`, userSchema);
const Cost = mongoose.model(`Cost`, costSchema);

// Creating a single document of a user
var user = new User({
  id: `123123`,
  firstName: `Moshe`,
  lastName: `Israeli`,
  birthday: new Date(1990, 0, 11),
});

async function createUserIfNotExists(user) {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ id: user.id });
    if (existingUser) {
      console.log('User already exists, not creating');
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

createUserIfNotExists(user).then(console.log).catch(console.error);

module.exports = { Cost, User };
