import Datastore from 'nedb';

export { find, insert, findOne } from './db-helpers';

export const dataStore = new Datastore();
