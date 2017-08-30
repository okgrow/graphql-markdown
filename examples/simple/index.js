import express from 'express';
import graphqlHTTP from 'express-graphql';
// import { buildSchema, buildASTSchema, printSchema } from 'graphql';

import { makeExecutableSchema } from 'graphql-tools';
import {
  loadMarkdownIntoDb,
  contentItemTypeDefs,
  contentItemResolvers,
} from '../../dist/index.cjs';

// Create our options for processing the markdown & images.
const options = {
  contentRoot: `${__dirname}/content`,
  imageFunc: ({ imgPath, contentRoot }) => imgPath,
};

const schema = makeExecutableSchema({
  typeDefs: contentItemTypeDefs,
  resolvers: contentItemResolvers,
});

const app = express();

app.use('/graphql',
  graphqlHTTP({
    schema, // : buildSchema(printSchema(buildASTSchema(contentItemTypeDefs))),
    // rootValue: contentItemResolvers.Query,
    graphiql: true,
  }),
);

(async () => {
  try {
    const itemCount = await loadMarkdownIntoDb(options);
    console.log(`Memory DB completed!\n${itemCount} ContentItems loaded! `);
    // Start the server after all data has loaded.
    app.listen(4000);
    console.log('Server Started! http://localhost:4000/graphql');
  } catch (error) {
    console.error('[loadMarkdownIntoDb]', error);
  }
})();
