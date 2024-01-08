/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getsickdemotable = /* GraphQL */ `
  query Getsickdemotable($id: ID!) {
    getsickdemotable(id: $id) {
      id
      running
      status
      sms
      sixty
      time
      timeplus
      updatedAt
      createdAt
      __typename
    }
  }
`;
export const listsickdemotables = /* GraphQL */ `
  query Listsickdemotables(
    $filter: ModelsickdemotableFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listsickdemotables(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        running
        status
        sms
        sixty
        time
        timeplus
        updatedAt
        createdAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
