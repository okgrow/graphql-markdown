import createImagesMap from './createImagesMap';

const CONTENT_ROOT = `${__dirname}/__mocks__/content`;

// TODO: MOCK or import the DEFAULT_SUPPORTED_IMAGE_FORMATS
describe('When creating an imagesMap for all our images stored relatively to our .md files.', () => {
  test('generates the imageMap, it returns the mapping of image URIs.', async () => {
    expect.assertions(1);

    const imageFunc = ({ imgPath, contentRoot }) =>
      `/images${imgPath.slice(contentRoot.length)}`;

    const result = await createImagesMap({
      contentRoot: CONTENT_ROOT,
      imageFunc,
      imageFormats: '(png|jpg|jpeg|svg|gif|webp|bmp)',
    });

    expect(result).toEqual({
      [`${CONTENT_ROOT}/graphql-logo.svg`]: '/images/graphql-logo.svg',
      [`${CONTENT_ROOT}/parallax-movement.gif`]: '/images/parallax-movement.gif',
    });
  });
});
