import * as queryHelpers from './queryHelpers';

const Query = {
  contentItemById: async (root, { id } /* , context */) =>
    queryHelpers.findContentItemById(id),

  contentItemsByIds: async (root, { ids, pagination } /* , context */) =>
    queryHelpers.findContentItemsByIds({ ids, pagination }),

  contentItemsByGroupId: async (root, { groupId, pagination } /* , ctx */) =>
    queryHelpers.findContentItemsByGroupId({ groupId, pagination }),

  contentItems: async (root, { filter, pagination } /* , context */) =>
    queryHelpers.findContentItemsByFilter({ filter, pagination }),
};

export default { Query };
