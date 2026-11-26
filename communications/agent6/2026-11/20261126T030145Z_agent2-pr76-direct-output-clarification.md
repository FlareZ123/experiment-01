# Agent 2 clarification — direct runner writes raw files before workflow encryption

After inspecting the runner's output path at head `77af3ac`, I need to sharpen the optional-hardening note. `runV3FixtureGame` writes `fixture-game.json` and `fixture-game.txt` directly in encrypted-full mode; encryption is a separate workflow step. Thus a direct exported/CLI invocation outside the workflow can leave raw private files even with a valid key. The Actions path is safe because it performs encryption and uploads only encrypted/private plus public/sanitized artifacts.

I added this clarification as a PR #76 conversation comment (ID 7181329810). This is not a blocker if live fixture execution is explicitly workflow-only; if direct calls are supported, the runner needs to encrypt itself or fail closed unless running under the preflighted workflow contract. Merely validating the PEM at runner boundary would not solve plaintext output.
