import React from 'react';
import { createSearchParams, useSearchParams } from 'react-router-dom';
import { z } from 'zod';

export const HomePageSchema = z.object({
  page: z.literal('home').optional(),
  showAll: z.literal('yes').optional(),
});
export type HomePageSchemaType = z.infer<typeof HomePageSchema>;

export const SettingsPageSchema = z.object({
  page: z.literal('settings'),
  showAll: z.literal('yes').optional(),
});
export type SettingsPageSchemaType = z.infer<typeof SettingsPageSchema>;

export const TestPageSchema = z.object({
  page: z.literal('test'),
  showAll: z.literal('yes').optional(),
});
export type TestPageSchemaType = z.infer<typeof TestPageSchema>;

const AllowedQueriesSchema = z.union([HomePageSchema, SettingsPageSchema, TestPageSchema]);
export type AllowedQueriesType = z.infer<typeof AllowedQueriesSchema>;

export function searchParamsToObject(searchParams: URLSearchParams) {
  const params = Object.fromEntries(Array.from(searchParams));

  for (const schema of AllowedQueriesSchema.options) {
    const parsed = schema.safeParse(params);
    if (parsed.success) {
      return parsed.data;
    }
  }
  console.error('Route cannot be matched', params);
  return {}; // Go to homepage
}

export function sortObject(params: AllowedQueriesType): AllowedQueriesType {
  return Object.fromEntries(Object.entries(params).sort(([a], [b]) => a.localeCompare(b)));
}

export function cleanObject(params: AllowedQueriesType): AllowedQueriesType {
  const cleaned = Object.entries(params).filter(([, value]) => value !== undefined);
  return Object.fromEntries(cleaned);
}

export function makeParams(newParams: AllowedQueriesType) {
  return createSearchParams(sortObject(cleanObject(newParams)));
}

export function makeSearch(newParams: AllowedQueriesType) {
  return makeParams(newParams).toString();
}

export function useParams<T = AllowedQueriesType>(): [T, (newParams: AllowedQueriesType) => void] {
  const [searchParams, setSearchParams] = useSearchParams();

  const params = React.useMemo(() => searchParamsToObject(searchParams) as T, [searchParams]);

  const setParams = React.useCallback(
    (newParams: AllowedQueriesType): void => {
      setSearchParams(makeParams(newParams));
    },
    [setSearchParams]
  );

  return [params, setParams];
}
