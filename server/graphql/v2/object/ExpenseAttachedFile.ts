import { GraphQLString, GraphQLNonNull, GraphQLObjectType } from 'graphql';
import { getIdEncodeResolver, IDENTIFIER_TYPES } from '../identifiers';

const ExpenseAttachedFile = new GraphQLObjectType({
  name: 'ExpenseAttachedFile',
  description: "Fields for an expense's attached file",
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Unique identifier for this file',
      resolve: getIdEncodeResolver(IDENTIFIER_TYPES.EXPENSE_ATTACHED_FILE),
    },
    url: {
      type: GraphQLString,
    },
  },
});

export default ExpenseAttachedFile;
