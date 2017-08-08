import Marked from 'marked';

import createImagesMap from './createImagesMap';
import getMarkdownObject from './getMarkdownObject';
import { getListOfMdFiles } from '../server-helpers';

const loadContentItems = async ({ contentRoot, imageFunc }) => {
  // TODO: Remove console logs or refactor to only print when debugging
  console.log('Loading content...');
  // TODO: Allow default settings to be modified by passing the options at startup?
  Marked.setOptions({
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: false,
    smartLists: true,
    smartypants: true,
    langPrefix: '',
  });

  try {
    const imageMap = await createImagesMap({ contentRoot, imageFunc });

    const mdFiles = getListOfMdFiles(contentRoot);

    const contentItems = await Promise.all(
      mdFiles.map(async filename => {
        const markdownObject = getMarkdownObject({
          filename,
          contentRoot,
          imageMap,
        });
        return new Promise((resolve, reject) => {
          if (markdownObject) {
            resolve(markdownObject);
          }
          reject(new Error(`Failed to parse ${filename}`));
        });
      }),
    );

    // TODO: Remove console logs or refactor to only print when debugging
    console.log('Finished loading content.', contentItems.length);
    return contentItems;
  } catch (error) {
    console.error('[loadContentItems] - Parsing error:', error);
    return error;
  }
};

export default loadContentItems;
