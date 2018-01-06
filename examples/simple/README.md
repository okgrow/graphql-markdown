# Simple Graphiql Example

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

### contentItem

```
{
  contentItem(id: "graphqlIntro") {
    id
    groupId
    html
    title
    tags
  }
}
```

### contentItems query

The `contentItems` query allows you to query by `ids`, `groupIds`, or `fieldMatcher`.
- `ids` will match against the `id` in your `.md` file. Every `.md` file must have an `id`.
- `groupIds` will match against the `groupId` in your `.md` file. Every `.md` file must have an `groupId`.
- `fieldMatcher` will match against any specific field that you have set in your `.md` file.

The `contentItems` query also supports a basic form of pagination via the ability to `sort`, `skip`, and `limit` the results returned from a query.

#### Query by ids

```
{
  contentItems(query: { ids: ["graphqlIntro", "homePage"] }) {
    id
    groupId
  }
}
```

#### Query by groupIds

```
{
  contentItems(query: { groupIds: ["simple-example"] }) {
    id
    groupId
  }
}
```

#### Query by fieldMatcher.

```
{
  contentItems(
    query: { fieldMatcher: { fields: [{ name: "type", value: "page" }] } },
  {
    id
    groupId
    type
  }
}
```

#### Sort, skip or limit query results.

Try changing the below example and see what happens. Here are a few hints:
- Set `skip` to 1 and `limit` to 0.
- Set `skip` to 0 and `limit` to 1.
- Swap `DESCENDING` with `ASCENDING`.
- Replace `groupIds` with `ids: ["graphqlIntro", "homePage"]`
- Remove `skip` and `limit` all together.

```
{
  contentItems(
    query: { groupIds: ["simple-example"] },
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
