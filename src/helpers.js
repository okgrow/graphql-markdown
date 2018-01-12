/**
 * Returns the file's name.
 * @param {string} fullPathName - Path to file
 * @returns {string} File's name "graphql.md"
 */
export const getRelativeFilename = fullPathName =>
  fullPathName.slice(fullPathName.lastIndexOf('/') + 1);

// TODO: Decide if we will keep the getGroupId function
/**
 * Returns the groupId from the file's path.
 * e.g - "/pages/graphql/graphql.md" will return "pages"
 * @param {string} assetDir - Relative path of the file starting from contentRoot.
 * @returns {string} groupId - e.g: "homePage"
 */
export const getGroupId = assetDir => {
  const searchIndex = assetDir.indexOf('/', 1);
  const endIndex = searchIndex >= 0 ? searchIndex : undefined;
  return assetDir.slice(1, endIndex);
};

/**
 * Create a ContentItem conforming to our gql schema typeDef.
 * @param {Object} params
 * @returns {Object} A ContentItem matching the gql schema typeDef/
 */
export const mapContentItems = ({
  _id,
  markdown,
  assetDir,
  images,
  ...fields
}) => fields;

/**
 * Convert our gql OrderBy enum into a format that nedb can understand.
 * @param {string} orderBy - It can be "ASCENDING" or "DESCENDING".
 * @returns {number} Order to sort the results in our query for nedb.
 */
export const convertOrderBy = orderBy => {
  if (orderBy === 'DESCENDING') {
    return -1;
  }
  return 1;
};

/**
 * Replace all relative image paths in our html e.g - <img src="path" ...> with a path that we prescribe like a cdn. e.g - "cdn.com/foo.png"
 * @param {Object} param
 * @param {string[]} obj.images - e.g - [".../foo.jpg", ...]
 * @param {Object} obj.imageMap - e.g - { fullPathName: "cdn.com/foo.png", ... }
 * @param {string} obj.html - html that we will process
 * @returns {string} valid html with the <img src="" ...> correctly updated.
 */
export const replaceHtmlImageSrc = ({ images, imageMap, html }) =>
  images.reduce((sum, imageFileName) => {
    const imageName = getRelativeFilename(imageFileName);
    return sum.replace(imageName, imageMap[imageFileName]);
  }, html);
