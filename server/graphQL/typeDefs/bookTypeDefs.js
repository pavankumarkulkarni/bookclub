const bookTypeDefs = `
type Book {
  title:String!
  authorId:String!
  category:String!
  image:String
  description:String
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
  books:String
}

extend type Mutation{
  createBook(title:String!,author:String!,category:String!):Boolean
}
`;

module.exports = bookTypeDefs;
