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
  booksOwned: [{ bookId: String, availableForRent: Boolean }],
  booksRented: [{ bookId: String }],
});

const userModel = mongoose.model("userModel", userSchema);

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true, unique: true },
  author: { type: String, required: true },
  category: { type: String, required: true },
  image: String,
  description: String,
  ratings: [
    {
      userId: String,
      rating: {
        type: Number,
        min: [1, "Rating scale is 1 to 5"],
        max: [5, "Rating scale is 1 to 5"],
      },
    },
  ],
  comments: [
    {
      userId: String,
      comment: String,
    },
  ],
});

const bookModel = mongoose.model("bookModel", bookSchema);

module.exports = { userModel, bookModel };
