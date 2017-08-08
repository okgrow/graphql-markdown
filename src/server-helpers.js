import fs from 'fs';
import Glob from 'glob';
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

export const getAssetDir = ({ contentRoot, filename }) =>
  dirname(filename).slice(contentRoot.length);

// Reads an image file & converts it into the correct base64 format for the web
export const createBase64Image = fullPathName => {
  // read binary data
  const bitmap = fs.readFileSync(fullPathName);
  // convert binary data to base64 encoded string
  const base64Str = new Buffer(bitmap).toString('base64');
  const fileType = fullPathName.slice(fullPathName.lastIndexOf('.') + 1);
  // create the base64 image format
  return `data:image/${fileType};base64,${base64Str}`;
};
