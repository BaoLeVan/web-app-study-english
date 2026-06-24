'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ForgotPasswordSchema, type ForgotPasswordDto } from '@repo/types';
import { Button, GlassCard, PillInput } from '@/components/ui';
import { authApi } from '@/lib/auth-api';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordDto>({ resolver: zodResolver(ForgotPasswordSchema) });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      await authApi.forgotPassword(values);
    } finally {
      setSubmitting(false);
      setSent(true);
    }
  });

  return (
    <GlassCard className="rounded-lg p-8">
      <h2 className="mb-2 font-headline-lg text-on-surface">Reset password</h2>
      <p className="mb-8 font-body-md text-outline">
        Enter your email and we'll send instructions to reset it.
      </p>

      {sent ? (
        <div className="space-y-6">
          <div className="flex items-center gap-3 rounded-md bg-tertiary-fixed/40 px-4 py-3">
            <span className="material-symbols-outlined text-tertiary">mark_email_read</span>
            <p className="font-body-md text-on-surface">
              If that email exists, a reset link is on its way.
            </p>
          </div>
          <Link href="/login" className="block text-center font-label-bold text-primary">
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-6">
          <PillInput
            label="Email"
            icon="mail"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? 'Sending…' : 'Send reset link'}
          </Button>
          <p className="text-center font-label-sm text-outline">
            Remembered?{' '}
            <Link href="/login" className="font-bold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      )}
    </GlassCard>
  );
}
