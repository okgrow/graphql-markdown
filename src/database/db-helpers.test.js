import { dataStore, find, insert, findOne } from './index';

test('inserts document into our nedb dataStore', async () => {
  expect.assertions(1);
  const docToInsert = {
    _id: 'insert_test',
    test: 'hello world!',
    name: 'Happy',
    isFun: true,
  };
  const testInsert = await insert({ db: dataStore, docToInsert });
  expect(testInsert).toEqual(docToInsert);
});

test('insert fails when passed invalid params', async () => {
  expect.assertions(1);
  const docToInsert = { _id: 'fail_insert_test' };
  try {
    await insert({ dataStore, docToInsert });
  } catch (error) {
    expect(error.message).toEqual("Cannot read property 'insert' of undefined");
  }
});

test('findOne resolves & finds the correct data', async () => {
  expect.assertions(2);
  const docToInsert = {
    _id: '7nS4breq9PaGIczE',
    id: 'findOne_test',
    groupId: 'tests',
  };
  const expectedResult = {
    id: 'findOne_test',
    groupId: 'tests',
    content: undefined,
    metaData: [
      {
        name: 'id',
        value: 'findOne_test',
      },
      {
        name: 'groupId',
        value: 'tests',
      },
    ],
  };

  const testInsert = await insert({ db: dataStore, docToInsert });
  expect(testInsert).toEqual(docToInsert);

  const query = { id: 'findOne_test' };
  const findOneTest = await findOne({ db: dataStore, query });
  expect(findOneTest).toEqual(expectedResult);
});

test('findOne fails when passed invalid params', async () => {
  expect.assertions(1);
  const query = { id: 'fail_findOne_test' };
  try {
    await insert({ dataStore, query });
  } catch (error) {
    expect(error.message).toEqual("Cannot read property 'insert' of undefined");
  }
});

test('find resolves & finds the correct data', async () => {
  expect.assertions(2);
  const docToInsert = {
    _id: '98nS4breIdsczE',
    id: 'find_test',
    groupId: 'tests',
  };
  const expectedResult = [
    {
      id: 'find_test',
      groupId: 'tests',
      content: undefined,
      metaData: [
        {
          name: 'id',
          value: 'find_test',
        },
        {
          name: 'groupId',
          value: 'tests',
        },
      ],
    },
  ];

  const testInsert = await insert({ db: dataStore, docToInsert });
  expect(testInsert).toEqual(docToInsert);

  const query = { id: 'find_test' };
  const findTest = await find({ db: dataStore, query });
  expect(findTest).toEqual(expectedResult);
});

test('find fails when passed invalid params', async () => {
  expect.assertions(1);
  const query = { id: 'fail_find_test' };
  try {
    await insert({ dataStore, query });
  } catch (error) {
    expect(error.message).toEqual("Cannot read property 'insert' of undefined");
  }
});
