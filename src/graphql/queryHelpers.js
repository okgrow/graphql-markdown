import { find, findOne, dataStore } from '../database';
import { convertOrderBy, mapContentItems } from '../helpers';

/**
 * Retrieves the specified ContentItem by it's id.
 * @param {string} id - The id of the ContentItem
 * @returns {Object|null} returns the ContentItem or null on error.
 */
export const findContentItemById = async id => {
  // Don't even bother if we didn't get an ID
  if (id) {
    try {
      const contentItem = await findOne({
        db: dataStore,
        query: { id },
        mapFunc: mapContentItems,
      });

      return contentItem;
    } catch (error) {
      console.error('[getContentItem]', error); // eslint-disable-line no-console
    }
  }
  return null;
};

// *********************** TODO ********************
// TODO: Refactor and abstract all three functions try/catch block code into
// a single function that will query the nedb for us.
// e.g queryDB({ query, sort, skip, limit, errorMsg });
export const findContentItemsByIds = async ({
  ids = [],
  pagination: { sort = null, skip = 0, limit = 0 } = {},
}) => {
  // We do not allow returning every ContentItem
  if (!ids.length) {
    throw new Error(
      '[findContentItemsByIds]: You must provide at least one id.',
    );
  }

  try {
    const query = { id: { $in: ids } };

    const sortOptions = sort
      ? { [sort.sortBy]: convertOrderBy(sort.orderBy) }
      : null;

    const contentItems = await find({
      db: dataStore,
      query,
      sortOptions,
      skip,
      limit,
      mapFunc: mapContentItems,
    });

    return contentItems;
  } catch (error) {
    // TODO: Should we throw or only log?
    console.error('[getContentItemsByIds] -> ', error); // eslint-disable-line no-console
  }
  // NOTE: Should we do a throw in the error above instead of empty array?
  return [];
};

export const findContentItemsByGroupId = async ({
  groupId,
  pagination: { sort = null, skip = 0, limit = 0 } = {},
}) => {
  // We do not allow returning every ContentItem
  if (!groupId) {
    throw new Error('[findByGroupId]: You must provide a groupId.');
  }
  try {
    const query = { groupId };

    const sortOptions = sort
      ? { [sort.sortBy]: convertOrderBy(sort.orderBy) }
      : null;

    const contentItems = await find({
      db: dataStore,
      query,
      sortOptions,
      skip,
      limit,
      mapFunc: mapContentItems,
    });

    return contentItems;
  } catch (error) {
    // TODO: Should we throw or only log?
    console.error('[getContentItemsByGroupId] -> ', error); // eslint-disable-line no-console
  }
  // NOTE: Should we do a throw in the error above instead of empty array?
  return [];
};

// contentItems(filter: FilterFields!, pagination: Pagination): [ContentItem!]
/**
 *
 * @param {Object} param
 * @param {string[]} param.ids - ContentItem's ids
 * @param {string[]} param.groupIds - ContentItem's groupIds
 * @param {Object} param.fieldMatcher - Refer to FieldMatcher in `src/graphql/typeDefs.graphql`
 * @param {Object} param.pagination - Refer to Pagination in `src/graphql/typeDefs.graphql`
 * @returns {Object[]} returns an array of ContentItems.
 */
// getContentItems(ids: [foo, boo])
// getContentItemsByField(fields: { title: "Hello World" });

export const findContentItemsByFilter = async ({
  filter: { AND = {}, OR = [] } = {},
  pagination: { sort = null, skip = 0, limit = 0 } = {},
}) => {
  // NOTE: Currently do no support querying with AND + OR
  // TODO: Throw error if try to filter with AND & OR
  const isAndEmpty = !Object.keys(AND).length;

  // Only allowed to find ContentItems if fields have been provided
  if (!OR.length && isAndEmpty) {
    throw new Error(
      '[findContentItemsByFilter]: You must provide at least one field to filter on.',
    );
  }

  try {
    const query = !isAndEmpty ? AND : { $or: OR };

    const sortOptions = sort
      ? { [sort.sortBy]: convertOrderBy(sort.orderBy) }
      : null;

    const contentItems = await find({
      db: dataStore,
      query,
      sortOptions,
      skip,
      limit,
      mapFunc: mapContentItems,
    });
    return contentItems;
  } catch (error) {
    console.error('[getContentItems] -> ', error); // eslint-disable-line no-console
  }
  return [];
};
