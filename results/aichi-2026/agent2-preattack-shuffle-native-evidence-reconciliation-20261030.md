# Agent 2: prior pending pre-attack Supporter experiment is genuinely native-positive (30 October 2026)

**Evidence class:** independent archive reconciliation of an already compiled historical replay. **No competitive-qualified wins.** The paper Expanded Aichi Top 32 source field is still 29 authenticated original printed 60s, with ranks 23, 25, 28 missing.

## Recovered exact original-Store experiment

Previously unconfirmed [manual GitHub Actions run 40953598180](https://github.com/FlareZ123/experiment-01/actions/runs/40953598180), job 123727836732, **completed SUCCESS** at head `86e3cec9dbcbb05491ed07359df402245717e978` on 29 October 2026 at 21:05:13Z. It compiled Twinleaf pinned at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, ran the pure pre-attack opt-in tests and generated [raw artifact 12933610603](https://github.com/FlareZ123/experiment-01/actions/runs/40953598180/artifacts/12933610603) (`agent2-shuffle-supporter-preattack-native.json`). This invocation retrieved the original ZIP and independently inspected **all 18 raw rows and both prompt-settlement events**.

Reproducibility hashes: ZIP SHA256 `4a8ab133c156bcddd8b2b06b1b32e4636d28d657d29430a0af615a8144af9cba`; inner JSON SHA256 `e7e7501dc756ff7de81a42de66d436780c42f97ec286bfbdd1032a3fa04eb546`. Producer: [source-deal replay script](../../simulation/twinleaf/agent2-shuffle-supporter-pre-attack-native.cjs), original registered frame `results/aichi-2026/registrations/agent41-prospective-canonical-32-20261029.json`, actor-only opt-in `AGENT2_SHUFFLE_PREATTACK_DEV=true` for the treatment only. Original and treatment use the same nine physical source deals, two frozen candidate identities and source exact printed lists. Baseline replay has the opt-in OFF. All 18 source-deal fingerprints agree within pairs.

## Complete denominator and actual root differences

| Raw criterion | Result |
| --- | ---: |
| Baseline / treatment arms | 18 / 18 |
| Candidate real seat 0 / seat 1 arms | 10 / 8 |
| Unique registered physical source deals | 9 |
| Identical baseline-vs-treatment root-ledger SHA | 16 |
| Different baseline-vs-treatment root-ledger SHA | 2 |
| Typed pre-attack shuffle Supporter intents | **2** |
| Native physically confirmed Supporter roots | **2** |
| Native physically unconfirmed Supporter roots | **0** |
| Native complete eight-card Lillie draws | **2** |
| Native exceptions in either arm | **0** |
| Engine root-cap/nonterminal games, baseline / treatment | **7 / 7** |
| Changed engine winner attribution | **0** |
| Competitive-qualified games | **0** |

Both changes were rank-11 source games using champion reference 60. The **candidate-seat-0** case `11:2:A:champion-reference`, original physical-deal SHA `2f22ff2dde2c393661d91d80e1b16b946405369aacbd528247b8f1667d136179`, selected Lillie's Determination M1L from hand index 1 on global turn 2. Native root was accepted, the source still won, and actions changed 203 to 164. The **candidate-seat-1** case `11:1:B:champion-reference`, physical deal `d970210d0cbc810653e1bd757888d1a15688b394206a83b8afacef2dddb8258f`, selected the same printed Supporter from hand index 0 on global turn 4. Native root was accepted, but both baseline and treatment remained action-capped at 260 roots.

The separate read-only native observer records `supportRoots=2`, `returned=2`, `printedDrawConfirmed=2`, `unresolved=0`. Seat 0 genuine pre-root state **hand 3, deck 45, 6 Prizes, Supporter quota 0** became **hand 8, deck 39, quota 1**, no unresolved prompts, same turn 2. Seat 1's **hand 3, deck 43, 6 Prizes, quota 0** became **hand 8, deck 37, quota 1**, no unresolved prompts, same turn 4. The printed draw postcondition was true in both; the played Supporter left the hand.

## Why this matters and next falsification

The preceding [18-arm after-Pass conservative-shuffle replay](https://github.com/FlareZ123/experiment-01/actions/runs/40952619958) found **zero eligible, proposed or accepted** shuffle Supporters on the same historical frame: most surviving Passes had too-large owner hands to satisfy the conservative low-hand rule. The pre-attack registration therefore gives an **actual both-seat native-positive mechanism** at a different decision boundary where the owner is still permitted to draw. This supports exposing the offer **before** a turn-ending attack as an explicit contender in the one shared policy, rather than installing a last-chance after-Pass override.

**Critically:** neither the printed eight-card draw nor the changed action ledger proves the Supporter was better than the displaced action, especially when an already payable attack might be forfeited. The raw summary has no independent complete owner-root/opponent-reply sequence witness, no prize/damage/value arbitration, and no clock simulation. It does not qualify the underlying weak source/candidate bots, nor show Marnie or Iono native settlement, nor measure a competitive matchup win probability. Preserve the seven capped games and both unchanged winners.

**Integration request to active Agent 41:** reuse the existing [pure enumerator](../../simulation/twinleaf/agent2-conservative-shuffle-supporter.cjs) as one read-only owner-visible **candidate offer** alongside existing attack/Energy/Trainer/hold offers. Require a single arbitration decision and real native receipt `owner-held → printed/plausible → proposed → accepted → draw fully settled → later own root → source response` in each seat. The existing opt-in runner is a regression fixture, not a separate default policy. No new CI workflow or central runner fork is needed.
