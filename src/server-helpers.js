import fs from 'fs';
import Glob from 'glob';
import marked from 'marked';
import { dirname } from 'path';

const SUPPORTED_IMAGE_TYPES = '(png|jpg|jpeg|svg)';

/**
 * Returns a list of paths for the images located in the current directory.
 * @param {string} contentRoot - Path to where all markdown files are stored.
 * @param {string} assetDir - Folder to search for relative image assets.
 * @returns {Array} An array which contains the full paths to any image files.
 */
export const getListOfRelativeImageFiles = (contentRoot, assetDir) =>
  Glob.glob.sync(`${contentRoot}${assetDir}/*.+${SUPPORTED_IMAGE_TYPES}`);

/**
 * Returns a list of paths of the images found in the contentRoot.
 * @param {string} contentRoot - Path to root of the content.
 * @returns {Array} An array containing the paths to all image files.
 */
export const getListOfAllImageFiles = contentRoot =>
  Glob.glob.sync(`${contentRoot}/**/*.+${SUPPORTED_IMAGE_TYPES}`);

/**
 * Returns a list of paths for all markdown files found in the contentRoot
 * @param {string} contentRoot - Path to where all markdown files are stored.
 * @returns {Array} An array containing the paths to the markdown files.
 */
export const getListOfMdFiles = contentRoot =>
  Glob.glob.sync(`${contentRoot}/**/*.+(md|markdown)`);

/**
 * Returns the file's relative path from the contentRoot.
 * @param {string} contentRoot - Path to where all markdown files are stored.
 * @param {string} filename - Full path to file.
 * @returns {string} Relative path. e.g - "/pages/graphql/graphql.md"
 */
export const getAssetDir = ({ contentRoot, filename }) =>
  dirname(filename).slice(contentRoot.length);

/**
 * Reads an image file & converts it into the correct base64 format for html
 * @param {string} fullPathName - Path to where image is located.
 * @returns {string} base64 string formatted as a data:image string.
 */
export const createBase64Image = fullPathName => {
  const bitmap = fs.readFileSync(fullPathName);
  // Convert binary data to base64 encoded string
  const base64Str = new Buffer(bitmap).toString('base64');
  const fileType = fullPathName.slice(fullPathName.lastIndexOf('.') + 1);
  // Create the base64 image string format
  return `data:image/${fileType};base64,${base64Str}`;
};

/**
 * Promisifys the 'marked' function which converts the provided markdown
 * string into a valid html string.
 * @param {string} mdContent - markdown content to convert to html.
 * @returns {string} Returns a html string.
 */
export const markedPromise = mdContent =>
  new Promise((resolve, reject) => {
    marked(mdContent, (error, html) => {
      if (error) {
        reject(error);
      } else {
        resolve(html);
      }
    });
  });
