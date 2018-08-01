import loadContentItems from './loadContentItems';
import { createBase64Image } from '../server-helpers';
import { dataStore, insert } from '../database';
import { contentItemTypeDefs, contentItemResolvers } from '../graphql';
import { createGraphqlMarkdownTypeDefs } from './detectGqlTypesFromMd';

const DEFAULT_SUPPORTED_IMAGE_FORMATS = '(png|jpg|jpeg|svg|gif|webp|bmp)';

/**
 * Load markdown into nedb
 * @param {Object} param
 * @param {Function} param.imageResolver - function provided by user to create imgPaths.
 * @param {string} param.contentRoot - Path to where all markdown files are stored.
 * @param {string} param.imageFormats - list of imageFormats to support and search for.
 * Expected format is "(ext|ext|ext)" e.g - "(png|svg|jpg)"
 * @param {Function} param.replaceContents - function provided by user to manipulate
 * the contents of the .md file before processing.
 * @returns {number} number of ContentItems inserted into the db.
 */
const runGraphqlMarkdown = async ({
  imageResolver,
  contentRoot,
  imageFormats,
  replaceContents,
  syntaxHighlighter,
}) => {
  if (!contentRoot) {
    throw new Error('You must provide the full path to root of your content!');
  }

  const isFunction = imageResolver && typeof imageResolver === 'function';

  const defaultOptions = {
    contentRoot,
    ...(isFunction ? { imageResolver } : { imageResolver: createBase64Image }),
    replaceContents,
    imageFormats: imageFormats || DEFAULT_SUPPORTED_IMAGE_FORMATS,
    syntaxHighlighter,
  };

  // Create all contentItems by reading all .md files and their images.
  const { contentItems, contentItemGqlFields } = await loadContentItems(
    defaultOptions,
  );

  // Generate the packages TypeDefs to return to the pkg user
  const graphqlMarkdownTypeDefs = createGraphqlMarkdownTypeDefs({
    originalTypeDefs: contentItemTypeDefs,
    fieldDefsToAdd: contentItemGqlFields,
  });

  // Insert all ContentItems into the in-memory nedb instance.
  const itemsInserted = await insert({
    db: dataStore,
    docToInsert: contentItems,
  });

  // Return the number of files inserted
  return {
    typeDefs: graphqlMarkdownTypeDefs,
    resolvers: contentItemResolvers,
    fileCount: itemsInserted.length,
  };
};

export default runGraphqlMarkdown;
