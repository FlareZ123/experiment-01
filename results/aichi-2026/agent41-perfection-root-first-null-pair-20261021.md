# Same-head Perfection actor-root first A/B: historical null, source-first miswire

**Agent 41 | 21 October 2026 UTC | compiled original Twinleaf Store development evidence.** This is a negative, failure-inclusive comparison of existing unchanged candidate 60s, not proof of deck strength.

## Fixed setup

- Repository HEAD for **both runs**: `d1ed5d98c5901ff99669ee7de9296cdbae4e7819`, branch `agent41/perfection-root-paired-20261021`.
- Pinned engine: `twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Existing manual workflow: `.github/workflows/agent7-canonical-actor-bilateral.yml`.
- Control: [run 39574559813](https://github.com/FlareZ123/experiment-01/actions/runs/39574559813), [artifact 12333003231](https://github.com/FlareZ123/experiment-01/actions/runs/39574559813/artifacts/12333003231), ZIP SHA256 `f06cd4eab31dac3de902e5d4a220bbd2f3d6805c3d1282012cd14c31bced3bcd`.
- Treatment: [run 39574568129](https://github.com/FlareZ123/experiment-01/actions/runs/39574568129), [artifact 12333577486](https://github.com/FlareZ123/experiment-01/actions/runs/39574568129/artifacts/12333577486), ZIP SHA256 `75af8e13c2bb84c9332392226a5121291a49d50eba7daac6ddcd8399fd110b6d`.
- Intended sole difference: `actor_perfection_root=false` vs `true`, with common positive flags source-first retrospective, early Benched owner Battle Compressor donor, owner-visible Basic Energy recipient, paid retreat, Special Energy root, paper terminal attack KO and native fallback attribution. All other optional flags off; paper Supporter and mandatory selection gates forced on.
- All 4 original historical arms have the same actual physical deals and actual starter in paired off/on files. Opponents ranks 6 and 11; two fixed candidates champion-reference and New Moon Lockbreaker. Historical candidate-root observer indeed reports `perfectionRootOptIn=false` vs `true`.

## Historical four-arc result: no actual Perfection execution

| Historical source/candidate | Root actions, off/on | Candidate attacks, off/on | Final Prize counts, off/on | Native root ledger |
| --- | ---: | ---: | --- | --- |
| rank 6 champion | 35 / 35 | 1 / 1 | [6,3] / [6,3] | exactly identical SHA256 `de15d384aec4e64e48b7ea80fbf2d3720661601e01668c5ee409f2ba6ef1e104` |
| rank 6 New Moon | 83 / 83 | 0 / 0 | [6,0] / [6,0] | exactly identical SHA256 `d0d41b514dee31a7f36876d8e4514b04f05ccdd54e878cfad3193a9bda334214` |
| rank 11 champion | 95 / 95 | 9 / 9 | [6,0] / [6,0] | exactly identical SHA256 `a7194e21e8e4237d9a5360913df23d7429661366845759fe6bfe8a93323f2ea6` |
| rank 11 New Moon | 260 / 260 | 20 / 20 | [6,6] / [6,6] | exactly identical SHA256 `6f61e4becf91ef062ae901063e619477c90075ced65cda3f3d7932c038a8aa68` |

The enabled owner policy never proposed a `perfection` intent on any of the four historical games, so this is evidence of **zero observed opportunities/activation**, not evidence that a payable copied-GX attack performs poorly. Rank 11 New Moon is still censored at the 260-action cap.

## Source-first four-arc result: absent experimental contrast and a genuine abort

All four same-run historical-success/source-first datasets were uploaded before CI failed. In the source-first actor-root audits, `perfectionRootOptIn=false` **for both control and treatment**. The workflow forwarded the input only to the historical runner, omitting it from source-first and other paired counterfactual steps. Source-first report JSONs are **byte-identical** between the two runs, SHA256 `8678a88dc449cce1e659...` (first 20 hexadecimal characters). The comparison of source-first Perfection effectiveness therefore never happened.

Three source-first arms have genuine actor audits, identical off/on:
- rank 6 champion: 93 root actions, source-first, one native engine ending, Prizes [6,2].
- rank 11 champion: 89 root actions, source-first, one engine ending, Prizes [6,1].
- rank 11 New Moon: 260-root censor, Prizes [1,6].
- rank 6 New Moon: aborted at **native action 133**, `AttackAction`, underlying `LABEL_GX_USED`. The source-first JSON has no complete original-deal or actor-root audit for this failed arm; the native fallback abort observer retained 82 genuine generic owner prompt decodes, with 0 failed generic decodes.

The abort was *misclassified* `paper-supporter-quota-veto` by an outer catch because the paper-quota wrapper attaches evidence to **all** propagated exceptions. Its own attached audit recorded `rootDispatchVetoes:[]`, `ownerProposalSuppressions:[]`, and 0 suppressions. There was no observed Supporter-root quota veto. The underlying error is a failed GX attack declaration; attribution as a paper-Supporter violation is wrong. Whether a previous GX attack was indeed used, the native Store failure is correct, and which decision proposed the failing attack require subsequent traced inspection.

Both manually dispatched CI workflows finished **failure** because their former source-first step asserted 4/4 full actor audits although a typed failed arm had no audit. This is a meaningful reproducible qualification negative. The case must remain counted as attempted and failed, not silently dropped.

## Bounded corrections committed subsequently to main

- `79f11c8282f6c7d1a7c0437f9d0b71a3e06feb58`: forward the existing Perfection workflow input to **all six** native runner invocations (including source-first, donor controls, and observer pair checks), rather than only the main historical runner. Future genuinely same-head A/B must be re-executed under this corrected workflow.
- `41c190a91514c1c83b567e6e5abd7e032437ae2c`: classify `paper-supporter-quota-veto` only when the native guard recorded an actual rejected Supporter root; otherwise preserve `engine-error` while retaining incomplete quota observer metadata. `tests/agent41-native-abort-classification.test.cjs`, commit `613d86425166beec3682a6b28d80ec3df9c836c9`, adds four negative/positive cases.
- `a9c1ba99ce4c977783ba1e39e1ea13db84e1c6c2`: the existing manual workflow tests the classifier and treats full audit coverage as conditional on an actually successful arm; it still requires every aborted arm to remain typed, with an error string, and prints a failure-inclusive status summary. It does not certify any game.

These follow-up changes have **not yet been re-executed** in the above two archived runs; they are independently versioned prospective repairs, not retroactive results.

## Conclusion

The original A/B shows no historical on/off action difference, no Perfection action and a source-first comparison control mistake. Retain the eight attempted source-first and eight attempted historical games as development evidence (two jobs times four trials in each panel), noting that source-first records are identical before any actual Perfection treatment. The next useful evidence is one corrected **same-commit source-first** pair and the exact censored GX history, with paid prompt-closed copied attack, real Prize/board consequences and opponent response required for stronger claims. **Zero competitively qualified games; no 99.5% fixed 60 demonstrated.**
