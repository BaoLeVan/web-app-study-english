import { SetMetadata } from '@nestjs/common';

/** Mark a route as bypassing both JWT auth and throttling. */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
