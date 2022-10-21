ARCHIVED:
- [main package `@sidestream-tech/nuxt-sidebase-parse` moved to `@sidebase/nuxt-parse`](https://github.com/sidebase/nuxt-parse)
- this repo was archived as no other libs were present

# Sidebase Libraries

This is the repository containing the packages that power [`sidebase`](https://github.com/sidestream-tech/sidebase/).

Open [`packages/`](./packages/) to see the packages.

## Usage

We use [`lerna`](https://lerna.js.org/) to manage our packages. To get started:
```bash
> npm i

# Initial bootstrap, install all sub-deps, see https://github.com/lerna/lerna/tree/main/commands/bootstrap
> npm run bootstrap

# Tests of all sub-packages
> npm run test

# Builds all sub-packages
> npm run build

# Publishes all _changed_ sub-packages
> npm run publish
```
