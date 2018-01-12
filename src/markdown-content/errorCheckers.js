// Check that the array (GQL List) declared in the front-matter of a .md file
// contains a single scalar type.
// Throws an error if more then one scalar type detected in the List
// @returns {Boolean} - true on success, throws error on false.
export const checkListContainsOnlyOneType = ({
  currKey,
  result,
  listTypes,
  gqlScalarType,
}) => {
  const errorDetails = {
    [currKey]: result,
    typesInList: listTypes,
  };
  // Ensure the list (array) contents are of the same type
  const containsOneType = listTypes.every(type => gqlScalarType === type);

  if (!containsOneType) {
    throw new Error(
      `A GraphQL List in your .md file has been detected to contain more then one scalar type. Details are below.\n${JSON.stringify(
        errorDetails,
        null,
        4,
      )}`,
    );
  }

  return containsOneType;
};

// The front-matter fields with the same fieldname must be the same scalar type
// across all .md files. This is a current design limitation due to inserting
// all fields into our single ContentItems type.
// On miss match we return the details of the conflict,
// else on no missmatch being detected return undefined
// @returns {(Object|undefined)}
export const checkForGqlTypeMissmatchBetweenMdFiles = ({
  gqlTypesInMd,
  lastFileName,
  relativeFileName,
  contentItemGqlFields,
}) => {
  let missMatchDetails = {};

  const isMissmatch = !Object.keys(gqlTypesInMd).every(fieldName => {
    if (
      !contentItemGqlFields[fieldName] ||
      contentItemGqlFields[fieldName].gqlType ===
        gqlTypesInMd[fieldName].gqlType
    ) {
      return true;
    }
    missMatchDetails = {
      fieldWithMisMatch: fieldName,
      [lastFileName]: contentItemGqlFields[fieldName].gqlType,
      [relativeFileName]: gqlTypesInMd[fieldName].gqlType,
    };
    return false;
  });

  return isMissmatch ? missMatchDetails : undefined;
};
