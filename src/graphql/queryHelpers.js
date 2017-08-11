import { convertOrderBy, metaDataToObject, isMultiArgsQuery } from '../helpers';

import { find, findOne, dataStore } from '../database';

export const getContentItem = async id => {
  // Don't even bother if we didn't get an ID
  if (id) {
    try {
      const contentItem = await findOne({ db: dataStore, query: { id } });

      return contentItem;
    } catch (error) {
      console.error('[getContentItem]', error); // eslint-disable-line no-console
    }
  }
  return null;
};

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
      });
      return contentItems;
    } catch (error) {
      console.error('[getContentItems]', error); // eslint-disable-line no-console
    }
  }
  return [];
};
