import { graphql } from 'graphql';
import { makeExecutableSchema } from 'graphql-tools';
import { dataStore, insert } from '../database';
import contentItemResolvers from './resolvers';
import contentItemTypeDefs from './__mocks__/mockTypeDefs.graphql';

import {
  CONTENT_ITEM_1,
  CONTENT_ITEM_2,
  CONTENT_ITEM_3,
  EXPECTED_RESULT_1,
} from './__mocks__/mockDbData';

const schema = makeExecutableSchema({
  typeDefs: contentItemTypeDefs,
  resolvers: contentItemResolvers,
});

beforeAll(async () => {
  await insert({ db: dataStore, docToInsert: CONTENT_ITEM_1 });
  await insert({ db: dataStore, docToInsert: CONTENT_ITEM_2 });
  await insert({ db: dataStore, docToInsert: CONTENT_ITEM_3 });
});

describe('contentItem Resolver', () => {
  describe('When searching for an existing contentItem', () => {
    test('finds the expected ContentItem', async () => {
      expect.assertions(1);
      const query = `{
        contentItem(id: "home_section") {
          id
          groupId
          html
        }
      }`;
      const result = await graphql(schema, query);
      const { id, groupId, html } = EXPECTED_RESULT_1;
      expect(result).toEqual({ data: { contentItem: { id, groupId, html } } });
    });
  });

  describe('When searching for a non-existing contentItem', () => {
    test('returns null', async () => {
      expect.assertions(1);
      const query = `{
        contentItem(id: "i_dont_exist") {
          id
          groupId
          html
        }
      }`;
      const result = await graphql(schema, query);
      expect(result).toEqual({ data: { contentItem: null } });
    });
  });
});

describe('contentItems Resolver', () => {
  describe('When searching for existing Items', () => {
    describe('And searching by ids', () => {
      test('With a single id, it returns a single contentItem', async () => {
        expect.assertions(1);

        const singleIdQuery = `{
          contentItems(query: { ids: ["home_section"] }) {
            id
            groupId
          }
        }`;

        const contentItems = await graphql(schema, singleIdQuery);
        expect(contentItems).toEqual({
          data: {
            contentItems: [
              { id: 'home_section', groupId: 'contentItems_test' },
            ],
          },
        });
      });

      test('With multi ids, it returns multiple contentItems', async () => {
        expect.assertions(1);

        const multiIdQuery = `{
          contentItems(query: { ids: ["home_section", "main_section"] }) {
            id
            groupId
          }
        }`;

        const contentItems = await graphql(schema, multiIdQuery);
        expect(contentItems).toEqual({
          data: {
            contentItems: [
              { id: 'home_section', groupId: 'contentItems_test' },
              { id: 'main_section', groupId: 'contentItems_test' },
            ],
          },
        });
      });

      test('Sorted in reverse order, it returns contentItems in reverse order.', async () => {
        expect.assertions(1);

        const sortQuery = `{
          contentItems(
            query: { ids: ["home_section", "main_section"] },
            pagination: {
              sort: {
                sortBy: "order",
                orderBy: DESCENDING
              },
              skip: 0,
              limit: 0
            })
          {
            id
            order
          }
        }`;

        const contentItems = await graphql(schema, sortQuery);
        expect(contentItems).toEqual({
          data: {
            contentItems: [
              { id: 'main_section', order: 2 },
              { id: 'home_section', order: 1 },
            ],
          },
        });
      });

      test('Limit result to 1 contentItem sorted in reverse order, it returns the first contentItem', async () => {
        expect.assertions(1);

        const sortedLimitQuery = `{
          contentItems(
            query: { ids: ["home_section", "main_section"] },
            pagination: {
              sort: {
                sortBy: "order",
                orderBy: DESCENDING
              },
              limit: 1
            })
          {
            id
            order
          }
        }`;

        const contentItems = await graphql(schema, sortedLimitQuery);
        expect(contentItems).toEqual({
          data: {
            contentItems: [{ id: 'main_section', order: 2 }],
          },
        });
      });

      test('Skip the first item whilst sorted in reverse order, it returns contentItems without the skipped item.', async () => {
        expect.assertions(1);

        const sortedSkipQuery = `{
          contentItems(
            query: { ids: ["home_section", "main_section"] },
            pagination: {
              sort: {
                sortBy: "order",
                orderBy: DESCENDING
              },
              skip: 1,
            })
          {
            id
            order
          }
        }`;

        const contentItems = await graphql(schema, sortedSkipQuery);
        expect(contentItems).toEqual({
          data: {
            contentItems: [{ id: 'home_section', order: 1 }],
          },
        });
      });

      test('Skip all items, it returns an empty array.', async () => {
        expect.assertions(1);

        const skipQuery = `{
          contentItems(
            query: { ids: ["home_section", "main_section"] },
            pagination: {
              skip: 5,
            })
          {
            id
            order
          }
        }`;

        const contentItems = await graphql(schema, skipQuery);
        expect(contentItems).toEqual({
          data: {
            contentItems: [],
          },
        });
      });
    });

    describe('And searching by groupIds', () => {
      test('With a single groupId, it returns contentItems matching the groupId.', async () => {
        expect.assertions(1);

        const singleIdQuery = `{
          contentItems(query: { groupIds: ["contentItems_test"] }) {
            id
            groupId
          }
        }`;

        const contentItems = await graphql(schema, singleIdQuery);
        expect(contentItems).toEqual({
          data: {
            contentItems: [
              { id: 'home_section', groupId: 'contentItems_test' },
              { id: 'main_section', groupId: 'contentItems_test' },
            ],
          },
        });
      });

      test('With multi groupIds, it returns multiple contentItems matching the groupIds.', async () => {
        expect.assertions(1);

        const multiIdQuery = `{
          contentItems(query: { groupIds: ["contentItems_test", "fireman_test"] }) {
            id
            groupId
          }
        }`;

        const contentItems = await graphql(schema, multiIdQuery);
        expect(contentItems).toEqual({
          data: {
            contentItems: [
              { id: 'home_section', groupId: 'contentItems_test' },
              { id: 'main_section', groupId: 'contentItems_test' },
              { id: 'fire_man', groupId: 'fireman_test' },
            ],
          },
        });
      });

      test('Sorted in reverse order, it returns contentItems in reverse order.', async () => {
        expect.assertions(1);

        const sortQuery = `{
          contentItems(
            query: { groupIds: ["contentItems_test", "fireman_test"] },
            pagination: {
              sort: {
                sortBy: "order",
                orderBy: DESCENDING
              },
              skip: 0,
              limit: 0
            })
          {
            id
            order
          }
        }`;

        const contentItems = await graphql(schema, sortQuery);
        expect(contentItems).toEqual({
          data: {
            contentItems: [
              { id: 'fire_man', order: 3 },
              { id: 'main_section', order: 2 },
              { id: 'home_section', order: 1 },
            ],
          },
        });
      });

      test('Limit result to 1 contentItem sorted in reverse order, it returns the first contentItem', async () => {
        expect.assertions(1);

        const sortedLimitQuery = `{
          contentItems(
            query: { groupIds: ["contentItems_test", "fireman_test"] },
            pagination: {
              sort: {
                sortBy: "order",
                orderBy: DESCENDING
              },
              limit: 1
            })
          {
            id
            order
          }
        }`;

        const contentItems = await graphql(schema, sortedLimitQuery);
        expect(contentItems).toEqual({
          data: {
            contentItems: [{ id: 'fire_man', order: 3 }],
          },
        });
      });

      test('Skip the first item whilst sorted in reverse order, it returns contentItems without the skipped item.', async () => {
        expect.assertions(1);

        const sortedSkipQuery = `{
          contentItems(
            query: { groupIds: ["contentItems_test", "fireman_test"] },
            pagination: {
              sort: {
                sortBy: "order",
                orderBy: DESCENDING
              },
              skip: 1,
            })
          {
            id
            order
          }
        }`;

        const contentItems = await graphql(schema, sortedSkipQuery);
        expect(contentItems).toEqual({
          data: {
            contentItems: [
              { id: 'main_section', order: 2 },
              { id: 'home_section', order: 1 },
            ],
          },
        });
      });

      test('Skip all items, it returns an empty array.', async () => {
        expect.assertions(1);

        const skipQuery = `{
          contentItems(
            query: { groupIds: ["contentItems_test", "fireman_test"] },
            pagination: {
              skip: 5,
            })
          {
            id
            order
          }
        }`;

        const contentItems = await graphql(schema, skipQuery);
        expect(contentItems).toEqual({
          data: {
            contentItems: [],
          },
        });
      });
    });

    // TODO: Replace queries with groupId with another field once the fieldMatcher
    // fieldsQuery has been refactored to allow `value` to be any scalar type.
    // API for fieldMatcher will need to be rethought to enable queries by types other then a String.
    describe('And searching with fieldMatcher', () => {
      // TODO: Add below Tests once the fieldMatcher query has been refactored.
      // - Add tests to cover all scalar types we allow.
      // - Add test where we mix a query with differing types
      // Float, Int, String, Boolean
      test('With a single field, it returns contentItems matching the field queried.', async () => {
        expect.assertions(1);

        const singleIdQuery = `{
          contentItems(
            query: {
              fieldMatcher: {
                fields: [{ name: "test", value: "I am a ContentItem!" }]
              }
            })
          {
            id
            test
          }
        }`;

        const contentItems = await graphql(schema, singleIdQuery);
        expect(contentItems).toEqual({
          data: {
            contentItems: [{ id: 'home_section', test: 'I am a ContentItem!' }],
          },
        });
      });

      test('With multi fields, it returns only the contentItems that match all the fields queried by.', async () => {
        expect.assertions(1);

        const multiIdQuery = `{
          contentItems(
            query: {
              fieldMatcher: {
                fields: [
                  { name: "test", value: "I am a ContentItem!" },
                  { name: "groupId", value: "contentItems_test" },
                ]
              }
            })
          {
            id
            test
            groupId
          }
        }`;

        const contentItems = await graphql(schema, multiIdQuery);
        expect(contentItems).toEqual({
          data: {
            contentItems: [
              {
                id: 'home_section',
                groupId: 'contentItems_test',
                test: 'I am a ContentItem!',
              },
            ],
          },
        });
      });

      test('Sorted in reverse order, it returns contentItems in reverse order.', async () => {
        expect.assertions(1);

        const sortQuery = `{
          contentItems(
            query: {
              fieldMatcher: {
                fields: [{ name: "groupId", value: "contentItems_test" }]
              }
            },
            pagination: {
              sort: {
                sortBy: "order",
                orderBy: DESCENDING
              },
              skip: 0,
              limit: 0
            })
          {
            id
            groupId
            order
          }
        }`;

        const contentItems = await graphql(schema, sortQuery);
        expect(contentItems).toEqual({
          data: {
            contentItems: [
              { id: 'main_section', groupId: 'contentItems_test', order: 2 },
              { id: 'home_section', groupId: 'contentItems_test', order: 1 },
            ],
          },
        });
      });

      test('Limit result to 1 contentItem sorted in reverse order, it returns the first contentItem', async () => {
        expect.assertions(1);

        const sortedLimitQuery = `{
          contentItems(
            query: {
              fieldMatcher: {
                fields: [{ name: "groupId", value: "contentItems_test" }]
              }
            },
            pagination: {
              sort: {
                sortBy: "order",
                orderBy: DESCENDING
              },
              limit: 1
            })
          {
            id
            groupId
            order
          }
        }`;

        const contentItems = await graphql(schema, sortedLimitQuery);
        expect(contentItems).toEqual({
          data: {
            contentItems: [
              { id: 'main_section', groupId: 'contentItems_test', order: 2 },
            ],
          },
        });
      });

      test('Skip the first item whilst sorted in reverse order, it returns contentItems without the skipped item.', async () => {
        expect.assertions(1);

        const sortedSkipQuery = `{
          contentItems(
            query: {
              fieldMatcher: {
                fields: [{ name: "groupId", value: "contentItems_test" }]
              }
            },
            pagination: {
              sort: {
                sortBy: "order",
                orderBy: DESCENDING
              },
              skip: 1,
            })
          {
            id
            groupId
            order
          }
        }`;

        const contentItems = await graphql(schema, sortedSkipQuery);
        expect(contentItems).toEqual({
          data: {
            contentItems: [
              { id: 'home_section', groupId: 'contentItems_test', order: 1 },
            ],
          },
        });
      });

      test('Skip all items, it returns an empty array.', async () => {
        expect.assertions(1);

        const skipQuery = `{
          contentItems(
            query: {
              fieldMatcher: {
                fields: [{ name: "groupId", value: "contentItems_test" }]
              }
            },
            pagination: {
              skip: 5,
            })
          {
            id
            groupId
            order
          }
        }`;

        const contentItems = await graphql(schema, skipQuery);
        expect(contentItems).toEqual({
          data: {
            contentItems: [],
          },
        });
      });
    });
  });

  describe('When searching for non-existing contentItems', () => {
    test('And searching by ids, it returns an empty array.', async () => {
      expect.assertions(1);

      const idsQuery = `{
          contentItems(query: { ids: ["i_dont_exist", "i_dont_exist2"] })
          {
            id
            order
          }
        }`;

      const contentItems = await graphql(schema, idsQuery);
      expect(contentItems).toEqual({
        data: {
          contentItems: [],
        },
      });
    });

    test('And searching by groupIds, it returns an empty array.', async () => {
      expect.assertions(1);

      const groupIdsQuery = `{
          contentItems(query: { groupIds: ["i_dont_exist"] })
          {
            id
            groupId,
            order
          }
        }`;

      const contentItems = await graphql(schema, groupIdsQuery);
      expect(contentItems).toEqual({
        data: {
          contentItems: [],
        },
      });
    });

    test('And searching by fieldMatcher, it returns an empty array.', async () => {
      expect.assertions(1);

      const fieldMatcherQuery = `{
          contentItems(query: {
            fieldMatcher: { fields: [{ name: "temperature", value: 5.0 }] }
          })
          {
            id
            temperature
          }
        }`;

      const contentItems = await graphql(schema, fieldMatcherQuery);
      expect(contentItems).toEqual({
        data: {
          contentItems: [],
        },
      });
    });
  });
});
