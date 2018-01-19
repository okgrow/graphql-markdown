import express from 'express';
import graphqlHTTP from 'express-graphql';
import { makeExecutableSchema } from 'graphql-tools';

import { loadMarkdownIntoDb } from '../../dist/index.cjs';

// Simple example of mapping the relative images stored with our .md
// files to the URL path that we will access/serve them from.
const serveImagesFromServer = ({ imgPath, contentRoot }) =>
  `/images${imgPath.slice(contentRoot.length)}`;

// Create our options for processing the markdown & images.
const options = {
  contentRoot: `${__dirname}/content`,
  imageFunc: serveImagesFromServer,
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
