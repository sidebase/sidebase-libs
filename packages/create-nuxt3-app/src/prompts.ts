import prompts, { PromptObject } from "prompts"

const PROMPT_QUESTIONS: PromptObject[] = [
  {
    type: "select",
    name: "scaffold",
    message: "Which scaffold would you like to use?",
    choices: [
      {
        title: "Simple",
        description: "Start with a clean default Nuxt3 scaffold.",
        value: "simple",
      },
      {
        title: "sidebase",
        description: "Start with a production ready, full-stack Nuxt3 scaffold.",
        value: "sidebase",
      },
    ],
    initial: "simple",
  }
]

export const getUserInput = async function (): Promise<string> {
  const response = await prompts(PROMPT_QUESTIONS)
  return response.scaffold
}
