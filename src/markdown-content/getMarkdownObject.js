import matter from 'gray-matter';
import promisify from 'es6-promisify';

import { getAssetDir, getListOfRelativeImageFiles } from '../server-helpers';
import { getGroupId, tagsToArray, replaceHtmlImageSrc } from '../helpers';

// TODO: Revert to using this in our node.js package
const readFilePromise = promisify(require('fs').readFile);
const markedPromise = promisify(require('marked'));

const getMarkdownObject = async ({ filename, contentRoot, imageMap }) => {
  const assetDir = getAssetDir({ filename, contentRoot });

  const fileContents = await readFilePromise(filename, 'utf8');

  const { content, data } = matter(fileContents);
  const html = await markedPromise(content);

  const images = getListOfRelativeImageFiles(contentRoot, assetDir);

  // TODO: Deprecate this in future ?
  // If we do then we must state every .md file must provide a groupId?
  const defaultGroupId = getGroupId(assetDir);

  if (!data || !data.id) {
    console.warn(
      '[getMarkdownObject] id is missing from your MD file: ',
      assetDir,
    );
  }

  const newHtml = replaceHtmlImageSrc({ images, imageMap, html });

  return {
    html: newHtml,
    groupId: defaultGroupId, // NOTE: Must be before ...data, so default can be overwritten
    ...data,
    assetDir,
    markdown: content,
    ...((data && data.groupId)
      ? { tags: tagsToArray(data.tags) }
      : null),
    images,
  };
};

export default getMarkdownObject;
