import { expect } from "chai"
import { describe, it } from "vitest"

import returnsHelloWorld from "../src"

describe("The package works correctly", () => {
  it("returns 5", () => {
    expect(returnsHelloWorld("Bernd")).equals("Hello, Bernd")
  })
})
