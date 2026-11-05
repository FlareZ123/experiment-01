# Agent35: original rank11 source Professor's Letter replaces Pass37 in real native Store

**2026-11-05 18:21 UTC | one retrospective registered physical-deal counterfactual | DEVELOPMENT ONLY**

## Research question and frozen registration

Given independently observed paper-payable `Professor's Letter BKT` in the original **rank11 Absol/Garbodor owner** hand at historical turn8 Pass37, does the actual pinned native Store accept its physical owner-origin Item play if we replace exactly that one chosen `PassTurnAction`?

The treatment is frozen at [`agent35-rank11-letter-source-pass37-fork-20261105.json`](../aichi-2026/registrations/agent35-rank11-letter-source-pass37-fork-20261105.json): historical native arm `11:102:A:champion-reference`, source owner seat1, candidate seat0, actual starting player seat0, turn8 source Pass ordinal37, printed source Card `Professors Letter BKT`. Original full deal SHA256 `89a6801d09b95b8847f71296dc6532ae0fd772b9ca11c4cd8b482abb0144da48`, owner source deal SHA256 `98e08e93b944cfadfc5edb730a62976f505058169bbcc496dfebc9442732c7ba`, **pre-root37 accepted-ledger prefix SHA256** `12be9779bc0f741d300c61ccbb2a9e54c16cb70e9d5621e68e5fb992306b1386`. The unmodified original full public root ledger digest is `2a0bbc4fc8574ebe8069176d15fe4691fb731b80a461ab73d574a176a2f7c070`.

The existing steward selected-v5 eight-arm runner remains otherwise unchanged; the research-owned [source Item fork](../../simulation/evaluation/agent35-rank11-source-letter-pass37-fork.cjs) wraps `headless.runMatch` and substitutes **one real owned `PlayCardAction` for the original Pass** if the original native owner decoder itself chooses Pass at exactly that source turn and the real pre-choice owner hand holds the printed Item without public Item lock. No opponent concealed hand/deck is consulted. Original root and prompt policies remain in force after the action, and no opponent actions are preprogrammed.

## Executed native result

The corrected [GitHub Actions manual run **42082575236**](https://github.com/FlareZ123/experiment-01/actions/runs/42082575236) succeeded (pinned native compilation plus **four pure unit tests passed** and one eight-arm selected-v5 fork). Native artifact **13441396908**, [direct artifact page](https://github.com/FlareZ123/experiment-01/actions/runs/42082575236/artifacts/13441396908), ZIP SHA256 `2c02d9f66f8e73f26234f7b611a62c0dd87f85b152d6457849830d39b2c07cf7`, inner `agent35-rank11-letter-fork-native.json` **15970 bytes**, SHA256 `6b07d58f2cc92526caa5c811542868db239122b38578ce7327b39a001cce3215`.

The actual frozen-rank11 native result verifies:

| Gate | Observed result |
| --- | --- |
| Actual pinned Twinleaf | `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` |
| Native selected original eight attempts | 8 |
| Source entire physical deal | exact SHA match |
| Source-owned starting physical deal | exact SHA match |
| Accepted root ordinal 0 through 36 | **identical to historical original** (prefix SHA match) |
| Original source turn8 Pass37 reached | yes, same physical hand and board |
| Owner-origin Item proposal | `PlayCardAction` from held `Professors Letter BKT` |
| Actual native Store accepted root37 | **yes**, root action `PlayCardAction`, owner physical seat1, native display `Professor's Letter`, turn8 |
| Native accepted roots after intervention | **38 total**, ending at action ordinal37 |
| Native owner-deck search prompt accepted afterward | **zero** |
| Subsequent Darkness Energy attachment | **zero** |
| Native source-arm disposition | **`engine-error`** |
| Complete paper-qualified game or opponent reply | **none** |

This is the first **same-original-deal, same-original-pre-root-tape, genuine native Store accepted** source Professor's Letter action recovered at this registered Pass. It validates the concrete Item root and source-hand custody; it cannot support any claim that the two guaranteed Basic Darkness Energy were actually fetched or attached. The runtime abort happened immediately after accepted native action37, before any following root was accepted. The exact error message/Store cause was **not included in this v1 artifact**. An extension to the runner now preserves the existing normalized `trial.error`, `nativeStoreCauseStack`, and native abort provenance into future receipts, but **that extension has not been executed**. A subsequent manual dispatch attempt was blocked by tool safety checks and therefore no second runtime result is reported.

An earlier initial CI run [42082165829](https://github.com/FlareZ123/experiment-01/actions/runs/42082165829) aborted before the native experiment because a synthetic fixture wrongly treated nine future-turn prompt records as turn8. This test fixture was corrected in commit `4457c11d672ad69673111586276f62ee69fac34d`; the successful run 42082575236 contains all four passing tests. The previous [read-only full 33-source-Pass replay](https://github.com/FlareZ123/experiment-01/actions/runs/42079458048) remains an untouched separate baseline.

## Implications, confidence and next task

- **Paper action support is strong**: the exact source deck holds eight Basic Darkness Energy, visible non-Prize/Deck zones contain zero, and only six Prize cards can conceal them. At least two eligible search targets remain in the deck. Original owner holds Professor's Letter, Turn8 Item lock is absent. See [independent constructive legality/zone report](agent35-rank11-source-pass37-guaranteed-letter-targets-20261105.md).
- **Native acceptance support is decisive for the Item root**: pre-intervention accepted actions, printed physical deal and source actor ownership match historical provenance, and the real Store accepted the `PlayCardAction` where the original bot passed.
- **Native follow-through support is negative**: no subsequent search, chosen targets, settled physical owner-hand increase, attachment, source attack, opponent response or completed paper match was recorded. Do not extrapolate an Item play to a strategic payoff or improve a candidate's game win claims.
- **Unresolved blocker:** obtain and inspect the normalized native error/cause from a safely authorized rerun. Diagnose whether the problem occurs at creating a ChooseCardsPrompt, owner prompt handling or an unrelated exception. Respect owner information boundaries and keep Twinleaf upstream untouched.
- **Unmeasured strategic effect:** the source has five historical accepted Passes with this held Letter and no attached Energy (turns2/4/6/8/10); replacing only the late turn8 Pass is selected diagnostic evidence. A prospective alternative policy starting at turn2 would produce different later deals/actions and requires a separate frozen comparison.

**Status remains:** fixed winning deck not proven, 29/32 exact opponent printed lists authenticated, ranks23/25/28 missing, zero competitively qualified complete games, 99.5% target unsubstantiated.
