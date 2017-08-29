import { createBase64Image, getListOfAllImageFiles } from '../server-helpers';

/**
 * Creates an object that maps the local fullPath of an image to it's desired path. e.g - { fullPathName: "cdn.com/foo.png", ... }
 * @param {Object} param
 * @param {string} param.contentRoot - Path to where all markdown files are stored.
 * @param {Object} param.imageFunc - function provided by user to create imgPaths. 
 * @returns {Object} imageMap e.g - { fullPathName: "cdn.com/foo.png", ... }
 */
const createImagesMap = async ({ contentRoot, imageFunc }) => {
  const imageList = getListOfAllImageFiles(contentRoot);
  const imagesMap = {};
  await Promise.all(
    imageList.map(async imgPath => {
      const newImage = imageFunc
        ? await imageFunc({ imgPath, contentRoot })
        : await createBase64Image(imgPath);
      imagesMap[imgPath] = newImage;
    }),
  );
  return imagesMap;
};

export default createImagesMap;
