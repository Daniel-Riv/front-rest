import { z } from 'zod';

export function getLoginSchema(t: (key: string) => string) {
  return z.object({
    email: z.string().email(t('validation.emailInvalid')),
    password: z.string().min(6, t('validation.passwordMin')),
  });
}

export type LoginForm = {
  email: string;
  password: string;
};
