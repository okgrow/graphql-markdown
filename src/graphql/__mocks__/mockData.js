export const CONTENT_ITEM_1 = {
  _id: 'contentItem_test_1',
  id: 'home_section',
  groupId: 'contentItems_test',
  html:
    '<h1 id="welcome-to-this-super-example-">Welcome to this super example!</h1>\n',
  test: 'I am a ContentItem!',
  isContentItem: true,
  order: 1,
};

export const CONTENT_ITEM_2 = {
  _id: 'contentItem_test_2',
  id: 'main_section',
  html: '<p>Hello world!\nThanks for dropping by to say hello! 🔥🔥🔥</p>\n',
  groupId: 'contentItems_test',
  isContentItem: false,
  order: 2,
};

export const EXPECTED_RESULT_1 = {
  id: 'home_section',
  groupId: 'contentItems_test',
  content:
    '<h1 id="welcome-to-this-super-example-">Welcome to this super example!</h1>\n',
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

export const EXPECTED_RESULT_2 = {
  id: 'main_section',
  groupId: 'contentItems_test',
  content: '<p>Hello world!\nThanks for dropping by to say hello! 🔥🔥🔥</p>\n',
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
