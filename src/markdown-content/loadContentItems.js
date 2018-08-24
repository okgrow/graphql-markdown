import Marked from 'marked';
import createImagesMap from './createImagesMap';
import getMarkdownObject from './getMarkdownObject';
import { getListOfMdFiles } from '../server-helpers';
import { processContentItems } from './detectGqlTypesFromMd';

/**
 * Read all .md files and process them into contentItems ready to be stored.
 * @param {Object} param
 * @param {string} param.contentRoot - Path to where all markdown files are stored.
 * @param {Function} param.imageResolver - function provided by user to create imgPaths.
 * @param {string} param.imageFormats - list of imageFormats to support and search for.
 * Expected format is "(ext|ext|ext)" e.g - "(png|svg|jpg)"
 * @param {Function} param.replaceContents - function provided by user to manipulate
 * the contents of the .md file before processing.
 * @returns {Object[]} ContentItems
 */
const loadContentItems = async ({
  contentRoot,
  imageResolver,
  imageFormats,
  replaceContents,
  debugMode = false,
  syntaxHighlighter,
  // TODO: Setup generateGroupIdByFolder logic and Update readme/setOptions
  generateGroupIdByFolder = false,
}) => {
  const isFunction = syntaxHighlighter && typeof syntaxHighlighter === 'function';

  // TODO: Discuss if we allow default settings to be modified by passing the options at startup?
  Marked.setOptions({
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: false,
    smartLists: true,
    smartypants: true,
    langPrefix: '',
    ...(isFunction ? { highlight: syntaxHighlighter } : null),
  });

  try {
    const imageMap = await createImagesMap({
      contentRoot,
      imageResolver,
      imageFormats,
    });

    const mdFiles = getListOfMdFiles(contentRoot);
    // TODO: Make logic more clear?
    const contentItems = await Promise.all(
      mdFiles.map(async filename => {
        const markdownObject = getMarkdownObject({
          filename,
          contentRoot,
          imageMap,
          replaceContents,
          imageFormats,
          debugMode,
        });
        return new Promise((resolve, reject) => {
          if (markdownObject) {
            resolve(markdownObject);
          }
          reject(new Error(`Failed to parse ${filename}`));
        });
      }),
    );

    return processContentItems(contentItems, contentRoot);
  } catch (error) {
    console.error('[loadContentItems] - Parsing error:', error);
    return error;
  }
};

export default loadContentItems;
