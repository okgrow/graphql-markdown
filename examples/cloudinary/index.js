import express from 'express';
import graphqlHTTP from 'express-graphql';
import { makeExecutableSchema } from 'graphql-tools';

import { runGraphqlMarkdown } from '../../dist/index.cjs';

// TODO: add function that uses cloudinaryUploader to upload images to Cloudinary.

// Create our options for processing the markdown & images.
const options = {
  contentRoot: `${__dirname}/content`,
  imageResolver: ({ imgPath, contentRoot }) => imgPath, // TODO: use cloudinaryUploader function
};

const app = express();

(async () => {
  try {
    const {
      graphqlMarkdownTypeDefs,
      graphqlMarkdownResolvers,
      fileCount,
    } = await runGraphqlMarkdown(options);

    const schema = makeExecutableSchema({
      typeDefs: graphqlMarkdownTypeDefs,
      resolvers: graphqlMarkdownResolvers,
    });

    app.use(
      '/graphql',
      graphqlHTTP({
        schema,
        graphiql: true,
      }),
    );

    console.log(`Memory DB completed!\n${fileCount} ContentItems loaded!`);
    // Start the server after all data has loaded.
    app.listen(4000);
    console.log('Server Started! http://localhost:4000/graphql');
  } catch (error) {
    console.error('[runGraphqlMarkdown]', error);
  }
})();
