import fs from 'fs';
import Glob from 'glob';
import marked from 'marked';
import { dirname } from 'path';

/**
 * Returns a list of paths for the images located in the current directory.
 * @param {string} contentRoot - Path to where all markdown files are stored.
 * @param {string} assetDir - Folder to search for relative image assets.
 * @param {string} imageFormats - list of imageFormats to support and search for.
 * Expected format is "(ext|ext|ext)" e.g - "(png|svg|jpg)"
 * @returns {Array} An array which contains the full paths to any image files.
 */
export const getListOfRelativeImageFiles = (
  contentRoot,
  assetDir,
  imageFormats,
) => Glob.glob.sync(`${contentRoot}${assetDir}/*.+${imageFormats}`);

/**
 * Returns a list of paths of the images found in the contentRoot.
 * @param {string} contentRoot - Path to root of the content.
 * @param {string} imageFormats - list of imageFormats to support and search for.
 * Expected format is "(ext|ext|ext)" e.g - "(png|svg|jpg)"
 * @returns {Array} An array containing the paths to all image files.
 */
export const getListOfAllImageFiles = (contentRoot, imageFormats) =>
  Glob.glob.sync(`${contentRoot}/**/*.+${imageFormats}`);

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
 * @param {Object} param
 * @param {string} obj.imgPath - Path to where image is located.
 * @returns {string} base64 string formatted as a data:image string.
 */
export const createBase64Image = ({ imgPath }) => {
  // Convert binary data to base64 encoded string
  const base64Str = fs.readFileSync(imgPath, 'base64');
  const fileType = imgPath.slice(imgPath.lastIndexOf('.') + 1);
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
