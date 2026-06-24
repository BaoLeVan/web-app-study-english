'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema, type LoginDto } from '@repo/types';
import { Button, GlassCard, PillInput } from '@/components/ui';
import { authApi } from '@/lib/auth-api';
import { useLogin } from '@/lib/session';
import { ApiError } from '@/lib/api';

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginShell />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginShell({ children }: { children?: React.ReactNode }) {
  return (
    <GlassCard className="rounded-lg p-8">
      <h2 className="mb-2 font-headline-lg text-on-surface">Welcome back</h2>
      <p className="mb-8 font-body-md text-outline">Continue your English journey.</p>
      {children}
    </GlassCard>
  );
}

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const login = useLogin();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginDto>({ resolver: zodResolver(LoginSchema) });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    setServerError(null);
    try {
      const res = await authApi.login(values);
      login(res);
      router.push(search.get('next') ?? '/dashboard');
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <LoginShell>
      <form onSubmit={onSubmit} className="space-y-6">
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
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        {serverError && (
          <p className="rounded-md bg-error-container/50 px-4 py-2 font-label-sm text-on-error-container">
            {serverError}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </Button>

        <div className="flex items-center justify-between font-label-sm">
          <Link href="/forgot-password" className="text-primary hover:underline">
            Forgot password?
          </Link>
          <span className="text-outline">
            New here?{' '}
            <Link href="/register" className="font-bold text-primary hover:underline">
              Create account
            </Link>
          </span>
        </div>
      </form>
    </LoginShell>
  );
}
