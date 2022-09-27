import { getUserInput } from "./prompts"
import { exec } from "child_process"

(async () => {
  const selectedScaffold = await getUserInput()

  if (selectedScaffold === "simple") {
    exec("npx nuxi init nuxt-app", () => {
      process.exit(1)
    })
  }
  if (selectedScaffold === "sidebase") {
    exec("npx nuxi@latest init -t community/sidebase", () => {
      process.exit(1)
    })
  }
})()
