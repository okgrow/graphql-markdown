# Simple GraphiQL Example

## Requirements

- You must have Node version 8+ installed.
- You have already run `npm install` on the main package and the `/dist` files have been generated.

## Quick Start

1. `npm install`
1. `npm start`
1. Once the server has started visit http://localhost:4000/graphql
1. Now you can query the markdown with GraphQL!

## Example Queries

Below are some example queries demonstrating the packages capabilities. Give them a try in GraphiQL!

Any query that returns a List also supports a basic form of pagination via the ability to `sort`, `skip`, and `limit` the results returned from a query.

#### Query by id(s)

```graphql
{
  # Simplified helper query to search for a single ContentItem.
  # Returns a ContentItem, else null if not found.
  contentItemById(id: "graphqlIntro") {
    id
    groupId
    html
    title
    tags
  }

  # Simplified helper query to search for ContentItems by ids.
  # Returns a List of contentItems, else empty List if none found.
  # Supports Pagination (sort, skip, limit).
  contentItemsByIds(ids: ["graphqlIntro", "homePage"] ) {
    id
    groupId
  }
}
```

#### Query by groupId

```graphql
{
  # Simplified helper query to search for ContentItems by groupId.
  # Return a List of contentItems, else empty List if none found.
  # Supports Pagination (sort, skip, limit).
  contentItemsByGroupId(groupId: "simple-example") {
    id
    groupId
  }
}
```

#### Query by any field!

The `contentItems` query allows you to query on any field with a `filter` which uses the logical `AND`, `OR` conditions.

```graphql
{
  # Full powered query to search for ContentItems by any field!!!
  # Supports searching by logical AND, OR conditions on any fields.
  # Return a List of contentItems, else empty List if none found.
  # Supports Pagination (sort, skip, limit).
  contentItems(
    filter: {
      OR: [
        { order: 2 },
        { id: "graphqlIntro" }
      ]
    })
  {
    id
    order
    groupId
  }
}
```

#### Sort, skip or limit query results.

Try changing the below example and see what happens. Here are a few hints:

- Set `skip` to 1 and `limit` to 0.
- Set `skip` to 0 and `limit` to 1.
- Swap `DESCENDING` with `ASCENDING`.
- Replace `AND: { groupId: "simple-example" }` with `OR: [{ order: 2 }, { order: 1 }]`.
- Remove `skip` and `limit` all together.

```graphql
{
  contentItems(
    filter: {
      AND: {
        groupId: "simple-example"
      }
    },
    pagination: {
      sort: {
        sortBy: "order",
        orderBy: DESCENDING
      },
      skip: 0,
      limit: 0
    })
  {
    id
    groupId
    html
    title
    description
    tags
  }
}
```
