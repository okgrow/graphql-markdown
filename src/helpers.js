export const getRelativeFilename = fullPathName =>
  fullPathName.slice(fullPathName.lastIndexOf('/') + 1);

// NOTE: converting object into array of objects to match the gql
// MetaDataField type. We are using es7 Object.entries.
export const metaDataToArray = metaData =>
  Object.entries(metaData).map(([key, value]) => ({ name: key, value }));

// Mapping metaData from it's array format back to an object with key: value pairs.
export const metaDataToObject = metaData =>
  metaData.reduce((sum, { name, value }) => ({ ...sum, [name]: value }), {});

// TODO: Decide if we will keep the getGroupId function
// NOTE: This is an early prototype, more thought should go into best approach,
// to determining the GroupId.
// We determine the contentType by checking what folder it belongs to.
// e.g - "/posts/2016/01/transmission-podcast.md" will return "posts"
// e.g - "/pages/graphql/graphql.md" will return "pages"
export const getGroupId = assetDir => {
  const searchIndex = assetDir.indexOf('/', 1);
  const endIndex = searchIndex >= 0 ? searchIndex : undefined;
  return assetDir.slice(1, endIndex);
};

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
  // specific metaData. Would be nice to return an object instead of array.
  metaData: metaDataToArray(metaData),
  content: html,
});

export const tagsToArray = tags => {
  if (!tags || !tags.length) return [];
  return tags.split(',').map(tag => tag.trim());
};

export const convertOrderBy = orderBy => {
  if (orderBy === 'DESCENDING') {
    return -1;
  }
  return 1;
};

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

// imageMap - Object { fullPathName: "cdn.com/foo.png", ... }
// images - Array of strings. e.g - [".../foo.jpg"]
// html - valid html stored in a String
// function returns a html string;
export const replaceHtmlImageSrc = ({ images, imageMap, html }) =>
  images.reduce((sum, imageFileName) => {
    const imageName = getRelativeFilename(imageFileName);
    return sum.replace(imageName, imageMap[imageFileName]);
  }, html);
