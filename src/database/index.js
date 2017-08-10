import Datastore from 'nedb';

export { insert, find, findOne } from './db-helpers';

export const dataStore = new Datastore();
