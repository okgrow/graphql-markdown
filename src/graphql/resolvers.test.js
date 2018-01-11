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
        contentItemById(id: "home_section") {
          id
          groupId
          html
        }
      }`;
      const result = await graphql(schema, query);
      const { id, groupId, html } = EXPECTED_RESULT_1;
      expect(result).toEqual({
        data: { contentItemById: { id, groupId, html } },
      });
    });
  });

  describe('When searching for a non-existing contentItem', () => {
    test('returns null', async () => {
      expect.assertions(1);
      const query = `{
        contentItemById(id: "i_dont_exist") {
          id
          groupId
          html
        }
      }`;
      const result = await graphql(schema, query);
      expect(result).toEqual({ data: { contentItemById: null } });
    });
  });
});

describe('contentItems Resolver', () => {
  describe('When searching for existing Items', () => {
    describe('And searching by ids', () => {
      test('With a single id, it returns a single contentItem', async () => {
        expect.assertions(1);

        const singleIdQuery = `{
          contentItemsByIds(ids: ["home_section"],) {
            id
            groupId
          }
        }`;

        const contentItems = await graphql(schema, singleIdQuery);
        expect(contentItems).toEqual({
          data: {
            contentItemsByIds: [
              { id: 'home_section', groupId: 'contentItems_test' },
            ],
          },
        });
      });

      test('With multi ids, it returns multiple contentItems', async () => {
        expect.assertions(1);

        const multiIdQuery = `{
          contentItemsByIds(ids: ["home_section", "main_section"]) {
            id
            groupId
          }
        }`;

        const contentItems = await graphql(schema, multiIdQuery);
        expect(contentItems).toEqual({
          data: {
            contentItemsByIds: [
              { id: 'home_section', groupId: 'contentItems_test' },
              { id: 'main_section', groupId: 'contentItems_test' },
            ],
          },
        });
      });

      test('Sorted in reverse order, it returns contentItems in reverse order.', async () => {
        expect.assertions(1);

        const sortQuery = `{
          contentItemsByIds(
            ids: ["home_section", "main_section"],
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
            contentItemsByIds: [
              { id: 'main_section', order: 2 },
              { id: 'home_section', order: 1 },
            ],
          },
        });
      });

      test('Limit result to 1 contentItem sorted in reverse order, it returns the first contentItem', async () => {
        expect.assertions(1);

        const sortedLimitQuery = `{
          contentItemsByIds(
            ids: ["home_section", "main_section"],
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
            contentItemsByIds: [{ id: 'main_section', order: 2 }],
          },
        });
      });

      test('Skip the first item whilst sorted in reverse order, it returns contentItems without the skipped item.', async () => {
        expect.assertions(1);

        const sortedSkipQuery = `{
          contentItemsByIds(
            ids: ["home_section", "main_section"],
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
            contentItemsByIds: [{ id: 'home_section', order: 1 }],
          },
        });
      });

      test('Skip all items, it returns an empty array.', async () => {
        expect.assertions(1);

        const skipQuery = `{
          contentItemsByIds(
            ids: ["home_section", "main_section"],
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
            contentItemsByIds: [],
          },
        });
      });
    });

    describe('And searching by groupIds', () => {
      test('With a single groupId, it returns contentItems matching the groupId.', async () => {
        expect.assertions(1);

        const singleIdQuery = `{
          contentItems(filter: { AND: { groupId: "contentItems_test" } }) {
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
          contentItems(filter: {
            OR: [
              { groupId: "contentItems_test" },
              { groupId: "fireman_test" }
            ]
          })
          {
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
            filter: {
              OR: [
                { groupId: "contentItems_test" },
                { groupId: "fireman_test" }
              ]
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
            filter: {
              OR: [
                { groupId: "contentItems_test" },
                { groupId: "fireman_test" }
              ]
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
            filter: {
              OR: [
                { groupId: "contentItems_test" },
                { groupId: "fireman_test" }
              ]
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
            filter: {
              OR: [
                { groupId: "contentItems_test" },
                { groupId: "fireman_test" }
              ]
            },
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

    describe('And searching by filter', () => {
      test('With a single field, it returns contentItems that contain the field queried by.', async () => {
        expect.assertions(1);

        const singleIdQuery = `{
          contentItems(filter: { AND: { groupId: "contentItems_test" } }) {
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

      // TODO: We should think about merging the AND & OR tests together and do
      // multiple asserts. Need to structure this more cleanly.
      // NOTE: TESTING -> filter: OR usage below.
      // , it returns contentItems that contain the fields specified.
      test('[Filter] OR - With multiple fields of the same type', async () => {
        expect.assertions(1);

        const multiIdQuery = `{
          contentItems(filter: {
            OR: [
              { groupId: "contentItems_test" },
              { groupId: "fireman_test" }
            ]
          })
          {
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

      test('[Filter] OR - Sorted in reverse order.', async () => {
        expect.assertions(1);

        const sortQuery = `{
          contentItems(
            filter: {
              OR: [
                { groupId: "contentItems_test" },
                { order: 3, temperature: 345.5 }
              ]
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

      test('[Filter] OR - Limit result to 1 contentItem sorted in reverse order', async () => {
        expect.assertions(1);

        const sortedLimitQuery = `{
          contentItems(
            filter: {
              OR: [
                { groupId: "contentItems_test" },
                { temperature: 345.5 }
              ]
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

      test('[Filter] OR - Skip the first item whilst sorted in reverse order.', async () => {
        expect.assertions(1);

        const sortedSkipQuery = `{
          contentItems(
            filter: {
              OR: [
                { groupId: "contentItems_test" },
                { temperature: 345.5 }
              ]
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

      test('[Filter] OR - Skip all items, it returns an empty array.', async () => {
        expect.assertions(1);

        const skipQuery = `{
          contentItems(
            filter: {
              OR: [
                { groupId: "contentItems_test" },
                { groupId: "fireman_test" }
              ]
            },
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

      // TODO: Think about merging the tests for AND & OR under same tests.
      // e.g - make each test do 2 or more asserts?
      // NOTE: TESTING -> filter: AND usage below.
      test('[Filter] AND - With a single field, it returns contentItems matching the field queried.', async () => {
        expect.assertions(1);

        const singleIdQuery = `{
          contentItems(
            filter: {
              AND: {
                 test: "I am a ContentItem!"
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

      test('[Filter] AND - With multiple fields, it returns only the contentItems that match all fields specified.', async () => {
        expect.assertions(1);

        const multiIdQuery = `{
          contentItems(
            filter: {
              AND: {
                test: "I am a ContentItem!",
                groupId: "contentItems_test"
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

      test('[Filter] AND - Sorted in reverse order, it returns contentItems in reverse order.', async () => {
        expect.assertions(1);

        const sortQuery = `{
          contentItems(
            filter: {
              AND: {
                 groupId: "contentItems_test"
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

      test('[Filter] AND - Limit result to 1 contentItem sorted in reverse order, it returns the first contentItem', async () => {
        expect.assertions(1);

        const sortedLimitQuery = `{
          contentItems(
            filter: {
              AND: {
                 groupId: "contentItems_test"
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

      test('[Filter] AND - Skip the first item whilst sorted in reverse order.', async () => {
        expect.assertions(1);

        const sortedSkipQuery = `{
          contentItems(
            filter: {
              AND: {
                 groupId: "contentItems_test"
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

      test('[Filter] AND - Skip all items, it returns an empty array.', async () => {
        expect.assertions(1);

        const skipQuery = `{
          contentItems(
            filter: {
              AND: {
                 groupId: "contentItems_test"
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
          contentItemsByIds(ids: ["i_dont_exist", "i_dont_exist2"] )
          {
            id
            order
          }
        }`;

      const contentItems = await graphql(schema, idsQuery);
      expect(contentItems).toEqual({
        data: {
          contentItemsByIds: [],
        },
      });
    });

    test('And searching by groupIds, it returns an empty array.', async () => {
      expect.assertions(1);

      const groupIdsQuery = `{
          contentItemsByGroupId(groupId: "i_dont_exist")
          {
            id
            groupId,
            order
          }
        }`;

      const contentItems = await graphql(schema, groupIdsQuery);
      expect(contentItems).toEqual({
        data: {
          contentItemsByGroupId: [],
        },
      });
    });

    test('And searching by filter, it returns an empty array.', async () => {
      expect.assertions(1);

      const fieldMatcherQuery = `{
          contentItems(filter: {
            AND: { temperature: 5.0 }
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
