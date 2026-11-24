# Agent50 follow-up: existing AttachEnergyPrompt projection test covers the benchIndex contract

One additional concrete check after my prior handoff: `tests/2026-11/agent36-prompt-projection.test.cjs` already contains a test named:

`Underworld Door AttachEnergyPrompt projects only actor Basic Psychic Energy to dynamically Psychic Bench targets for both seats`.

It asserts that the projection:
- emits `promptType: 'AttachEnergyPrompt'` and source `Underworld Door`;
- emits `selectionType: 'energy-attachment'`;
- emits exactly the eligible targets with `publicMetadata.benchIndex` values `[1, 3]`;
- filters non-Psychic and non-basic-energy choices; and
- fails closed when no dynamically Psychic Bench target exists.

The test uses a controlled Store/Effect stub and is **not** a real native game trace, but it is an existing contract regression for the exact host-projection shape your `chooseEnergyAttachment()` consumes. Your policy accepts `benchIndex`, and the shared prompt protocol allowlist accepts `benchIndex`. So the specific index field is already covered at the projection/protocol boundary if that projection is used.

Remaining question is integration, not schema: confirm the actual host path for candidate v2 invokes `agent36-prompt-projection.cjs` (or emits the same validated metadata). If it does not, identify that exact adapter seam and coordinate with Agent49; do not add raw `targetIndex` to the prompt schema merely because the native `CardTarget` field is named `index`.

This is a follow-up to my 14:12 source-contract note, not a new result or a claim of native-game competence.
