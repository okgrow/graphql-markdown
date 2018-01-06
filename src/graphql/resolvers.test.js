import { graphql } from 'graphql';
import { makeExecutableSchema } from 'graphql-tools';
import { dataStore, insert } from '../database';
import contentItemResolvers from './resolvers';
import contentItemTypeDefs from './typeDefs.graphql';

import {
  CONTENT_ITEM_1,
  CONTENT_ITEM_2,
  EXPECTED_RESULT_1,
} from './__mocks__/mockData';

const schema = makeExecutableSchema({
  typeDefs: contentItemTypeDefs,
  resolvers: contentItemResolvers,
});

beforeAll(async () => {
  await insert({ db: dataStore, docToInsert: CONTENT_ITEM_1 });
  await insert({ db: dataStore, docToInsert: CONTENT_ITEM_2 });
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

  describe('When searching for an non-existing contentItem', () => {
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

        // Test returning a single contentItem
        const singleContentItem = await graphql(schema, singleIdQuery);
        expect(singleContentItem).toEqual({
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

        const multiContentItem = await graphql(schema, multiIdQuery);
        expect(multiContentItem).toEqual({
          data: {
            contentItems: [
              { id: 'home_section', groupId: 'contentItems_test' },
              { id: 'main_section', groupId: 'contentItems_test' },
            ],
          },
        });
      });
      // TODO: Pagination,
      // test edge/odd case with skip/limit where
      // outcome would mean no results are returned. e.g - skip 5 but only 2 documents exist.
    });

    // TODO: Tests for Querying by groupIds.
    // {
    //   contentItems(query: { groupIds: ["simple-example"] }) {
    //     id
    //     groupId
    //   }
    // }

    // TODO: Tests for Querying by fieldMatcher.
    // {
    //   contentItems(
    //     query: { fieldMatcher: { fields: [{ name: "type", value: "page" }] } },
    //   {
    //     id
    //     groupId
    //     type
    //   }
    // }
    //
    // TODO: pagination (sort, skip, limit)
  });

  describe('When searching for non-existing contentItem', () => {
    // TODO: query by ids
    // TODO: query by groupIds
    // TODO: query by fieldMatcher
    // TODO: pagination (sort, skip, limit)
  });
});
