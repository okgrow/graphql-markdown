import { createBase64Image, getListOfAllImageFiles } from '../server-helpers';

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
