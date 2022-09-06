/* eslint-disable @typescript-eslint/no-explicit-any */
import { createError, readBody, getQuery, getHeaders, parseCookies } from "h3"
import type { CompatibilityEvent } from "h3"
import type { z } from "zod"

const apiValidateWithSchema = <ZodSchema extends z.ZodTypeAny>(
  data: any,
  schema: ZodSchema,
  statusCode: number,
  statusMessage: string,
): z.infer<ZodSchema> => {
  try {
    return schema.parse(data)
  } catch (error) {
    throw createError({
      statusCode,
      statusMessage,
      data: error,
    })
  }
}

/**
 * Make a data parser that takes in an object `O` from which to extract data and a zod-data-schema. It then extracts data `D` from `O` to then parse and validate the data `D` using the zod schema.
 * This method will throw HTTP Exceptions (like 422 Unprocessible Entity) if data validation fails. The HTTP Error code and message can be customized.
 * @param {DataFetchingFunction} dataFetchingFunction - that accepts one argument (the `O`) and returns some data `D` from it
 * @param {number} errorCode - HTTP status code to return to client if parsing and validating `D` fails
 * @param {string} errorMessage - message to return to client if parsing and validating `D` fails
 */
type DataFetchingFunction<T> = (param: T) => any
const makeParserForDataSource = <T>(dataFetchingFunction: DataFetchingFunction<T>) => {
  const parser = async <ZodSchema extends z.ZodTypeAny>(input: Parameters<typeof dataFetchingFunction>[0], schema: ZodSchema, errorCode = 422, errorMessage = "Data validation failed") => {
    const data = await dataFetchingFunction(input)
    return apiValidateWithSchema(data, schema, errorCode, errorMessage)
  }

  return parser
}

// Generate parsing methods for different data-sources
export const parseBodyAs = makeParserForDataSource(readBody<any>)
export const parseParamsAs = makeParserForDataSource((event: CompatibilityEvent) => event.context.params)
export const parseQueryAs = makeParserForDataSource(getQuery)
export const parseCookieAs = makeParserForDataSource(parseCookies)
export const parseHeaderAs = makeParserForDataSource(getHeaders)

export const parseDataAs = makeParserForDataSource((data: Record<any, any>) => data)
export const parseDataPromiseAs = makeParserForDataSource(async (data: Promise<any>) => await data)

/**
 * Make a data transformer based on a schema. All data passed into it will be turned into data of that schema (or the transformer will throw during parsing)
 * This method will throw an exception (like 422 Unprocessible Entity) if data validation fails. The error code and message can be customized.
 * @param {z.ZodTypeAny} schema - message to return to client if parsing and validating `D` fails
 * @param {number} errorCode - error code of error if parsing fails
 * @param {string} errorMessage - error message if parsing fails
 *
 * The returned parser can then be used like this:
 * ```ts
 * const transform = makeParser(z.object({
 *  createdAt: z.date()
 * }))
 *
 * const { data } = useFetch('/example/1', { transform })
 *
 * console.log(data.createdAt)
 * // -> output: `Date Tue Sep 06 2022 14:20:45 GMT+0200 (Central European Summer Time)`
 *
 * console.log(typeof data.createdAt)
 * // -> output: `object` (this is a parsed date, not a date string!)
 * ```
 */
export const makeParser = <ZodSchema extends z.ZodTypeAny>(schema: ZodSchema, errorCode = 422, errorMessage = "Data validation failed") => (data: any, errorCodeOverwrite = undefined, errorMessageOverwrite = undefined) => apiValidateWithSchema(data, schema, errorCodeOverwrite || errorCode, errorMessageOverwrite || errorMessage)
