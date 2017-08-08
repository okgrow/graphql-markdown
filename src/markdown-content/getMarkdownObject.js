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
  // console.log(newHtml);
  const result = {
    html: newHtml,
    groupId: defaultGroupId, // NOTE: Must be before ...data, so default can be overwritten
    ...data,
    assetDir,
    markdown: content,
    // TODO: This shouldn't be part of the package
    // In the package we could provide a way to pass functions that add this functionality?
    // NOTE: Ensure that tags field always exists for blogPosts even if writer forgets
    ...(((data && data.groupId) || defaultGroupId) === 'posts'
      ? { tags: tagsToArray(data.tags) }
      : null),
    images,
  };

  return result;
};

export default getMarkdownObject;
