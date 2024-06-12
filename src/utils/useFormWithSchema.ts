import { effectTsResolver } from '@/utils/effectResolver'
import type { Schema } from '@effect/schema'
import {
	type FieldValues,
	type UseFormProps,
	type UseFormReturn,
	useForm as useFormRHF,
} from 'react-hook-form'

export function useFormWithSchema<
	TFieldValues extends FieldValues = FieldValues,
	TContext = any,
	TTransformedValues extends FieldValues | undefined = undefined,
	I = never,
>(
	options: UseFormProps<TFieldValues, TContext> & {
		schema: Schema.Schema<TFieldValues, I>
	},
): UseFormReturn<TFieldValues, TContext, TTransformedValues> {
	return useFormRHF<TFieldValues, TContext, TTransformedValues>({
		resolver: effectTsResolver(options.schema),
		criteriaMode: 'all',
		reValidateMode: 'onChange',
		mode: 'onBlur',
		...options,
	})
}
