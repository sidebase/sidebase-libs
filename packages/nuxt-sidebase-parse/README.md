# nuxt-sidebase-parse

A nuxt focused package to make data validation and parsing easy. This package follows the design philosophy of the article [parse, don't validate](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/).

## Usage


```bash
npm i -D @sidestream-tech/nuxt-sidebase-parse
```

Then, e.g., in your code:

- Make an arbitrary parser, e.g., to deserialize data from an API:
    ```ts
    // Ensure that the outcome is of type `number` with a value `200 <= outcome <= 499`
    const transform = makeParser(z.number().min(200).max(499))

    const { data } = useFetch('https://httpbin.org/status/400', { transform })

    console.log(data)
    // -> output: `400`

    console.log(typeof data)
    // -> output: `number`
    ```
- Handle user data in an endpoint:
    ```ts
    import { defineEventHandler } from 'h3'
    import type { CompatibilityEvent } from 'h3'
    import { z parseParamsAs } from "@sidestream-tech/nuxt-sidebase-parse"

    const paramsSchema = z.object({
        id: z.string().uuid(),
    })

    export default defineEventHandler(async (event: CompatibilityEvent) => {
        // Parse the request parameters (so the dynamic data that is part of the URL, e.g.: `/example/1` where `1` is the id)
        // `params` will fully support type-hints and you can use it's properties like `params.id`
        const params = await parseParamsAs(event, paramsSchema)

        return params.id
    })
    ```
- Parse any data:
    ```ts
    import { z, parseDataAs } from "@sidestream-tech/nuxt-sidebase-parse"

    const parsedData = await parseDataAs({ test: "1" }, z.object({ test: z.number() )}))

    console.log(parsedData)
    // -> output: `1` (as a number, as `z` also deserializes)
    ```
- Also works with async data, e.g., when fetching from another API or DB:
    ```ts
    import { z, parseDataAs } from "@sidestream-tech/nuxt-sidebase-parse"

    const fakeDatabaseQuery = async () => { test: "1" }
    const parsedData = await parseDataAs(fakeDatabaseQuery, z.object({ test: z.number() )}))

    console.log(parsedData)
    // -> output: `1` (as a number, as `z` also deserializes)
    ```

## Documentation

This module exports:
- `parseBodyAs`: Parse body of `h3` event
- `parseParamsAs`: Parse params of `h3` event
- `parseQueryAs`: Parse query of `h3` event
- `parseCookieAs`: Parse cookies of `h3` event
- `parseHeaderAs`: Parse header of `h3` event
- `parseDataAs`: Parse sync or async data
- `makeParser`: Make your own parser (see example above)
- `z`: [`zod`](https://github.com/colinhacks/zod), the library used for parsing
