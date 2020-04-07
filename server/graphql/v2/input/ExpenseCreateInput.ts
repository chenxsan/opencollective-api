import { GraphQLString, GraphQLInputObjectType, GraphQLList, GraphQLNonNull } from 'graphql';
import { ExpenseType } from '../enum/ExpenseType';
import { ExpenseAttachmentCreateInput } from './ExpenseAttachmentCreateInput';
import { PayoutMethodInput } from './PayoutMethodInput';
import { AccountReferenceInput } from './AccountReferenceInput';
import { ExpenseAttachedFileInput } from './ExpenseAttachedFileInput';

/**
 * Input type to use as the type for the expense input in createExpense mutation.
 */
export const ExpenseCreateInput = new GraphQLInputObjectType({
  name: 'ExpenseCreateInput',
  fields: {
    description: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Main title of the expense',
    },
    tags: {
      type: new GraphQLList(GraphQLString),
      description: 'Tags associated to the expense (ie. Food, Engineering...)',
    },
    type: {
      type: new GraphQLNonNull(ExpenseType),
      description: 'The type of the expense',
    },
    privateMessage: {
      type: GraphQLString,
      description: 'A private note that will be attached to your invoice',
    },
    invoiceInfo: {
      type: GraphQLString,
      description: 'Tax ID, VAT number...etc This information will be printed on your invoice.',
    },
    payoutMethod: {
      type: new GraphQLNonNull(PayoutMethodInput),
      description: 'The payout method that will be used to reimburse the expense',
    },
    attachments: {
      type: new GraphQLNonNull(new GraphQLList(ExpenseAttachmentCreateInput)),
      description: 'The list of attachments for this expense. Total amount will be computed from them.',
    },
    attachedFiles: {
      type: new GraphQLList(new GraphQLNonNull(ExpenseAttachedFileInput)),
      description: '(Optional) A list of files that you want to attach to this expense',
    },
    payee: {
      type: new GraphQLNonNull(AccountReferenceInput),
      description: 'Account to reimburse',
    },
  },
});
