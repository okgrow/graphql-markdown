import matter from 'gray-matter';
import promisify from 'es6-promisify';

import { getAssetDir, getListOfRelativeImageFiles } from '../server-helpers';
import { getGroupId, replaceHtmlImageSrc } from '../helpers';

// TODO: Revert to using this in our node.js package
const readFilePromise = promisify(require('fs').readFile);
const markedPromise = promisify(require('marked'));

/**
 * Create a markdown object from parsing a .md file and any image files that it references.
 * @param {Object} param
 * @param {string} param.filename - Full path to file.
 * @param {string} param.contentRoot - Path to where all markdown files are stored.
 * @param {Object} param.imageMap - key/value pairs where `key` is the `fullPathName` and `value` is the new path for the image. e.g - { fullPathName: "cdn.com/foo.png", ... }
 * @returns {Object} Created from the contents of the .md file that has been processed.
 */
const getMarkdownObject = async ({ filename, contentRoot, imageMap }) => {
  const assetDir = getAssetDir({ filename, contentRoot });

  const fileContents = await readFilePromise(filename, 'utf8');

  const { content, data } = matter(fileContents);
  const html = await markedPromise(content);

  const images = getListOfRelativeImageFiles(contentRoot, assetDir);

  // TODO: Deprecate this in future ?
  // If we do then we must state every .md file must provide a groupId?
  const defaultGroupId = getGroupId(assetDir);

  if (!data || !data.id) {
    console.warn(
      '[getMarkdownObject] id is missing from your MD file: ',
      assetDir,
    );
  }

  const newHtml = replaceHtmlImageSrc({ images, imageMap, html });

  return {
    html: newHtml,
    groupId: defaultGroupId, // NOTE: Must be before ...data, so default can be overwritten
    ...data,
    assetDir,
    markdown: content,
    images,
  };
};

export default getMarkdownObject;
