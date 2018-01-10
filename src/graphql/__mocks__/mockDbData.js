export const CONTENT_ITEM_1 = {
  _id: 'contentItem_test_1',
  id: 'home_section',
  groupId: 'contentItems_test',
  html:
    '<h1 id="welcome-to-this-super-example-">Welcome to this super example!</h1>\n',
  test: 'I am a ContentItem!',
  order: 1,
  temperature: 20.8,
  isContentItem: true,
};

export const CONTENT_ITEM_2 = {
  _id: 'contentItem_test_2',
  id: 'main_section',
  groupId: 'contentItems_test',
  html: '<p>Hello world!\nThanks for dropping by to say hello! 🔥🔥🔥</p>\n',
  order: 2,
  temperature: 30.5,
  isContentItem: false,
};

export const CONTENT_ITEM_3 = {
  _id: 'contentItem_test_3',
  id: 'fire_man',
  groupId: 'fireman_test',
  html: '<p>🚒🔥🔥🔥🚒🔥🔥🔥🚒</p>\n',
  order: 3,
  temperature: 345.5,
  isContentItem: false,
};

export const EXPECTED_RESULT_1 = {
  id: 'home_section',
  groupId: 'contentItems_test',
  html:
    '<h1 id="welcome-to-this-super-example-">Welcome to this super example!</h1>\n',
  test: 'I am a ContentItem!',
  order: 1,
  temperature: 20.8,
  isContentItem: true,
};

export const EXPECTED_RESULT_2 = {
  id: 'main_section',
  groupId: 'contentItems_test',
  html: '<p>Hello world!\nThanks for dropping by to say hello! 🔥🔥🔥</p>\n',
  order: 2,
  temperature: 30.5,
  isContentItem: false,
};

export const EXPECTED_RESULT_3 = {
  _id: 'contentItem_test_3',
  id: 'fire_man',
  groupId: 'fireman_test',
  html: '<p>🚒🔥🔥🔥🚒🔥🔥🔥🚒</p>\n',
  order: 3,
  temperature: 345.5,
  isContentItem: false,
};
