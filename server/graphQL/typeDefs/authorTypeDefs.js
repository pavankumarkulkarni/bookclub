const authorTypeDef = `
type Author{
  id:ID!
  name:String
  biography:String
  externalLink: String
}
extend type Query{
  authors: [Author]
  author(id:String!):Author
}
extend type Mutation{
  addAuthor(name:String!,biography:String,externalLink:String):Boolean
}
`;

module.exports = authorTypeDef;
