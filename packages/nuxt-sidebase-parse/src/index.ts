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
 * Parse the body of a `h3` event.
 *
 * Cookies are part of the HTTP standard and may be send with a request.
 *
 * @param {CompatibilityEvent} event - Input to parser using the `schema`
 * @param {ZodSchema} schema - Error code of error if parsing fails
 * @param {string} [errorCode=422] - Optional error message if parsing fails
 * @param {string} [errorMessage="Data validation failed"] - Optional error message if parsing fails
 */
async function parseBodyAs<ZodSchema extends z.ZodTypeAny>(event: CompatibilityEvent, schema: ZodSchema, errorCode = 422, errorMessage = "Body validation failed") {
  const data = await readBody(event)
  return apiValidateWithSchema(data, schema, errorCode, errorMessage)
}

/**
 * Parse the params of a `h3` event.
 *
 * For example `/[test].get.ts` binds the parameter `test` to a value, for example `/1` then results in `test = 1`
 *
 * @param {CompatibilityEvent} event - Input to parser using the `schema`
 * @param {ZodSchema} schema - Error code of error if parsing fails
 * @param {string} [errorCode=422] - Optional error message if parsing fails
 * @param {string} [errorMessage="Data validation failed"] - Optional error message if parsing fails
 */
function parseParamsAs<ZodSchema extends z.ZodTypeAny>(event: CompatibilityEvent, schema: ZodSchema, errorCode = 422, errorMessage = "Query validation failed") {
  const data = event.context.params
  return apiValidateWithSchema(data, schema, errorCode, errorMessage)
}

/**
 * Parse the query of a `h3` event.
 *
 * For example `/bar?sort=ASC` binds the query value `sort = "ASC"`
 *
 * @param {CompatibilityEvent} event - Input to parser using the `schema`
 * @param {ZodSchema} schema - Error code of error if parsing fails
 * @param {string} [errorCode=422] - Optional error message if parsing fails
 * @param {string} [errorMessage="Data validation failed"] - Optional error message if parsing fails
 */
function parseQueryAs<ZodSchema extends z.ZodTypeAny>(event: CompatibilityEvent, schema: ZodSchema, errorCode = 422, errorMessage = "Query validation failed") {
  const data = getQuery(event)
  return apiValidateWithSchema(data, schema, errorCode, errorMessage)
}

/**
 * Parse the cookies of a `h3` event.
 *
 * Cookies are part of the HTTP standard and send with every request.
 *
 * @param {CompatibilityEvent} event - Input to parser using the `schema`
 * @param {ZodSchema} schema - Error code of error if parsing fails
 * @param {string} [errorCode=422] - Optional error message if parsing fails
 * @param {string} [errorMessage="Data validation failed"] - Optional error message if parsing fails
 */
function parseCookieAs<ZodSchema extends z.ZodTypeAny>(event: CompatibilityEvent, schema: ZodSchema, errorCode = 422, errorMessage = "Query validation failed") {
  const data = parseCookies(event)
  return apiValidateWithSchema(data, schema, errorCode, errorMessage)
}

/**
 * Parse the headers of a `h3` event.
 *
 * Cookies are part of the HTTP standard and send with every request.
 *
 * @param {CompatibilityEvent} event - Input to parser using the `schema`
 * @param {ZodSchema} schema - Error code of error if parsing fails
 * @param {string} [errorCode=422] - Optional error message if parsing fails
 * @param {string} [errorMessage="Data validation failed"] - Optional error message if parsing fails
 */
function parseHeaderAs<ZodSchema extends z.ZodTypeAny>(event: CompatibilityEvent, schema: ZodSchema, errorCode = 422, errorMessage = "Query validation failed") {
  const data = getHeaders(event)
  return apiValidateWithSchema(data, schema, errorCode, errorMessage)
}

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
 * @param {any | Promise<any>} dataOrPromise - Input to parser using the `schema`
 * @param {ZodSchema} schema - Error code of error if parsing fails
 * @param {string} [errorCode=422] - Optional error message if parsing fails
 * @param {string} [errorMessage="Data validation failed"] - Optional error message if parsing fails
 */
async function parseDataAs<ZodSchema extends z.ZodTypeAny>(dataOrPromise: any | Promise<any>, schema: ZodSchema, errorCode = 422, errorMessage = "Data validation failed") {
  const data = await dataOrPromise
  return apiValidateWithSchema(data, schema, errorCode, errorMessage)
}

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
function makeParser<ZodSchema extends z.ZodTypeAny>(schema: ZodSchema, errorCode = 422, errorMessage = "Data validation failed") {
  return async (data: any | Promise<any>, errorCodeOverwrite = undefined, errorMessageOverwrite = undefined) => apiValidateWithSchema(await data, schema, errorCodeOverwrite || errorCode, errorMessageOverwrite || errorMessage)
}

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
