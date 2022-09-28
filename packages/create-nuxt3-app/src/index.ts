#!/usr/bin/env node
import {getUserInput} from "./prompts"
import {exec} from "child_process"

(async () => {
  console.info("----------------------------------------------------------------------")
  console.info("                  _                        _   ____                   \n" +
    "  __ _ _ ___ __ _| |_ ___ ___ _ _ _  ___ _| |_|__ /___ __ _ _ __ _ __ \n" +
    " / _| '_/ -_) _` |  _/ -_)___| ' \\ || \\ \\ /  _||_ \\___/ _` | '_ \\ '_ \\\n" +
    " \\__|_| \\___\\__,_|\\__\\___|   |_||_\\_,_/_\\_\\\\__|___/   \\__,_| .__/ .__/\n" +
    "                                                           |_|  |_|")
  console.info("----------------------------------------------------------------------")

  const userInput = await getUserInput()

  const scaffoldName = userInput.scaffold === "sidebase" ? "community/sidebase" : "v3"
  const projectName = userInput.name || "nuxt3-starter"

  exec(`npx nuxi@latest init -t ${scaffoldName} ${projectName}`, () => {
    console.log("The scaffold has been created!")
  })
})()
