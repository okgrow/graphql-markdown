/**
 * Returns the file's name.
 * @param {string} fullPathName - Path to file
 * @returns {string} File's name "graphql.md"
 */
export const getRelativeFilename = fullPathName =>
  fullPathName.slice(fullPathName.lastIndexOf('/') + 1);

/**
 * Convert metaData from it's Object format to an Array of Objects.
 * NOTE: We are using es7 Object.entries.
 * @param {Object} metaData - Extra key/value pairs from a .md file. e.g - { foo: "bar" }
 * @returns {Array} metaData matching the gql schema format. e.g - [{ name: "foo", value: "bar" }, ...]
 */
export const metaDataToArray = metaData =>
  Object.entries(metaData).map(([key, value]) => ({ name: key, value }));

/**
 * Convert metaData from it's gql schema format to it's Object format
 * with "key": "value" pairs.
 * @param {Array} metaData - [{ name: "", value: "foo" }, ...]
 * @returns {Object} metaData formatted as an object with it's "key": "value" pairs.
 */
export const metaDataToObject = metaData =>
  metaData.reduce((sum, { name, value }) => ({ ...sum, [name]: value }), {});

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
  html,
  markdown,
  assetDir,
  images,
  ...metaData
}) => ({
  id: metaData.id,
  groupId: metaData.groupId,
  // TODO: look into unions or interface, currently can't query for
  // specific metaData. Would be nice to return an object instead of an array.
  metaData: metaDataToArray(metaData),
  content: html,
});

/**
 * Convert any comma delimited string into an array.
 * @param {string} tags - A string with words that are comma delimited.
 * @returns {string[]} An array of tags.
 */
export const tagsToArray = tags => {
  if (!tags || !tags.length) return [];
  return tags.split(',').map(tag => tag.trim());
};

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
 * Determine if a query has mulitple arguments
 * @param {Object} args - object containing all args provided by the client.
 * @returns {boolean}
 */
// prettier-ignore
export const isMultiArgsQuery = args => {
  const count = Object.entries(args).reduce((sum, [key, value]) => { // eslint-disable-line
    if (value && value.length > 0) {
      return sum + 1;
    }
    return sum;
  }, 0);
  return count > 1;
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
