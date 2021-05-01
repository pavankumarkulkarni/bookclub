const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userResolver = {
  Mutation: {
    register: async (_, { name, email, password }, { userModel }) => {
      if (password.length < 6) {
        throw new Error("Password should be atleast 6 characters");
      }
      try {
        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = {
          name: name,
          email: email,
          password: passwordHash,
        };
        const savedUser = new userModel(newUser);
        await savedUser.save();
        return true;
      } catch (err) {
        throw new Error(err);
      }
    },

    login: async (_, { email, password }, { userModel, JWT_SECRET }) => {
      try {
        const userFound = await userModel.findOne({ email: email });
        if (!userFound) {
          throw new Error("User does not exist");
        }
        const authenticate = await bcrypt.compare(password, userFound.password);
        if (!authenticate) {
          throw new Error("Authentication failed");
        }
        const token = jwt.sign(
          { id: userFound._id, email: userFound.email },
          JWT_SECRET,
          { expiresIn: "1d" }
        );
        return { token };
      } catch (err) {
        throw new Error(err);
      }
    },

    removeUser: async (_, { email }, { userModel, me }) => {
      if (!me) {
        throw new Error("Login to delete account");
      }
      if (me.email !== email) {
        throw new Error("Email id don't match the logged in user");
      }
      try {
        const result = await userModel.findOneAndDelete({ _id: me.id });
        console.log(result);
        if (result) {
          return true;
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    addBookCopy: async (_, { bookId }, { userModel, me }) => {
      if (!me) {
        throw new Error("Please login to add book copy");
      }
      try {
        const loggedInUser = await userModel.findById(me.id);
        const existingBook = loggedInUser.booksOwned.find(
          (book) => book.bookId === bookId
        );
        if (existingBook) {
          throw new Error("You already added this book...");
        }
        const res = await userModel.updateOne(
          { _id: me.id },
          { $push: { booksOwned: { bookId, availableForRent: true } } }
        );
        if (res.nModified === 1) {
          return true;
        }
        return false;
      } catch (err) {
        throw new Error(err);
      }
    },
    removeBookCopy: async (_, { bookId }, { userModel, me }) => {
      if (!me) {
        throw new Error("Session expired. Re-login...");
      }
      try {
        const res = await userModel.updateOne(
          { _id: me.id },
          { $pull: { booksOwned: { bookId: bookId } } }
        );
        if (res.nModified === 1) {
          return true;
        } else {
          throw new Error("Book copy not found...");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    rentBook: async (_, { ownerId, bookId }, { userModel, me }) => {
      if (!me) {
        throw new Error("Please login to rent the book...");
      }
      try {
        const bookOwner = await userModel.findById(ownerId);
        if (!bookOwner) {
          throw new Error("Error in retrieving book owner...");
        }
        const bookToRent = bookOwner.booksOwned.find(
          (book) => book.bookId === bookId
        );
        if (!bookToRent.availableForRent) {
          throw new Error("Book not available for rent...");
        }
        const meDetails = await userModel.findById(me.id);
        const isAlreadyRented = meDetails.booksRented.find(
          (book) => book.bookId === bookId
        );
        if (isAlreadyRented) {
          throw new Error("You already rented this book copy...");
        }
        const updateOwnerRecord = await userModel.updateOne(
          { _id: ownerId, "booksOwned.bookId": bookId },
          { $set: { "booksOwned.$.availableForRent": false } }
        );
        if (updateOwnerRecord.nModified !== 1) {
          throw new Error("Error in updating owner record...");
        }
        const renterRecordUpdate = await userModel.updateOne(
          { _id: me.id },
          { $push: { booksRented: { bookId, ownerId: bookOwner._id } } }
        );
        if (renterRecordUpdate.nModified !== 1) {
          throw new Error("Error updating renter record");
        }
        return true;
      } catch (err) {
        throw new Error(err);
      }
    },
    returnRentedBook: async (_, { bookId }, { me, userModel }) => {
      if (!me) {
        throw new Error("Login to return book...");
      }
      try {
        const meDetails = await userModel.findById(me.id);
        const rentedBook = meDetails.booksRented.find(
          (book) => book.bookId === bookId
        );
        const renterRecordUpdate = await userModel.updateOne(
          { _id: me.id },
          { $pull: { booksRented: { bookId: bookId } } }
        );
        if (renterRecordUpdate.nModified !== 1) {
          throw new Error("Error updating renter record...");
        }
        const updateOwnerRecord = await userModel.updateOne(
          { _id: rentedBook.ownerId, "booksOwned.bookId": bookId },
          { $set: { "booksOwned.$.availableForRent": true } }
        );
        if (updateOwnerRecord.nModified !== 1) {
          throw new Error("Error in updating owner record...");
        }
        return true;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};

module.exports = userResolver;
