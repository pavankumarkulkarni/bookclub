const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  password: {
    type: String,
    minLength: [6, "password too short"],
    required: true,
  },
  email: {
    type: String,
    index: true,
    unique: true,
    required: true,
  },
  avatar: String,
  booksOwned: [
    { bookId: { type: String, unique: true }, availableForRent: String },
  ],
  booksRented: [{ bookId: String, ownerId: String }],
});

const userModel = mongoose.model("userModel", userSchema);

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true, unique: true },
  author: { type: String, required: true },
  category: { type: String, required: true },
  image: String,
  description: String,
  ratings: {
    averageRating: Number,
    userRatings: [
      {
        userId: String,
        rating: {
          type: Number,
          min: [1, "Rating scale is 1 to 5"],
          max: [5, "Rating scale is 1 to 5"],
        },
      },
    ],
  },
  comments: [
    {
      userId: String,
      comment: String,
    },
  ],
});

const bookModel = mongoose.model("bookModel", bookSchema);

const authorSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true, unique: true },
  biography: String,
  avatar: String,
  externalLink: String,
});

const authorModel = mongoose.model("authorModel", authorSchema);

module.exports = { userModel, bookModel, authorModel };
