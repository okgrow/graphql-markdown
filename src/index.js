// Import these two es7 features until we drop Node 4 support
import 'core-js/modules/es7.object.entries'; // eslint-disable-line

import runGraphqlMarkdown from './markdown-content';
import { find, insert, findOne, dataStore } from './database';

export { find, insert, findOne, dataStore, runGraphqlMarkdown };
