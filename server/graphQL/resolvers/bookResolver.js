const bookResolver = {
  Mutation: {
    createBook: async (
      _,
      { title, author, category },
      { userModel, bookModel, me }
    ) => {
      if (!me) {
        throw new Error("Please sign in to Add book");
      }
      try {
        const newBook = new bookModel({
          title,
          author,
          category,
        });
        const bookSaved = await newBook.save();
        await userModel.updateOne(
          { email: me.email },
          {
            $push: {
              booksOwned: { bookId: bookSaved._id, availableForRent: true },
            },
          }
        );
        return true;
      } catch (err) {
        throw new Error(err);
      }
    },
    addComment: async (_, { bookId, comment }, { bookModel, me }) => {
      if (!me) {
        throw new Error("Session expired. Re-login to add comment...");
      }
      try {
        const bookInDB = await bookModel.findById(bookId);
        const isExistingComment = bookInDB.comments.find(
          (comment) => comment.userId === me.id
        );
        if (isExistingComment) {
          throw new Error("You already added comment for this book...");
        } else {
          const result = await bookModel.updateOne(
            { _id: bookId },
            { $push: { comments: { userId: me.id, comment } } }
          );
          if (result.nModified === 1) {
            return true;
          } else {
            throw new Error("Error is updating comment...");
          }
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    rateBook: async (_, { bookId, rating }, { bookModel, me }) => {
      if (!me) {
        throw new Error("Session expired. login to rate the book...");
      }
      try {
        const bookInDB = await bookModel.findById(bookId);
        const isExistingRating = bookInDB.ratings.userRatings.find(
          (rating) => rating.userId === me.id
        );
        if (isExistingRating) {
          throw new Error("You already rated this book...");
        } else {
          const priorAvgRating = bookInDB.ratings.averageRating || 0;
          const existingComments = bookInDB.ratings.userRatings.length || 0;
          const newAvgRating =
            (priorAvgRating * existingComments + rating) /
            (existingComments + 1);
          const res = await bookModel.updateOne(
            { _id: bookId },
            {
              $push: {
                "ratings.userRatings": { userId: me.id, rating: rating },
              },

              $set: { "ratings.averageRating": newAvgRating },
            }
          );
          if (res.nModified === 1) {
            return true;
          } else {
            throw new Error("Error is rating the book...");
          }
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Query: {
    books: async (_, __, { bookModel }) => {
      const books = await bookModel.find({});
      return books;
    },
    book: async (_, { bookId }, { bookModel }) => {
      try {
        const bookInDB = await bookModel.findById(bookId);
        return bookInDB;
      } catch (err) {
        throw new Error(err);
      }
    },
    booksByAuthor: async (_, { authorId }, { bookModel }) => {
      try {
        const booksInDB = await bookModel.find({ author: authorId });
        return booksInDB;
      } catch (err) {
        throw new Error(err);
      }
    },
    booksByUser: async (_, { userId }, { userModel, bookModel }) => {
      try {
        const userInDB = await userModel.findById(userId);
        const booksOwned = userInDB.booksOwned.map((book) => book.bookId);
        const booksOwnedDetails = await bookModel.find({
          _id: { $in: booksOwned },
        });
        return booksOwnedDetails;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Book: {
    avgRating: async ({ _id }, __, { bookModel }) => {
      try {
        const bookInDB = await bookModel.findById(_id);
        return bookInDB.ratings.averageRating;
      } catch (err) {
        throw new Error(err);
      }
    },
    author: async ({ author }, _, { authorModel }) => {
      try {
        const authorInDB = await authorModel.findById(author);
        return authorInDB;
      } catch (err) {
        throw new Error(err);
      }
    },
    ratings: async ({ _id }, _, { bookModel }) => {
      try {
        const bookInDB = await bookModel.findById(_id);
        return bookInDB.ratings.userRatings;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};

module.exports = bookResolver;
