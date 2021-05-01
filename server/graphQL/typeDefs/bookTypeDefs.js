const bookTypeDefs = `
type Book {
  title:String!
  author:Author
  category:String!
  image:String
  description:String
  avgRating:Float
  ratings:[rating]
  comments:[comment]
}

type rating{
  userId:String,
  rating:Float
}

type comment{
  userId:String,
  comment:String
}

extend type Query{
  books:[Book],
  book(bookId:String):Book,
  booksByAuthor(authorId:String!):[Book],
  booksByUser(userId:String!):[Book]
}

extend type Mutation{
  createBook(title:String!,author:String!,category:String!):Boolean,
  addComment(bookId:String!,comment:String!):Boolean,
  rateBook(bookId:String!, rating:Int):Boolean
}
`;

module.exports = bookTypeDefs;
