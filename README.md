# Markdown Graphql Server

[![Build Status](ADD_SHIELDS.IO_URL)](ADD_URL)
[![Coverage Status](ADD_SHIELDS.IO_URL)](ADD_URL)
[![NPM Version](ADD_SHIELDS.IO_URL)](ADD_URL)
[![NPM Downloads](ADD_SHIELDS.IO_URL)](ADD_URL)
[![Dependencies](ADD_SHIELDS.IO_URL)]()
[![Dev Dependencies](ADD_SHIELDS.IO_URL)]()

> Write markdown, converted to html, query via Graphql. 🔥

## Quick Start
```sh
# With npm
npm install --save xx-xx-xx
# With Yarn
yarn add xx-xx-xx
```
Now you can import the `typeDefs` & `resolvers` to add to your graphql schema in order to query the markdown content.
```js
// gqlSchema.js
import { makeExecutableSchema } from 'graphql-tools';
import { contentItemTypeDefs, contentItemResolvers } from 'xx-xx-xx';

const schema = makeExecutableSchema({
  typeDefs: contentItemTypeDefs,
  resolvers: contentItemResolvers
});

export default schema;
```

Next you will need to setup the process to load the markdown so we can query it via GraphQL.
```js
// server/index.js
import { loadMarkdownIntoDb } from 'xx-xx-xx';

const isProduction = process.env.NODE_ENV === 'production';

const formatImagePath = (pathOfImage) => {
  const fileNameIndex = pathOfImage.lastIndexOf('/');
  const fileName = pathOfImage.slice(fileNameIndex + 1, pathOfImage.lastIndexOf('.'));
  return `https://www.wonderwebsite.com/images/${fileName}`;
};

// Create our options for loading the markdown into our in memory db.
// NOTE: By default images are converted to base64 if no function is passed.
// You shouldn't use base64 in production as it increases the size of images.
const options = {
  contentRoot: `fullpath/to/content`,
  imageFunc: isProduction ? formatImagePath : null,
};

// Example 1 - Promise

// Find all markdown files, process and load them into memory.
loadMarkdownIntoDb(options).then(itemCount => {
  console.log(`DB ready!\n${itemCount} ContentItems loaded!`);
  // Import and start the rest of your app & GraphQL Server.
  import('../startup/server');
}).catch(error => {
  console.error('[loadMarkdownIntoDb]', error);
});

// EXAMPLE 2 - async/await
(async () => {
  try {
    // Find all markdown files, process and load them into memory.
    const itemCount = await loadMarkdownIntoDb(options);
    console.log(`DB ready!\n${itemCount} ContentItems loaded!`);

    // Import and start the rest of your app & GraphQL Server.
    import('../imports/startup/server');

  } catch (error) {
    console.error('[loadMarkdownIntoDb]', error);
  }
})();
```


## Markdown files

A markdown file contains two distinct sections, the MetaData section and the Markdown section.

```
---
MetaData Section
---

Markdown Section
```

#### MetaData section

The MetaData section contains `key`:`value` pairs. Every Markdown file is required to contain a MetaData section and must contain an `id` and an `groupId` key-value pair.

```md
---
id: myFirstMdFile
groupId: homePage
---
```

#### Markdown section

The Markdown section is placed after the MetaData section and contains your markdown content. The markdown content will be converted into valid HTML when we process all markdown files and store them in memory.
```md
# My First Markdown file

Hello World!
```

##### Putting it all together

```md
---
id: home-content-section-1
groupId: homePage
type: pageContent
title: Wonder Website
description: Wonder Website - Home Page
date: 2017-12-25
---

# Welcome to this wonderful website!

Hello world! Thanks for dropping by to say hello.
```

## Maintainers

This is an open source package. We hope to deal with contributions in a timely manner, but that's not always the case. The main maintainers are:

[@okgrow](https://github.com/okgrow)

Feel free to ping if there are open issues or pull requests which are taking a while to be dealt with!

## Contributing

Issues and Pull Requests are always welcome.

Please read our [contribution guidelines](https://github.com/okgrow/guides/blob/master/open-source/contributing.md).

If you are interested in becoming a maintainer, get in touch with us by sending an email or opening an issue. You should already have code merged into the project. Active contributors are encouraged to get in touch.

Please note that all interactions in @okgrow's repos should follow our [Code of Conduct](https://github.com/okgrow/guides/blob/master/open-source/CODE_OF_CONDUCT.md).

## License
Released under the [MIT license](https://github.com/okgrow/analytics/blob/master/License.md) © 2017 OK GROW!.
