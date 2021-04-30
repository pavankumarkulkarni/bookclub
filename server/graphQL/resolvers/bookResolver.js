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
  },
};

module.exports = bookResolver;
