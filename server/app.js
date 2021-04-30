const express = require("express");
const app = express();
const { ApolloServer } = require("apollo-server-express");
const typeDefs = require("./graphQL/typeDefs");
const resolvers = require("./graphQL/resolvers");
require("dotenv").config();
const mongoose = require("mongoose");
const { userModel, bookModel } = require("./mongoDB/models");
const jwt = require("jsonwebtoken");

function getLoggedInUser(req) {
  const token = req.headers["xauthtoken"];
  if (token) {
    try {
      const user = jwt.verify(token, process.env.JWT_SECRET);
      return user;
    } catch (err) {
      throw new Error(err);
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({
    userModel,
    bookModel,
    JWT_SECRET: process.env.JWT_SECRET,
    me: getLoggedInUser(req),
  }),
});

server.applyMiddleware({ app });

mongoose.connect(
  process.env.MONGODB_URI,
  { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true },
  (err) => {
    if (err) {
      console.error(err);
    }
    console.log("Connected to DB");
  }
);

app.listen(process.env.PORT, () => {
  console.log(`Express app running at ${process.env.PORT}`);
});
