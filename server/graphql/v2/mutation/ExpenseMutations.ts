import { GraphQLNonNull } from 'graphql';
import { pick } from 'lodash';

import FEATURE from '../../../constants/feature';
import { canUseFeature } from '../../../lib/user-permissions';
import models from '../../../models';
import { canDeleteExpense } from '../../common/expenses';
import { FeatureNotAllowedForUser, NotFound, Unauthorized } from '../../errors';
import { createExpense as createExpenseLegacy, editExpense as editExpenseLegacy } from '../../v1/mutations/expenses';
import { idDecode, IDENTIFIER_TYPES } from '../identifiers';
import { AccountReferenceInput, fetchAccountWithReference } from '../input/AccountReferenceInput';
import { ExpenseCreateInput } from '../input/ExpenseCreateInput';
import { ExpenseReferenceInput, getDatabaseIdFromExpenseReference } from '../input/ExpenseReferenceInput';
import { ExpenseUpdateInput } from '../input/ExpenseUpdateInput';
import { Expense } from '../object/Expense';

const expenseMutations = {
  createExpense: {
    type: new GraphQLNonNull(Expense),
    description: 'Submit an expense to a collective',
    args: {
      expense: {
        type: new GraphQLNonNull(ExpenseCreateInput),
        description: 'Expense data',
      },
      account: {
        type: new GraphQLNonNull(AccountReferenceInput),
        description: 'Account where the expense will be created',
      },
    },
    async resolve(_, args, req): Promise<object> {
      const payoutMethod = args.expense.payoutMethod;
      if (payoutMethod.id) {
        payoutMethod.id = idDecode(payoutMethod.id, IDENTIFIER_TYPES.PAYOUT_METHOD);
      }

      // Right now this endpoint uses the old mutation by adapting the data for it. Once we get rid
      // of the `createExpense` endpoint in V1, the actual code to create the expense should be moved
      // here and cleaned.
      return createExpenseLegacy(req.remoteUser, {
        ...pick(args.expense, ['description', 'tags', 'type', 'privateMessage', 'attachments', 'invoiceInfo']),
        amount: args.expense.attachments.reduce((total, attachment) => total + attachment.amount, 0),
        PayoutMethod: payoutMethod,
        collective: await fetchAccountWithReference(args.account, req),
        fromCollective: args.expense.payee,
      });
    },
  },
  editExpense: {
    type: new GraphQLNonNull(Expense),
    description: 'To update an existing expense',
    args: {
      expense: {
        type: new GraphQLNonNull(ExpenseUpdateInput),
        description: 'Expense data',
      },
    },
    async resolve(_, { expense }, req): Promise<object> {
      return editExpenseLegacy(req.remoteUser, {
        id: idDecode(expense.id, IDENTIFIER_TYPES.EXPENSE),
        description: expense.description,
        tags: expense.tags,
        type: expense.type,
        privateMessage: expense.privateMessage,
        invoiceInfo: expense.invoiceInfo,
        amount: expense.attachments?.reduce((total, att) => total + att.amount, 0),
        PayoutMethod: expense.payoutMethod && {
          id: expense.payoutMethod.id && idDecode(expense.payoutMethod.id, IDENTIFIER_TYPES.PAYOUT_METHOD),
          data: expense.payoutMethod.data,
          name: expense.payoutMethod.name,
          isSaved: expense.payoutMethod.isSaved,
          type: expense.payoutMethod.type,
        },
        attachments: expense.attachments?.map(attachment => ({
          id: attachment.id && idDecode(attachment.id, IDENTIFIER_TYPES.EXPENSE_ATTACHMENT),
          url: attachment.url,
          amount: attachment.amount,
          incurredAt: attachment.incurredAt,
          description: attachment.description,
        })),
        fromCollective: null, // TODO payee
      });
    },
  },
  deleteExpense: {
    type: new GraphQLNonNull(Expense),
    description: `Delete an expense. Only work if the expense is rejected - please check permissions.canDelete.`,
    args: {
      expense: {
        type: new GraphQLNonNull(ExpenseReferenceInput),
        description: 'Reference of the expense to delete',
      },
    },
    async resolve(_, args, { remoteUser }): Promise<typeof Expense> {
      if (!remoteUser) {
        throw new Unauthorized();
      } else if (!canUseFeature(remoteUser, FEATURE.EXPENSES)) {
        throw new FeatureNotAllowedForUser();
      }

      const expenseId = getDatabaseIdFromExpenseReference(args.expense);
      const expense = await models.Expense.findByPk(expenseId, {
        // Need to load the collective because canDeleteExpense checks expense.collective.HostCollectiveId
        include: [{ model: models.Collective, as: 'collective' }],
      });

      if (!expense) {
        throw new NotFound({ message: 'Expense not found' });
      } else if (!canDeleteExpense(remoteUser, expense)) {
        throw new Unauthorized({
          message: "You don't have permission to delete this expense or it needs to be rejected before being deleted",
        });
      }

      return expense.destroy();
    },
  },
};

export default expenseMutations;
