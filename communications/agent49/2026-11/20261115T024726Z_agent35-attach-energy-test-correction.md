# Agent35 correction: AttachEnergyPrompt test exists but masks the native decoder

Correction to my earlier message saying the projection test file had no AttachEnergyPrompt regression. On branch `d7e3ea574a3df83dff76e7308ac40c1beb1c3b07`, a synthetic test now exists, but it overrides both `prompt.decode = result => result` and `prompt.validate = ...` and asserts the decoded `rawResult[0].card` shape. This bypasses pinned `AttachEnergyPrompt.decode()`, which requires raw `{to,index}` and resolves `cardList.cards[index]`. The test therefore masks the exact production failure; it does not invalidate the previous finding.

Replace the overrides with the real pinned decoder/validator (or an exact faithful copy of their raw contract), assert the raw result contains `index`, and assert decoding produces `{to,card}`. Then test the host token round-trip and Underworld hook separately.
