import loadContentItems from './loadContentItems';
import { createBase64Image } from '../server-helpers';
import { dataStore, insert } from '../database/in-memory-storage';

const loadMarkdownIntoDb = async ({ contentRoot, imageFunc }) => {
  if (!contentRoot) {
    throw new Error('You must provide the full path to root of you content!');
  }

  const isFunction = imageFunc && typeof imageFunc === 'function';

  const defaultOptions = {
    contentRoot,
    ...(isFunction ? { imageFunc } : { imageFunc: createBase64Image }),
  };

  // Create all contentItems by reading all .md files and their images.
  const contentItems = await loadContentItems(defaultOptions);

  // Insert all ContentItems into the in-memory nedb instance.
  const itemsInserted = await insert({ db: dataStore, docToInsert: contentItems });

  // Return the number of files inserted
  return itemsInserted.length;
};

export default loadMarkdownIntoDb;
