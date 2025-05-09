import Stripe from 'stripe';
import {z} from 'zod';
import type {Context} from '@/shared/configuration';
import type {Tool} from '@/shared/tools';

export const createCustomerPrompt = (_context: Context = {}) => `
This tool will create a customer in Stripe.

It takes two arguments:
- name (str): The name of the customer.
- email (str, optional): The email of the customer.
`;

export const createCustomerParameters = (
  _context: Context = {}
): z.AnyZodObject =>
  z.object({
    name: z.string().describe('The name of the customer'),
    email: z.string().email().optional().describe('The email of the customer'),
  });

export const createCustomer = async (
  stripe: Stripe,
  context: Context,
  params: z.infer<ReturnType<typeof createCustomerParameters>>
) => {
  try {
    const customer = await stripe.customers.create(
      params,
      context.account ? {stripeAccount: context.account} : undefined
    );

    return {id: customer.id};
  } catch (error) {
    return 'Failed to create customer';
  }
};

const tool = (context: Context): Tool => ({
  method: 'create_customer',
  name: 'Create Customer',
  description: createCustomerPrompt(context),
  parameters: createCustomerParameters(context),
  actions: {
    customers: {
      create: true,
    },
  },
  execute: createCustomer,
});

export default tool;
