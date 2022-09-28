import prompts, { PromptObject } from "prompts"

const PROMPT_QUESTIONS: PromptObject[] = [
  {
    type: "select",
    name: "scaffold",
    message: "Which scaffold would you like to use?",
    choices: [
      { title: "simple", description: "Start with a clean default Nuxt3 scaffold.", value: "simple" },
      { title: "sidebase", description: "Start with a production ready, full-stack Nuxt3 scaffold.", value: "sidebase" },
    ],
    initial: 1
  },
  {
    type: "text",
    name: "projectName",
    message: "What should the project be called?"
  }
]

export const getUserInput = async function (): Promise<{scaffold: string, name: string}> {
  const response = await prompts(PROMPT_QUESTIONS)
  return { scaffold: response.scaffold, name: response.projectName }
}
