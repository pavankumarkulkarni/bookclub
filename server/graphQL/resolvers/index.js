const userResolver = require("./userResolvers");
const bookResolver = require("./bookResolver");
const authorResolver = require("./authorResolver");

module.exports = [userResolver, bookResolver, authorResolver];
