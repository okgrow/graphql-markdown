import loadContentItems from './loadContentItems';
import { createBase64Image } from '../server-helpers';
import { dataStore, insert } from '../database';

/**
 * Load markdown into nedb
 * @param {Object} param
 * @param {string} param.contentRoot - Path to where all markdown files are stored.
 * @param {Function} param.imageFunc - function provided by user to create imgPaths.
 * @returns {number} number of ContentItems inserted into the db.
 */
const loadMarkdownIntoDb = async ({ contentRoot, imageFunc }) => {
  if (!contentRoot) {
    throw new Error('You must provide the full path to root of your content!');
  }

  const isFunction = imageFunc && typeof imageFunc === 'function';

  const defaultOptions = {
    contentRoot,
    ...(isFunction ? { imageFunc } : { imageFunc: createBase64Image }),
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
