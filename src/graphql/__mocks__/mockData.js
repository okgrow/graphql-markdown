export const CONTENT_ITEM_1 = {
  _id: 'contentItem_test_1',
  id: 'home_section',
  html:
    '<h1 id="welcome-to-this-super-example-">Welcome to this super example!</h1>\n',
  test: 'I am a ContentItem!',
  order: 1,
  groupId: 'contentItems_test',
  isContentItem: true,
};

export const CONTENT_ITEM_2 = {
  _id: 'contentItem_test_2',
  id: 'main_section',
  html: '<p>Hello world!\nThanks for dropping by to say hello! 🔥🔥🔥</p>\n',
  order: 2,
  groupId: 'contentItems_test',
  isContentItem: false,
};

export const EXPECTED_RESULT_1 = {
  id: 'home_section',
  html:
    '<h1 id="welcome-to-this-super-example-">Welcome to this super example!</h1>\n',
  test: 'I am a ContentItem!',
  order: 1,
  groupId: 'contentItems_test',
  isContentItem: true,
};

export const EXPECTED_RESULT_2 = {
  id: 'main_section',
  html: '<p>Hello world!\nThanks for dropping by to say hello! 🔥🔥🔥</p>\n',
  order: 2,
  groupId: 'contentItems_test',
  isContentItem: false,
};
