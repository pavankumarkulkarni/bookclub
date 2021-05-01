const typeDefs = `
  type User{
    id:String
    name:String! 
    email:String! 
  }
  type Token{
    token:String!
  }
  type Mutation{
    register(name:String!, email:String!, password:String!):Boolean,
    login(email:String!,password:String!):Token,
    removeUser(email:String!):Boolean,
    addBookCopy(bookId:String):Boolean,
    removeBookCopy(bookId:String):Boolean,
    rentBook(ownerId:String!,bookId:String!):Boolean,
    returnRentedBook(bookId:String):Boolean
  }
  type Query{
    users(id:String!):User
  }
`;

module.exports = typeDefs;
