import cloneDeep from 'lodash.clonedeep';

import {
  checkListContainsOnlyOneType,
  checkForGqlTypeMissmatchBetweenMdFiles,
} from './errorCheckers';

// Infer the GraphQL Type from the js-yaml Type.
// @returns {String} - The GraphQL Type e.g -> Float
// example input -> { "kind": "scalar", "tag": "tag:yaml.org,2002:float" }
const detectGraphQLType = ({ kind, tag }) => {
  switch (kind) {
    case 'sequence':
      return 'List';
    case 'scalar': {
      switch (tag) {
        case '?':
        case null:
          return 'String';
        case 'tag:yaml.org,2002:int':
          return 'Int';
        case 'tag:yaml.org,2002:bool':
          return 'Boolean';
        case 'tag:yaml.org,2002:float':
          return 'Float';
        // TODO: Uncomment once we decide to support Date in GQL
        // case 'tag:yaml.org,2002:timestamp':
        //   return 'Date';
        // case 'tag:yaml.org,2002:null':
        //   return 'null';
        default: {
          // TODO: Refactor/DRY & add more details like filename, field
          throw new Error(
            'Unsupported GraphQL Scalar Type detected in your .md files.',
            {
              kind,
              tag,
            },
          );
        }
      }
    }
    // NOTE: Uncomment if we decide to support custom GQL Object Type
    // case 'mapping':
    //   return 'Object';
    default: {
      // TODO: Refactor/DRY & add more details like filename, field
      throw new Error('Unsupported GraphQL Type detected in your .md files.', {
        kind,
        tag,
      });
    }
  }
};

// TODO: Potentially improve by Handling kind: 'NonNullType'
// Limited helper function to create the AST for the GQL Types that we support.
// @returns {Object} - The FieldDefinition
const createFieldType = ({ isList, gqlScalarType }) => {
  const namedType = {
    kind: 'NamedType',
    name: {
      kind: 'Name',
      value: gqlScalarType,
    },
  };
  const listType = {
    kind: 'ListType',
    type: namedType,
  };
  return isList ? listType : namedType;
};

// Creates a simplified GQL FieldDefinition AST
// @returns {Object} - The FieldDefinition
const createFieldDefinitionForGqlAst = ({
  fieldName,
  isList,
  gqlScalarType,
}) => ({
  kind: 'FieldDefinition',
  name: {
    kind: 'Name',
    value: fieldName,
  },
  arguments: [],
  type: createFieldType({ isList, gqlScalarType }),
  directives: [],
});

// TODO: Maybe add a check to ensure the id is unique? We can do this check without
// taking a perf hit as we are already looping through. use object as a hashtable
// if key is undefined we know that we know its unique
// NOTE: The 'js-yaml' pkg accepts a listener function (undocumented) with the
// following signature -> listener(eventType, state).
// We hook into the listener feature to infer the GraphQL Types from the front-matter.
// We store our results by mutating the function paramters directly.
// NOTE: Currently we are using the 'js-yaml' DEFAULT_SAFE_SCHEMA
// We attach this function for every .md file as its front-matter is being
// processed we map the field names to GraphQL Field definitions. e.g ->
// front-matter -> title: "My First Post" , GraphQL -> title: String
// The 3 paramters modified irectly are debug, stack, gqlTypesInMd.
// @returns {undefined}
export const gqlTypeListener = ({
  debug,
  stack,
  gqlTypesInMd,
  currKey,
  debugMode = false,
}) => (eventType, { position, result, tag, kind, line, lineStart, length }) => {
  const isStart = position === 1 && typeof tag === 'undefined';
  const isEnd = length === position;
  const data = {
    tag,
    kind,
    line,
    result,
    length,
    position,
    lineStart,
    eventType,
  };

  // Log all events when debug is turned on
  debugMode && debug.push(data); // eslint-disable-line

  // We don't need to record the first (open) & last (close) event.
  if (isStart || isEnd) return;

  if (eventType === 'open') {
    stack.push(data);
  } else if (eventType === 'close') {
    const openState = stack.pop(data);
    // When we are empty we have a base type and not an object or array.
    if (!stack.length) {
      // We know that we have the key (LHS) of key: value pair
      // e.g - title: My First Blog Post
      if (openState.position === openState.lineStart) {
        currKey = result;
        gqlTypesInMd[result] = { gqlType: '', listTypes: [], ast: {} };
        return;
      }

      let gqlType = detectGraphQLType({ kind, tag });
      let gqlScalarType = gqlType;
      const isList = gqlTypesInMd[currKey].listTypes.length;
      // When listTypes isn't empty we know we have a GQL List
      if (isList) {
        // TODO: clean up & DRY & refactor
        const index = gqlTypesInMd[currKey].listTypes.length - 1;
        gqlScalarType = gqlTypesInMd[currKey].listTypes[index];
        gqlType = `[${gqlScalarType}]`;
        // Throws an error if we detect more then one GQL Type in the List
        checkListContainsOnlyOneType({
          currKey,
          result,
          gqlScalarType,
          listTypes: gqlTypesInMd[currKey].listTypes,
        });
      }
      // TODO: clean up & DRY
      gqlTypesInMd[currKey].gqlType = gqlType;
      gqlTypesInMd[currKey].ast = createFieldDefinitionForGqlAst({
        fieldName: currKey,
        isList,
        gqlScalarType,
      });
    } else {
      gqlTypesInMd[currKey].listTypes.push(detectGraphQLType({ kind, tag }));
    }
  }
};

// Extracts the new gql fields for ContentItem from the contentItems.
// @returns {Object} - { contentItems, contentItemGqlFields }
// - The contentItems ready to be inserted into db,
// - The new gql fields for the ContentItem type.
export const processContentItems = (items, contentRoot) => {
  const { contentItems, contentItemGqlFields } = items.reduce(
    (
      { lastFileName, contentItems, contentItemGqlFields }, // accumulator
      { contentItem, gqlTypesInMd, filename }, // current
    ) => {
      const relativeFileName = filename.slice(contentRoot.length);
      const missmatchDetails = checkForGqlTypeMissmatchBetweenMdFiles({
        lastFileName,
        relativeFileName,
        contentItemGqlFields,
        gqlTypesInMd,
      });

      if (missmatchDetails) {
        throw new Error(`The ${missmatchDetails.fieldWithMisMatch} field has been detected to contain differing GraphQL Types. Fields must use the same GraphQL type across all .md files. Details are below.\n
        ${JSON.stringify(missmatchDetails, null, 4)}`);
      }

      return {
        contentItems: [...contentItems, contentItem],
        lastFileName: relativeFileName,
        contentItemGqlFields: { ...contentItemGqlFields, ...gqlTypesInMd },
      };
    },
    {
      contentItems: [],
      contentItemGqlFields: {},
      lastFileName: '',
    },
  );
  return { contentItems, contentItemGqlFields };
};

// Creates the TypeDefs for this package by creating a new TypeDefs AST containing
// the Type Definitions inferred from the front-matter section of our .md files.
// @returns {Object} - { graphqlMarkdownTypeDefs } - The packages TypeDefs
export const createGraphqlMarkdownTypeDefs = ({
  contentItemGqlFields,
  contentItemTypeDefs,
}) => {
  // Find where our type ContentItem is located in the definitions array.
  const contentItemIndex = contentItemTypeDefs.definitions.findIndex(
    item => item.name.value === 'ContentItem',
  );

  let newFieldDefsStr = '';
  const typeDefsAst = cloneDeep(contentItemTypeDefs);

  Object.keys(contentItemGqlFields).forEach(field => {
    const isID = field === 'id' || field === 'groupId';
    if (!isID) {
      // Add the new field def to our ContentItem type
      typeDefsAst.definitions[contentItemIndex].fields.push(
        contentItemGqlFields[field].ast,
      );
      // Store the new field def to be added to our ContentItem type
      newFieldDefsStr += `  ${field}: ${contentItemGqlFields[field].gqlType}\n`;
    }
  });

  // Modify the TypeDefs ASTs source body string to match the new fields we inserted.
  const gqlStr = contentItemTypeDefs.loc.source.body;
  // Indexes for where to split the source body in half
  const startSearchIndex = gqlStr.indexOf('ContentItem {');
  const startInsertIndex = gqlStr.indexOf('}', startSearchIndex);
  const beforeStr = gqlStr.slice(0, startInsertIndex);
  const afterStr = gqlStr.slice(startInsertIndex);

  // Replace the old source body with our own version which
  // contains the new fields defs taken from the .md front-matter.
  typeDefsAst.loc.source.body = `${beforeStr}${newFieldDefsStr}${afterStr}`;

  return { graphqlMarkdownTypeDefs: typeDefsAst };
};
