'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterSchema, type RegisterDto } from '@repo/types';
import { Button, GlassCard, PillInput } from '@/components/ui';
import { authApi } from '@/lib/auth-api';
import { useLogin } from '@/lib/session';
import { ApiError } from '@/lib/api';
import { useState } from 'react';

export default function RegisterPage() {
  const router = useRouter();
  const login = useLogin();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterDto>({ resolver: zodResolver(RegisterSchema) });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    setServerError(null);
    try {
      const res = await authApi.register(values);
      login(res);
      router.push('/dashboard');
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <GlassCard className="rounded-lg p-8">
      <h2 className="mb-2 font-headline-lg text-on-surface">Create your account</h2>
      <p className="mb-8 font-body-md text-outline">Personalized learning starts in seconds.</p>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <PillInput
            label="First name"
            autoComplete="given-name"
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <PillInput
            label="Last name"
            autoComplete="family-name"
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>
        <PillInput
          label="Email"
          icon="mail"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <PillInput
          label="Password"
          icon="lock"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />

        {serverError && (
          <p className="rounded-md bg-error-container/50 px-4 py-2 font-label-sm text-on-error-container">
            {serverError}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? 'Creating…' : 'Create account'}
        </Button>

        <p className="text-center font-label-sm text-outline">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </GlassCard>
  );
}
