/* eslint-disable @typescript-eslint/no-explicit-any */
import { createError, readBody, getQuery, getHeaders, parseCookies } from "h3"
import type { CompatibilityEvent } from "h3"
import { z } from "zod"

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

/**
 * Parse the body of a `h3` event.
 *
 * Cookies are part of the HTTP standard and may be send with a request.
 *
 * @param {CompatibilityEvent} input - Input to parser using the `schema`
 * @param {ZodSchema} schema - Error code of error if parsing fails
 * @param {string} [errorCode=422] - Optional error message if parsing fails
 * @param {string} [errorMessage="Data validation failed"] - Optional error message if parsing fails
 */
const parseBodyAs = makeParserForDataSource(readBody<any>)

/**
 * Parse the params of a `h3` event.
 *
 * For example `/[test].get.ts` binds the parameter `test` to a value, for example `/1` then results in `test = 1`
 *
 * @param {CompatibilityEvent} input - Input to parser using the `schema`
 * @param {ZodSchema} schema - Error code of error if parsing fails
 * @param {string} [errorCode=422] - Optional error message if parsing fails
 * @param {string} [errorMessage="Data validation failed"] - Optional error message if parsing fails
 */
const parseParamsAs = makeParserForDataSource((event: CompatibilityEvent) => event.context.params)

/**
 * Parse the query of a `h3` event.
 *
 * For example `/bar?sort=ASC` binds the query value `sort = "ASC"`
 *
 * @param {CompatibilityEvent} input - Input to parser using the `schema`
 * @param {ZodSchema} schema - Error code of error if parsing fails
 * @param {string} [errorCode=422] - Optional error message if parsing fails
 * @param {string} [errorMessage="Data validation failed"] - Optional error message if parsing fails
 */
const parseQueryAs = makeParserForDataSource(getQuery)

/**
 * Parse the cookies of a `h3` event.
 *
 * Cookies are part of the HTTP standard and send with every request.
 *
 * @param {CompatibilityEvent} input - Input to parser using the `schema`
 * @param {ZodSchema} schema - Error code of error if parsing fails
 * @param {string} [errorCode=422] - Optional error message if parsing fails
 * @param {string} [errorMessage="Data validation failed"] - Optional error message if parsing fails
 */
const parseCookieAs = makeParserForDataSource(parseCookies)

/**
 * Parse the headers of a `h3` event.
 *
 * Cookies are part of the HTTP standard and send with every request.
 *
 * @param {CompatibilityEvent} input - Input to parser using the `schema`
 * @param {ZodSchema} schema - Error code of error if parsing fails
 * @param {string} [errorCode=422] - Optional error message if parsing fails
 * @param {string} [errorMessage="Data validation failed"] - Optional error message if parsing fails
 */
const parseHeaderAs = makeParserForDataSource(getHeaders)

/**
 * Parse arbitrary data using a schema.
 *
 * E.g.:
 * ```
 * const parsedData = await parseDataAs({ test: "1" }, z.object({ test: z.number() )}))
 *
 * console.log(parsedData)
 * // -> output: `1` (as a number, as `z` also deserializes)
 * ```
 *
 * Also works with async data, e.g., when fetching from another API or DB:
 * ```
 * const fakeDatabaseQuery = async () => { test: "1" }
 * const parsedData = await parseDataAs(fakeDatabaseQuery, z.object({ test: z.number() )}))
 *
 * console.log(parsedData)
 * // -> output: `1` (as a number, as `z` also deserializes)
 * ```
 *
 * @param {CompatibilityEvent} input - Input to parser using the `schema`
 * @param {ZodSchema} schema - Error code of error if parsing fails
 * @param {string} [errorCode=422] - Optional error message if parsing fails
 * @param {string} [errorMessage="Data validation failed"] - Optional error message if parsing fails
 */
const parseDataAs = makeParserForDataSource(async (data: Promise<any>) => await data)

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
const makeParser = <ZodSchema extends z.ZodTypeAny>(schema: ZodSchema, errorCode = 422, errorMessage = "Data validation failed") => (data: any, errorCodeOverwrite = undefined, errorMessageOverwrite = undefined) => apiValidateWithSchema(data, schema, errorCodeOverwrite || errorCode, errorMessageOverwrite || errorMessage)


export {
  parseBodyAs,
  parseParamsAs,
  parseQueryAs,
  parseCookieAs,
  parseHeaderAs,
  parseDataAs,

  makeParser,

  // re-export `z` for DX
  z
}
