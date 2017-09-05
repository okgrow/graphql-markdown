import { dataStore, insert } from '../database';
import { getContentItem, getContentItems } from './queryHelpers';

import {
  CONTENT_ITEM_1,
  CONTENT_ITEM_2,
  EXPECTED_RESULT_1,
  EXPECTED_RESULT_2,
} from './__mocks__/mockData';

beforeAll(async () => {
  await insert({ db: dataStore, docToInsert: CONTENT_ITEM_1 });
  await insert({ db: dataStore, docToInsert: CONTENT_ITEM_2 });
});

// TODO: Wrap getContentItem in describes & add more tests
test('getContentItem', async () => {
  expect.assertions(1);
  try {
    const contentItem = await getContentItem('home_section');
    expect(contentItem).toEqual(EXPECTED_RESULT_1);
  } catch (error) {
    console.error('Error', error);
  }
});

// TODO: Wrap getContentItems in describes
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
