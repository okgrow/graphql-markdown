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

// TODO: Wrap contentItem in describes & add more tests
test('contentItem(id: ID!) ', async () => {
  expect.assertions(1);
  const query = `{
    contentItem(id: "home_section") {
      id
      groupId
      content
    }
  }`;

  const result = await graphql(schema, query);
  const { id, groupId, content } = EXPECTED_RESULT_1;
  expect(result).toEqual({ data: { contentItem: { id, groupId, content } } });
});

// TODO: Wrap contentItems in describes & add more tests
test('contentItems(query: ContentItemsQuery!, pagination: Pagination): [ContentItem!]', async () => {
  expect.assertions(2);
  const singleIdQuery = `{
    contentItems(query: { ids: ["home_section"] }) {
      id
      groupId
    }
  }`;

  const multiIdQuery = `{
    contentItems(query: { ids: ["home_section", "main_section"] }) {
      id
      groupId
    }
  }`;

  // Test returning a single contentItem
  const singleContentItem = await graphql(schema, singleIdQuery);
  expect(singleContentItem).toEqual({
    data: {
      contentItems: [{ id: 'home_section', groupId: 'contentItems_test' }],
    },
  });

  // Test returning multiple contentItems
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
