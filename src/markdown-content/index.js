import loadContentItems from './loadContentItems';
import { createBase64Image } from '../server-helpers';
import { dataStore, insert } from '../database';

const DEFAULT_SUPPORTED_IMAGE_FORMATS = '(png|jpg|jpeg|svg|gif|webp|bmp)';

/**
 * Load markdown into nedb
 * @param {Object} param
 * @param {Function} param.imageFunc - function provided by user to create imgPaths.
 * @param {string} param.contentRoot - Path to where all markdown files are stored.
 * @param {string} param.imageFormats - list of imageFormats to support and search for.
 * Expected format is "(ext|ext|ext)" e.g - "(png|svg|jpg)"
 * @param {Function} param.replaceContents - function provided by user to manipulate
 * the contents of the .md file before processing.
 * @returns {number} number of ContentItems inserted into the db.
 */
const loadMarkdownIntoDb = async ({
  imageFunc,
  contentRoot,
  imageFormats,
  replaceContents,
}) => {
  if (!contentRoot) {
    throw new Error('You must provide the full path to root of your content!');
  }

  const isFunction = imageFunc && typeof imageFunc === 'function';

  const defaultOptions = {
    contentRoot,
    ...(isFunction ? { imageFunc } : { imageFunc: createBase64Image }),
    replaceContents,
    imageFormats: imageFormats || DEFAULT_SUPPORTED_IMAGE_FORMATS,
  };

  // Create all contentItems by reading all .md files and their images.
  const contentItems = await loadContentItems(defaultOptions);

  // Insert all ContentItems into the in-memory nedb instance.
  const itemsInserted = await insert({
    db: dataStore,
    docToInsert: contentItems,
  });

  // Return the number of files inserted
  return itemsInserted.length;
};

export default loadMarkdownIntoDb;
