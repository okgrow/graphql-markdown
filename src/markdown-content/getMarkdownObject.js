import fs from 'fs';
import matter from 'gray-matter';

import {
  getAssetDir,
  markedPromise,
  getListOfRelativeImageFiles,
} from '../server-helpers';
import { gqlTypeListener } from './detectGqlTypesFromMd';
import { getGroupId, replaceHtmlImageSrc } from '../helpers';

// TODO: Think of renaming to better reflect the item we are returning
/**
 * Create a markdown object from parsing a .md file and any image files that it references.
 * @param {Object} param
 * @param {string} param.filename - Full path to file.
 * @param {Object} param.imageMap - key/value pairs where `key` is the `fullPathName`
 * and `value` is the new path for the image. e.g - { fullPathName: "cdn.com/foo.png", ... }
 * @param {string} param.contentRoot - Path to where all markdown files are stored.
 * @param {string} param.imageFormats - list of imageFormats to support and search for.
 * Expected format is "(ext|ext|ext)" e.g - "(png|svg|jpg)"
 * @param {function} param.replaceContents - Manipulate the contents of the .md file before processing.
 * @returns {Object} Created from the contents of the .md file that has been processed.
*/
const getMarkdownObject = async ({
  filename,
  imageMap,
  contentRoot,
  imageFormats,
  replaceContents,
}) => {
  const assetDir = getAssetDir({ filename, contentRoot });
  const rawContents = fs.readFileSync(filename, 'utf8');
  const relativeFileName = filename.slice(contentRoot.length);

  // Provide the ability to manipulate the contents of the .md file before processing
  const fileContents = replaceContents
    ? replaceContents({ contentRoot, rawContents })
    : rawContents;

  // WARNING: The 4 variables below are mutated directly by gqlTypeListener()
  let currKey = ''; // eslint-disable-line
  const stack = [];
  const debug = [];
  const gqlTypesInMd = {};

  const { content, data /* , excerpt */ } = matter(fileContents, {
    listener: gqlTypeListener({
      stack,
      debug,
      currKey,
      gqlTypesInMd,
      relativeFileName,
    }),
  });

  if (!data || !data.id) {
    throw new Error(
      `[getMarkdownObject] id is missing from your .md file: ${assetDir}`,
    );
  }

  const html = await markedPromise(content);

  const images = getListOfRelativeImageFiles(
    contentRoot,
    assetDir,
    imageFormats,
  );

  // TODO: Deprecate this in future ?
  // If we deprecate then we must state every .md file must provide a groupId!
  const defaultGroupId = getGroupId(assetDir);

  const newHtml = replaceHtmlImageSrc({ images, imageMap, html });

  const contentItem = {
    html: newHtml,
    groupId: defaultGroupId, // NOTE: Must be before ...data, so default can be overwritten
    ...data,
    // TODO: Decide if we should insert these into db, no purpose other then for testing ???
    // images,
    // assetDir,
    // markdown: content,
  };

  return {
    filename,
    contentItem,
    gqlTypesInMd, // TODO: Think of a better name to describe the GQL fields/type
  };
};

export default getMarkdownObject;
