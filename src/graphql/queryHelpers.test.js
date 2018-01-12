import { dataStore, insert } from '../database';
import {
  findContentItemById,
  findContentItemsByIds,
  findContentItemsByGroupId,
  findContentItemsByFilter,
} from './queryHelpers';

// ********* TODO ***********
// Refactor try/catch block usage as it gives a false/positive result when it should fail.
import {
  CONTENT_ITEM_1,
  CONTENT_ITEM_2,
  CONTENT_ITEM_3,
  EXPECTED_RESULT_1,
  EXPECTED_RESULT_2,
  EXPECTED_RESULT_3,
} from './__mocks__/mockDbData';

beforeAll(async () => {
  await insert({ db: dataStore, docToInsert: CONTENT_ITEM_1 });
  await insert({ db: dataStore, docToInsert: CONTENT_ITEM_2 });
  await insert({ db: dataStore, docToInsert: CONTENT_ITEM_3 });
});

// TODO: Wrap getContentItem in describes & add more tests
test('findContentItemById', async () => {
  expect.assertions(1);
  try {
    const contentItem = await findContentItemById('home_section');
    expect(contentItem).toEqual(EXPECTED_RESULT_1);
  } catch (error) {
    console.error('[Find by id]: ', error);
  }
});

// TODO: Wrap getContentItems in describes
test('getContentItems by ids', async () => {
  expect.assertions(2);
  try {
    // Test returning a single contentItem
    const singleContentItem = await findContentItemsByIds({
      ids: ['home_section'],
    });
    expect(singleContentItem).toEqual([EXPECTED_RESULT_1]);

    // Test returning multiple contentItems
    const multiContentItem = await findContentItemsByIds({
      ids: ['home_section', 'main_section'],
    });
    expect(multiContentItem).toEqual([EXPECTED_RESULT_1, EXPECTED_RESULT_2]);
  } catch (error) {
    console.error('[Find by ids]: ', error);
  }
});

test('Search for ContentItems by groupIds, it returns the expected ContentItems.', async () => {
  expect.assertions(1);
  try {
    // Test returning all contentItems with specific groupId
    const contentItems = await findContentItemsByGroupId({
      groupId: 'contentItems_test',
    });
    expect(contentItems).toEqual([EXPECTED_RESULT_1, EXPECTED_RESULT_2]);
  } catch (error) {
    console.error('[Find by groupIds]: ', error);
  }
});

test('Filtering by AND, it returns ContentItems matching all conditions.', async () => {
  expect.assertions(1);
  try {
    // Test returning contentItems by specific fields
    const contentItems = await findContentItemsByFilter({
      filter: {
        AND: { groupId: 'contentItems_test', temperature: 30.5 },
      },
    });
    expect(contentItems).toEqual([EXPECTED_RESULT_2]);
    // TODO: Test OR condition/query
  } catch (error) {
    console.error('[Find by filter - AND]: ', error);
  }
});

test('Filtering by OR, it returns ContentItems matching all conditions.', async () => {
  expect.assertions(1);
  try {
    // Test returning contentItems by specific fields
    const contentItems = await findContentItemsByFilter({
      filter: {
        OR: [
          { groupId: 'contentItems_test', temperature: 30.5 },
          { temperature: 345.5 },
        ],
      },
    });
    expect(contentItems).toEqual([EXPECTED_RESULT_2, EXPECTED_RESULT_3]);
  } catch (error) {
    console.error('[Find by filter - OR]: ', error);
  }
});

test('Search for ContentItems by filter and pagination.', async () => {
  expect.assertions(3);
  try {
    // Test returning contentItems in reverse order via sort
    const sortTest = await findContentItemsByIds({
      ids: ['main_section', 'home_section', 'fire_man'],
      pagination: { sort: { sortBy: 'order', orderBy: 'DESCENDING' } },
    });

    expect(sortTest).toEqual([
      EXPECTED_RESULT_3,
      EXPECTED_RESULT_2,
      EXPECTED_RESULT_1,
    ]);

    // Test returning contentItems in reverse order and the skipping first result
    const skipTest = await findContentItemsByGroupId({
      groupId: 'contentItems_test',
      pagination: { sort: { sortBy: 'order', orderBy: 'DESCENDING' }, skip: 1 },
    });

    expect(skipTest).toEqual([EXPECTED_RESULT_1]);

    // Test returning contentItems in reverse order and limiting to one result
    const limitTest = await findContentItemsByFilter({
      filter: {
        OR: [{ groupId: 'contentItems_test' }, { groupId: 'fireman_test' }],
      },
      pagination: {
        sort: { sortBy: 'order', orderBy: 'DESCENDING' },
        limit: 1,
      },
    });
    expect(limitTest).toEqual([EXPECTED_RESULT_3]);
  } catch (error) {
    console.error('[Pagination]: ', error);
  }
});
