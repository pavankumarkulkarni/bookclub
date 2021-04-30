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
          { expiresIn: "30m" }
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
        const result = await userModel.findOneAndDelete({ email: email });
        if (result) {
          return true;
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};

module.exports = userResolver;
