import Datastore from 'nedb';

import { mapContentItems } from '../helpers';

// TODO: Move datastore along with promises to own file.

export const dataStore = new Datastore();

// TODO: Think of a better name then mapper & mapFunc. Name is temp
// prettier-ignore
const mapper = (mapFunc, item) => (
  mapFunc ? mapFunc(item) : mapContentItems(item)
);

// TODO: Move all promise wrappers to own file.
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
