import { GraphQLBoolean, GraphQLInt, GraphQLObjectType } from 'graphql';

import { hostResolver } from '../../common/collective';
import { Account, AccountFields } from '../interface/Account';

import { Collective } from './Collective';

export const Event = new GraphQLObjectType({
  name: 'Event',
  description: 'This represents an Event account',
  interfaces: () => [Account],
  isTypeOf: collective => collective.type === 'EVENT',
  fields: () => {
    return {
      ...AccountFields,
      balance: {
        description: 'Amount of money in cents in the currency of the collective currently available to spend',
        type: GraphQLInt,
        resolve(collective, _, req) {
          return req.loaders.Collective.balance.load(collective.id);
        },
      },
      host: {
        description: 'Get the host collective that is receiving the money on behalf of this collective',
        type: Account,
        resolve: hostResolver,
      },
      isApproved: {
        description: 'Returns whether this collective is approved',
        type: GraphQLBoolean,
        async resolve(event, _, req) {
          if (!event.ParentCollectiveId) {
            return false;
          } else {
            const parentCollective = await req.loaders.Collective.byId.load(event.ParentCollectiveId);
            return parentCollective && parentCollective.isApproved();
          }
        },
      },
      parentCollective: {
        description: 'The collective hosting this event',
        type: Collective,
        async resolve(event, _, req) {
          if (!event.ParentCollectiveId) {
            return null;
          } else {
            return req.loaders.Collective.byId.load(event.ParentCollectiveId);
          }
        },
      },
    };
  },
});
