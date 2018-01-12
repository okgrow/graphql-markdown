import cloneDeep from 'lodash.clonedeep';

import {
  checkListContainsOnlyOneType,
  checkForGqlTypeMissmatchBetweenMdFiles,
} from './errorCheckers';

// Infer the GraphQL Type from the js-yaml Type.
// @returns {String} - The GraphQL Type e.g -> Float
// example input -> { "kind": "scalar", "tag": "tag:yaml.org,2002:float" }
const detectGraphQLType = ({ kind, tag, relativeFileName }) => {
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
            `Unsupported GraphQL Scalar Type (kind: ${kind}, tag: ${tag}) detected in your .md file. -> ${relativeFileName}`,
          );
        }
      }
    }
    // NOTE: Uncomment if we decide to support custom GQL Object Type
    // case 'mapping':
    //   return 'Object';
    default: {
      // TODO: Refactor/DRY & add more details like filename, field
      throw new Error(
        `Unsupported GraphQL Scalar Type (kind: ${kind}, tag: ${tag}) detected in your .md files. -> ${relativeFileName}`,
      );
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
  relativeFileName,
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

      let gqlType = detectGraphQLType({ kind, tag, relativeFileName });
      let gqlScalarType = gqlType;
      // TODO: Decide if we allow an empty array as valid in front-matter.
      // e.g - tags: []
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
      gqlTypesInMd[currKey].listTypes.push(
        detectGraphQLType({ kind, tag, relativeFileName }),
      );
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
        throw new Error(`The ${
          missmatchDetails.fieldWithMisMatch
        } field has been detected to contain differing GraphQL Types. Fields must use the same GraphQL type across all .md files. Details are below.\n
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

// TODO: Improve comments & variable names
/** Creates a new body string, by inserting the fieldDefs in the correct location.
 *  @param {string} body - Existing body value from a graphql files AST.
 *  @param {string} typeDefName - Name of the type def to modify.
 *  @param {string} newFieldDefsStr - field defs to add to existing type Def.
 *  @returns {string} - A new body string containing the inserted fieldDefs
 */
const updateBodyStr = ({ body, typeDefName, fieldDefsStr }) => {
  // Indexes for the points where we inject our new string into.
  const startSearchIndex = body.indexOf(`${typeDefName} {`);
  const startInsertIndex = body.indexOf('}', startSearchIndex);

  // Contents before and after our insertion points
  const beforeStr = body.slice(0, startInsertIndex);
  const afterStr = body.slice(startInsertIndex);

  return `${beforeStr}${fieldDefsStr}${afterStr}`;
};

/** Find the location of the Type Defintion we wish to modify
 *  in the GraphQL TypeDefs AST.
 *  @param {Object} typeDefsAst - GraphQL TypeDefs AST to search.
 *  @param {string} typeDefName - Name of the typeDef to search for
 *  @returns {number} - Index for the TypeDefs location in the definitons array.
 */
const getTypeDefIndex = ({ typeDefsAst, typeDefName }) =>
  typeDefsAst.definitions.findIndex(item => item.name.value === typeDefName);

/** Add new field definitions to an existing GraphQL TypeDefs AST.
 *  NOTE: This approach can be improved & abstracted further.
 *  Refactor to be DRY whilst accounting for perf.
 *  @param {Object} originalTypeDefs - GraphQL TypeDefs AST to modify.
 *  @param {Object} fieldDefsToAdd - Contains all the new fieldDefs to add.
 *  @returns {Object} - GraphQL AST containing the fieldsDefs we wished to add.
 */
export const createGraphqlMarkdownTypeDefs = ({
  originalTypeDefs,
  fieldDefsToAdd,
}) => {
  // Create a copy with no references to original.
  // As we intend to mutate the TypeDefsAst directly.
  const typeDefsAst = cloneDeep(originalTypeDefs);

  // Find the indexes for the TypeDefs we will modify.
  const typeContentItemIndex = getTypeDefIndex({
    typeDefsAst: originalTypeDefs,
    typeDefName: 'ContentItem',
  });
  const inputTypeFieldsIndex = getTypeDefIndex({
    typeDefsAst: originalTypeDefs,
    typeDefName: 'Fields',
  });

  let newFieldDefsStr = '';

  // Add the new Field Defs to the typeDefsAst
  Object.keys(fieldDefsToAdd).forEach(field => {
    const isProtectedField =
      field === 'id' || field === 'groupId' || field === 'html';

    // Do not allow fields from .md front-matter to replace
    // the existing AST for any of our reserved fields.
    if (!isProtectedField) {
      // Add the field def to our type ContentItem
      typeDefsAst.definitions[typeContentItemIndex].fields.push(
        fieldDefsToAdd[field].ast,
      );

      // Add the field def to our type input Fields
      typeDefsAst.definitions[inputTypeFieldsIndex].fields.push(
        fieldDefsToAdd[field].ast,
      );

      // Construct a string version of the fieldDefs we have added.
      newFieldDefsStr += `  ${field}: ${fieldDefsToAdd[field].gqlType}\n`;
    }
  });

  // Modify the TypeDefs ASTs source body string to match the new fields we inserted.
  const gqlStr = originalTypeDefs.loc.source.body;

  // Insert the field defs into type ContentItem
  const tempBody = updateBodyStr({
    body: gqlStr,
    typeDefName: 'ContentItem',
    fieldDefsStr: newFieldDefsStr,
  });

  // Insert the field defs into input Fields
  const newBody = updateBodyStr({
    body: tempBody,
    typeDefName: 'Fields',
    fieldDefsStr: newFieldDefsStr,
  });

  // Replace the old source body with our own version which
  // contains the new fields defs taken from the .md front-matter.
  typeDefsAst.loc.source.body = newBody;
  return typeDefsAst;
};
