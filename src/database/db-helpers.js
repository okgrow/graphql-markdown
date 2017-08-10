import { mapContentItems } from '../helpers';

// TODO: Think of a better name then mapper & mapFunc. Name is temp
// prettier-ignore
const mapper = (mapFunc, item) => (
  mapFunc ? mapFunc(item) : mapContentItems(item)
);

// TODO: Add Docs
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

// TODO: Add Docs
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

// TODO: Add Docs
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
