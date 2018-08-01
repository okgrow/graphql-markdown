import express from 'express';
import graphqlHTTP from 'express-graphql';
import { makeExecutableSchema } from 'graphql-tools';

import { runGraphqlMarkdown } from '../../src/index';

// Simple example of mapping the relative images stored with our .md
// files to the URL path that we will access/serve them from.
const serveImagesFromServer = ({ imgPath, contentRoot }) =>
  `/images${imgPath.slice(contentRoot.length)}`;

// Create our options for processing the markdown & images.
const options = {
  contentRoot: `${__dirname}/content`,
  imageResolver: serveImagesFromServer,
};

const app = express();

(async () => {
  try {
    const {
      typeDefs,
      resolvers,
      fileCount,
    } = await runGraphqlMarkdown(options);

    console.log(
      `Memory DB completed!\n${fileCount} ContentItems loaded!`,
    );

    const schema = makeExecutableSchema({
      typeDefs: typeDefs,
      resolvers: resolvers,
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
    console.error('[runGraphqlMarkdown]', error);
  }
})();
