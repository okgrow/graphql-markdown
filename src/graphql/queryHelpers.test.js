import { dataStore, insert } from '../database';
import { getContentItem, getContentItems } from './queryHelpers';

const EXPECTED_RESULT_1 = {
  id: 'home_section',
  groupId: 'contentItems_test',
  content: undefined,
  metaData: [
    {
      name: 'id',
      value: 'home_section',
    },
    {
      name: 'groupId',
      value: 'contentItems_test',
    },
    {
      name: 'test',
      value: 'I am a ContentItem!',
    },
    {
      name: 'isContentItem',
      value: true,
    },
    {
      name: 'order',
      value: 1,
    },
  ],
};

const EXPECTED_RESULT_2 = {
  id: 'main_section',
  groupId: 'contentItems_test',
  content: undefined,
  metaData: [
    {
      name: 'id',
      value: 'main_section',
    },
    {
      name: 'groupId',
      value: 'contentItems_test',
    },
    {
      name: 'isContentItem',
      value: false,
    },
    {
      name: 'order',
      value: 2,
    },
  ],
};

beforeAll(async () => {
  const doc1 = {
    _id: 'contentItem_test_1',
    id: 'home_section',
    groupId: 'contentItems_test',
    test: 'I am a ContentItem!',
    isContentItem: true,
    order: 1,
  };
  const doc2 = {
    _id: 'contentItem_test_2',
    id: 'main_section',
    groupId: 'contentItems_test',
    isContentItem: false,
    order: 2,
  };
  await insert({ db: dataStore, docToInsert: doc1 });
  await insert({ db: dataStore, docToInsert: doc2 });
});

test('getContentItem', async () => {
  expect.assertions(1);
  try {
    const contentItem = await getContentItem('home_section');
    expect(contentItem).toEqual(EXPECTED_RESULT_1);
  } catch (error) {
    console.error('Error', error);
  }
});

// {
//   ids = ['home_section'],
//   groupIds = [],
//   fieldMatcher: { fields = [] } = {},
//   pagination: { sort = null, skip = 0, limit = 0 } = {},
// }
test('getContentItems by ids', async () => {
  expect.assertions(2);
  try {
    // Test returning a single contentItem
    const singleContentItem = await getContentItems({ ids: ['home_section'] });
    expect(singleContentItem).toEqual([EXPECTED_RESULT_1]);

    // Test returning multiple contentItems
    const multiContentItem = await getContentItems({
      ids: ['home_section', 'main_section'],
    });
    expect(multiContentItem).toEqual([EXPECTED_RESULT_1, EXPECTED_RESULT_2]);
  } catch (error) {
    console.error('Error', error);
  }
});

test('getContentItems by groupIds', async () => {
  expect.assertions(1);
  try {
    // Test returning all contentItems with specific groupId
    const contentItems = await getContentItems({
      groupIds: ['contentItems_test'],
    });
    expect(contentItems).toEqual([EXPECTED_RESULT_1, EXPECTED_RESULT_2]);
  } catch (error) {
    console.error('Error', error);
  }
});

test('getContentItems by fieldMatcher', async () => {
  expect.assertions(1);
  try {
    // Test returning contentItems by specific fields
    const contentItems = await getContentItems({
      fieldMatcher: {
        fields: [{ name: 'groupId', value: 'contentItems_test' }],
      },
    });
    expect(contentItems).toEqual([EXPECTED_RESULT_1, EXPECTED_RESULT_2]);
  } catch (error) {
    console.error('Error', error);
  }
});

test('getContentItems with pagination', async () => {
  expect.assertions(3);
  try {
    // Test returning contentItems in reverse order via sort
    const sortTest = await getContentItems({
      groupIds: ['contentItems_test'],
      pagination: { sort: { sortBy: 'order', orderBy: 'DESCENDING' } },
    });
    expect(sortTest).toEqual([EXPECTED_RESULT_2, EXPECTED_RESULT_1]);

    // Test returning contentItems in reverse order and the skipping first result
    const skipTest = await getContentItems({
      groupIds: ['contentItems_test'],
      pagination: { sort: { sortBy: 'order', orderBy: 'DESCENDING' }, skip: 1 },
    });
    expect(skipTest).toEqual([EXPECTED_RESULT_1]);

    // Test returning contentItems in reverse order and limiting to one result
    const limitTest = await getContentItems({
      groupIds: ['contentItems_test'],
      pagination: {
        sort: { sortBy: 'order', orderBy: 'DESCENDING' },
        limit: 1,
      },
    });
    expect(limitTest).toEqual([EXPECTED_RESULT_2]);
  } catch (error) {
    console.error('Error', error);
  }
});
