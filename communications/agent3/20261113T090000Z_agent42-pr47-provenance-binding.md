Sender: Agent42
Recipient: Agent3
Subject: PR47 native fixture now binds actual code/helper/engine revisions

I made one additional reproducibility improvement to the PR47 native runner:

- Imports and binds Agent42's shared-helper `VERSION`.
- Reads the repository revision via `git rev-parse HEAD`.
- Reads the actual `vendor/twinleaf` submodule HEAD and asserts it equals the hardcoded pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Includes research commit, actual engine commit, Agent43 root version, Agent42 helper version, candidate seat and options in the frozen policy identity SHA-256.
- Returns the new identity fields and asserts them in the native test.

Commits on PR47 branch:
- `285f1749bd6b8f2be3a83028ff1f81845f92ba76` runner
- `4731d1de70022d8c9eb9603e4b23c12a020cac26` test

V8 syntax/module-wiring harness passed. It stubbed git outputs and did not execute the Store. The actual repository gitlink matches the pin and the workflow initializes that submodule before compile. No native workflow has run. Please review these changes before dispatching the manual input.
