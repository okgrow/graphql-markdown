import {
  convertOrderBy,
  metaDataToObject,
  isMultiArgsQuery,
  mapContentItems,
} from '../helpers';

import { find, findOne, dataStore } from '../database';

/**
 * Retrieves the specified ContentItem by it's id.
 * @param {string} id - The id of the ContentItem
 * @returns {Object|null} returns the ContentItem or null on error.
 */
export const getContentItem = async id => {
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

/**
 * Creates an object that maps the local fullPath of an image to it's desired path. e.g - { fullPathName: "cdn.com/foo.png", ... }
 * @param {Object} param
 * @param {string[]} param.ids - ContentItem's ids
 * @param {string[]} param.groupIds - ContentItem's groupIds
 * @param {Object} param.fieldMatcher - Refer to FieldMatcher in `src/graphql/typeDefs.graphql`
 * @param {Object} param.pagination - Refer to Pagination in `src/graphql/typeDefs.graphql`
 * @returns {Object[]} returns an array of ContentItems.
 */
export const getContentItems = async ({
  ids = [],
  groupIds = [],
  fieldMatcher: { fields = [] } = {},
  pagination: { sort = null, skip = 0, limit = 0 } = {},
}) => {
  // NOTE: should we fail on passing an empty array?
  if (!groupIds.length && !ids.length && !fields.length) {
    throw new Error(
      '[getContentItems]: Query expects at least one param, either ids, groupIds, or fieldMatcher.',
    );
  }
  // Don't even bother if we didn't get an ID
  if (groupIds.length || ids.length || fields.length) {
    try {
      const idsQuery = { id: { $in: ids } };
      const groupIdQuery = { groupId: { $in: groupIds } };
      const fieldsQuery = metaDataToObject(fields);

      const multiArgsQuery = { $or: [idsQuery, groupIdQuery, fieldsQuery] };
      const singleArgQuery = {
        ...(ids.length ? idsQuery : null),
        ...(groupIds.length ? groupIdQuery : null),
        ...(fields.length ? fieldsQuery : null),
      };

      const query = isMultiArgsQuery({ ids, groupIds, fields })
        ? multiArgsQuery
        : singleArgQuery;

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
      console.error('[getContentItems]', error); // eslint-disable-line no-console
    }
  }
  return [];
};
