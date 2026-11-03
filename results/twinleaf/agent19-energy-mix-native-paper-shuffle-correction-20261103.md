# Copied Mew V Energy Mix: reversible paper shuffle and target guard, compiled two-seat regression

**Agent 19 | 3 November 2026 | paper Expanded, Black & White onward | developmental native evidence only.**

## Decision-relevant summary

The original Aichi Open League 2026 rank-5 Mew/Genesect 60 uses **Mew V FST 113**, **Mew VMAX FST 114**, **Genesect V FST 185** and **Double Colorless Energy SUM 136**. The printed Mew V attack **Energy Mix** searches the deck for an Energy card, attaches it to a Fusion Strike Pokémon, **then shuffles the deck**. A Mew VMAX with Double Colorless Energy can pay Cross Fusion Strike and copy Benched Mew V's Energy Mix; the copy route is the relevant original-source line.

In pinned Twinleaf **`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`**, `ptcg-server/src/sets/09-sword-and-shield/set-fusion-strike/mew-v.ts` implements the Energy transfer with an `AttachEnergyPrompt` and `MOVE_CARDS`, but omits the printed final `ShuffleDeckPrompt`. Separate prior work proved that native prompt validation accepts a non-Fusion Strike target from `blockedTo`. Neither defect may be treated as paper-valid game behavior.

This contribution adds one **default-off** reversible research hook, `simulation/twinleaf/agent19-energy-mix-shuffle-hook.cjs`, which intercepts only the matching source Energy Mix `AttackEffect` and its real deck-to-Pokémon `AttachEnergyPrompt`. Once the original native attachment callback resolves, it requests the pinned engine's genuine `ShuffleDeckPrompt` and applies the returned deck permutation with native `player.deck.applyOrder`. The hook delegates every other effect unchanged and restores both prototype and temporary Store method in `finally`. It fails closed if an upstream Energy Mix implementation no longer emits exactly one expected attachment prompt.

The correction works for the copied attack because the pinned copy delegation executes the Mew V source reducer with Mew VMAX as the receiving Pokémon while the cloned copied attack is present. No upstream source file was modified. This hook is not enabled in the selected symmetric bilateral policy, and it does not cure other rules defects.

## Reproducible actual native evidence

**Compiled manual workflow:** [run 41655879882](https://github.com/FlareZ123/experiment-01/actions/runs/41655879882), head SHA `f778334bb1c09e5433c5e281a52b718dc5d592de`, manually dispatched with `native_only=true`. Original pinned Twinleaf checked out and compiled successfully.

**Targeted named steps, both succeeded:**

- **Step 14**, copied Energy Mix custody/target/shuffle pure regressions: 17 tests across prior custody 8, target guard 4, new shuffle 5.
- **Step 15**, `node simulation/twinleaf/agent19-mew-energy-mix-native.cjs`: actual `Store.dispatch`, actual Mew VMAX `Cross Fusion Strike` `AttackAction`, actual chosen Mew V `Energy Mix`, subsequent physical owner Energy transfer and prompt completion. Every assertion passed.

**Artifact:** [aichi-snorlax-root-setup, ID 13239711915](https://github.com/FlareZ123/experiment-01/actions/runs/41655879882/artifacts/13239711915), ZIP SHA-256 `0c83e7f929582e07e4ab99b0d17efbe893dae1e855339097eb8d8a7d60f2bb6f`. Contains the raw structured JSON `aichi-rank5-mew-energy-mix.json` with the following groups, actual physical source seats 0 and 1:

| Fixture group | Native outcomes | Specific tested fact |
| --- | --- | --- |
| 12 raw baseline controls (2 seats × 3 target types × 2 DCE availability states) | 4 transfers to legal Fusion Strike targets, 2 illegally accepted transfers to Crobat V, 6 zero-transfer results | Pinned source retains original DCE and shows neither a shuffle prompt nor a valid recipient check |
| 4 previous default-off `blockedTo` contrasts (2 seats × legal/illegal) | 2 legal attachments accepted and 2 paper-invalid attachments rejected before native transfer | Recipient guard works independently in both seats |
| 4 new corrected-shuffle controls (2 seats × DCE present/absent) | 4 genuine shuffle prompts validated and settled; 2 attached physical deck DCE and 2 did not | Printed shuffle completes after the optional search, even if no Energy is selected |
| 4 combined guarded-shuffle controls (2 seats × legal/illegal) | 2 legal Fusion Strike attachments with settled shuffle; 2 invalid Crobat attachments rejected before transfer | Both default-off corrections can be composed on the same actual native Store |

The native fixture uses a reproducible per-arm `seededRandom` stream with `deckPermutation`, and validates each permutation through the actual `ShuffleDeckPrompt.validate` before dispatch. The exact source deck-card ID multiset is checked before and after every corrected transfer, ensuring the shuffle does not invent or lose deck cards. A valid shuffle prompt can return an unchanged order by chance; prompt settlement, deck content preservation, and correct temporal placement are the demonstrated facts.

**Workflow-level caveat:** the overall run is **red** because its later unrelated `tests/snorlax-zero-energy-arceus-counterexample.test.cjs` fails with `INVALID_TARGET`; it was already independently failing in earlier runs. The successful targeted named steps and their artifact must not be confused with a successful whole workflow. No unrelated failure was suppressed or erased.

## Integration boundary and further falsifiers

- The research hook is opt-in via `withPaperMewEnergyMixShuffle(() => workload)`, is synchronous, and patches a shared class prototype for the duration of that workload. Do not run overlapping in-process games under the wrapper. The separate original target guard `withPaperAttachEnergyBlockedTo` can wrap it. Both are **developmental components**, not an actually selected release.
- The source proof is a **prepared Store board with source-authentic printed Mew, Mew VMAX, Genesect, Crobat, DCE and Mimikyu**. It is not a naturally dealt original 60 versus an autonomous original opponent, lacks a consequential opposing reply, and is not a full-game paper adjudication.
- The original rank-5 frozen source archive and custody join are in [the prior Agent19 report](agent19-rank5-copied-energy-mix-paper-custody-20261103.md). That archive observed 20 native Energy Mix copies per identical policy mode, only 4 physical DCE transfers per mode. The 16 other native zero-gain copies have unknown searchable owner deck availability. This new constructed correction does **not** retroactively change those archived outcomes.
- The remaining release task is to run a **new preregistered, matched physical original-rank-5 two-seat comparison** under one immutable selected bilateral policy, versioning both paper guards, recording every actual deck shuffle, destination eligibility, source Energy, opponent response, full native errors/caps, and fixed candidate 60. A changed random shuffle can change subsequent physical draws, so comparisons must preserve actual deal fingerprints rather than assuming shared seeds imply matched games. The general printed-payment, hidden-information, full-32-source, and official 25-minute paper match gates remain unresolved.

**Qualification:** 29/32 authenticated Aichi original 60s; ranks 23, 25 and 28 unavailable; **zero** competitively qualified games; **no selected fixed 60**; **no demonstrated 99.5% win rate**.

## Reproduction index

- Hook: [`simulation/twinleaf/agent19-energy-mix-shuffle-hook.cjs`](../../simulation/twinleaf/agent19-energy-mix-shuffle-hook.cjs).
- Five isolated pure tests: [`tests/agent19-energy-mix-shuffle-hook.test.cjs`](../../tests/agent19-energy-mix-shuffle-hook.test.cjs).
- Two-seat actual Store and composed-guard fixture: [`simulation/twinleaf/agent19-mew-energy-mix-native.cjs`](../../simulation/twinleaf/agent19-mew-energy-mix-native.cjs).
- Pre-existing recipient guard: [`simulation/twinleaf/agent19-paper-attach-energy-target-guard.cjs`](../../simulation/twinleaf/agent19-paper-attach-energy-target-guard.cjs).
- Shared manual workflow: [`.github/workflows/aichi-snorlax-root-setup.yml`](../../.github/workflows/aichi-snorlax-root-setup.yml), `native_only=true`; target steps execute before the unrelated historical Snorlax failure.
