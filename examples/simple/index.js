import express from 'express';
import graphqlHTTP from 'express-graphql';
import { makeExecutableSchema } from 'graphql-tools';

import { loadMarkdownIntoDb } from '../../dist/index.cjs';

// Create our options for processing the markdown & images.
const options = {
  contentRoot: `${__dirname}/content`,
  imageFunc: ({ imgPath, contentRoot }) => imgPath,
};

const app = express();

(async () => {
  try {
    const {
      graphqlMarkdownTypeDefs,
      graphqlMarkdownResolvers,
      numberOfFilesInserted,
    } = await loadMarkdownIntoDb(options);

    console.log(
      `Memory DB completed!\n${numberOfFilesInserted} ContentItems loaded!`,
    );

    const schema = makeExecutableSchema({
      typeDefs: graphqlMarkdownTypeDefs,
      resolvers: graphqlMarkdownResolvers,
    });

    app.use(
      '/graphiql',
      graphqlHTTP({
        schema,
        graphiql: true,
      }),
    );

    // Start the server after all data has loaded.
    app.listen(4000);
    console.log('Server Started! http://localhost:4000/graphiql');
  } catch (error) {
    console.error('[loadMarkdownIntoDb]', error);
  }
})();
