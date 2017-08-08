import * as queryHelpers from './queryHelpers';

const Query = {
  contentItem: async (root, { id } /* , context */) =>
    queryHelpers.getContentItem(id),
  contentItems: async (root, { query, pagination } /* , context */) =>
    queryHelpers.getContentItems({ ...query, pagination }),
};

export default { Query };
