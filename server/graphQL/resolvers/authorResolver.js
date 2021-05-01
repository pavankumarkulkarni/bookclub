const authorResolver = {
  Query: {
    authors: async (_, __, { authorModel }) => {
      try {
        const authors = await authorModel.find({});
        return authors;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    addAuthor: async (
      _,
      { name, biography, externalLink },
      { authorModel }
    ) => {
      try {
        const newAuthor = new authorModel({ name, biography, externalLink });
        await newAuthor.save();
        return true;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};

module.exports = authorResolver;
