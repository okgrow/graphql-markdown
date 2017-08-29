import { mapContentItems } from '../helpers';

// TODO: Think of a better name then mapper & mapFunc. Name is temp
/**
 * An HOF that provides the ability to format a document in any desired shape. By default if no mapFunc is provided, the item will be formatted to match the gql ContentItem typeDef.
 * @param {Function} mapFunc - Formats the item in our desired shape.
 * @param {Object} item - The .md document stored in the db that we wish to format.
 * @returns {Function} The function that will format the object in our desired shape.
 */
// prettier-ignore
const mapper = (mapFunc, item) => (
  mapFunc ? mapFunc(item) : mapContentItems(item)
);

/**
 * Inserts a document into `nedb`.
 * @param {Object} param
 * @param {Object} param.db - The `nedb` instance to insert the document into.
 * @param {Object} param.docToInsert - The document to insert into `nedb`.
 * @returns {Promise} Returns the new doc that is inserted, else error.
 */
export const insert = ({ db, docToInsert }) =>
  new Promise((resolve, reject) => {
    db.insert(docToInsert, (err, newDoc) => {
      if (err) {
        reject(err);
      } else {
        resolve(newDoc);
      }
    });
  });

/**
 * Find specific documents stored in `nedb`.
 * @param {Object} param
 * @param {Object} param.db - The `nedb` instance to query against.
 * @param {Object} param.query - The query for finding the stored document.
 * @param {Object} param.sortOptions - Sort on a field in a specific order
 * @param {number} param.skip - Number of documents to skip.
 * @param {number} param.limit - Number of documents to return.
 * @param {Function} param.mapFunc - Function to format the document into your desired format.
 * @returns {Promise} Returns an Array of the document(s) queried for.
 */
export const find = ({ db, query, sortOptions, skip, limit, mapFunc }) =>
  new Promise((resolve, reject) => {
    db
      .find(query)
      .projection({
        _id: 0,
        markdown: 0,
        assetDir: 0,
      })
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .exec((err, docs) => {
        if (err) {
          reject(err);
        } else {
          resolve(docs.map(item => mapper(mapFunc, item)));
        }
      });
  });

/**
 * Find a single document stored in `nedb`.
 * @param {Object} param
 * @param {Object} param.db - The `nedb` instance to query against.
 * @param {Object} param.query - The query for finding the stored document.
 * @param {Function} param.mapFunc - Function to format the document into your desired format.
 * @returns {Promise} Returns the document queried for.
 */
export const findOne = ({ db, query, mapFunc }) =>
  new Promise((resolve, reject) => {
    db.findOne(
      query,
      {
        _id: 0,
        markdown: 0,
        assetDir: 0,
      },
      (err, contentItem) => {
        if (err) {
          reject(err);
        } else {
          resolve(contentItem ? mapper(mapFunc, contentItem) : null);
        }
      },
    );
  });
