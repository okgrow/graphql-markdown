import loadContentItems from './loadContentItems';
import { createBase64Image } from '../server-helpers';
import { dataStore, insert } from '../database/in-memory-storage';

const startGraphqlMdServer = async ({ contentRoot, imageFunc }) => {
  if (!contentRoot) {
    throw new Error('You must provide rooth path to your content!');
  }
  // TODO: add a check that ensures imageFunc is a function else null
  const defaultOptions = {
    contentRoot,
    ...(imageFunc ? { imageFunc } : { imageFunc: createBase64Image }),
  };

  // Create all contentItems by reading all .md files and their images.
  const contentItems = await loadContentItems(defaultOptions);

  // Insert all ContentItems into the in-memory nedb instance.
  const itemsInserted = await insert({ db: dataStore, docToInsert: contentItems });

  // TODO: Determine if we should return true or return number of docs inserted?
  return itemsInserted.length;
};

export default startGraphqlMdServer;
