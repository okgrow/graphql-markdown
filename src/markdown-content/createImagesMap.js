import { getListOfAllImageFiles } from '../server-helpers';

/**
 * Creates an object that maps the local fullPath of an image to it's desired path.
 * e.g - { fullPathName: "cdn.com/foo.png", ... }
 * @param {Object} param
 * @param {string} param.contentRoot - Path to where all markdown files are stored.
 * @param {Object} param.imageResolver - function provided by user to create imgPaths.
 * @param {string} param.imageFormats - list of imageFormats to support and search for.
 * Expected format is "(ext|ext|ext)" e.g - "(png|svg|jpg)"
 * @returns {Object} imageMap e.g - { fullPathName: "cdn.com/foo.png", ... }
 */
const createImagesMap = async ({
  contentRoot,
  imageResolver,
  imageFormats,
}) => {
  const imagesMap = {};
  const imageList = getListOfAllImageFiles(contentRoot, imageFormats);
  await Promise.all(
    imageList.map(async imgPath => {
      const newImage = await imageResolver({ imgPath, contentRoot });
      imagesMap[imgPath] = newImage;
    }),
  );
  return imagesMap;
};

export default createImagesMap;
