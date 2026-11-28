# Candidate Hood Shadow Rider turn-execution repairs (developmental; 2026-11-28)

**Status:** exact frozen candidate 60 unchanged; draft [PR #95](https://github.com/FlareZ123/experiment-01/pull/95), not merged or V3-registered. No native Store, full game, competitive matchup, win-rate or 99.5% claim. All test outcomes below are **isolated V8 CommonJS source evaluations** using the actual policy and strict protocol modules, with a `node:test` callback shim—not `node --test`, pinned Twinleaf, CI or gameplay.

## The executable line, not just the connector

The existing candidate source worker (`simulation/evaluation/2026-11/agent46-candidate-policy.cjs`) originally failed several **distinct** paths despite the frozen 60 containing the required cards:

| Root/continuation | Source-backed obstacle | Corrected decision boundary |
|---|---|---|
| Underworld Door | Agent32 had already discovered the unselected native ability and combined AttachEnergyPrompt | Preserved Agent32 root + typed physical recipient correction |
| Benched Mimikyu Copycat vs Regidrago | Retreat valuation lost the strict *last-opponent-attack* receipt before scoring a hypothetical Copycat→Apex Dragon→own discarded Dragon Dialga Timeless-GX line | Forward receipt to prospective attacker; never fabricate a raw or illegal native attack; retain GX-used and no-receipt negatives |
| Wondrous Labyrinth ◇ | Hypothetical two-Psychic Copycat mistakenly counted as paid despite one extra Colorless for non-Fairy attacks | Conservative cost tax with actor-visible Stadium and New Moon/suppression checks; three Psychic permits the same line |
| Guzma gust | Root scored a lethal attack by its own Active even though Guzma switches that Active **if a Bench exists** | Evaluate payable post-switch Benched attackers; with no own Bench, retain partial-effect gust with current Active |
| Active Latias ex | Manual Psychic attachment to reach Eon Blade PP[C] was assigned no score, leading to pass with a legal game-progressing attachment | Compare best currently-payable attack against best attack after exactly one *offered* hand Psychic; preserve already-playable attack and insufficient Energy negatives |
| Active Mimikyu under Wondrous | Same attachment-progress check lacked the last-Apex receipt, so it could not recognize adding the third Psychic for Copycat | Pass strict public receipt into the hypothetical post-attachment evaluator |
| Radiant Eternatus CRZ105 | Native Bench root ignored; optional *Climactic Gate* ConfirmPrompt (Yes/No) would abstain; generic VMAX search required pre-existing V despite Radiant putting VMAX **directly** from deck onto Bench | Low-priority turn-ending Radiant root; typed Yes confirmation; select up to two source-printed Shadow Rider VMAX from own deck, capped by *post-Radiant* remaining Bench slots (Sky Field accounted for), no need for prior V |
| Field Blower and Wondrous | Field Blower was prioritized for Wondrous alone even though that Stadium explicitly protects itself from Item/Supporter effects | No longer treat Wondrous as a Field Blower-removable Stadium; Path and Jamming Tower remain recognized |

The exact source card pool identifies Radiant Eternatus CRZ105 as a Basic Dragon with **Climactic Gate**: playing it from hand onto Bench permits up to two VMAX directly from deck, then ends the turn. The pinned repository already has `simulation/twinleaf/agent1-radiant-zero-gate-native.cjs` and a reversible hook for the known zero-selection turn-end discrepancy; no upstream/vendor changes here.

For initial-opening intuition only, the frozen 60 has four VMAX and one Radiant. Conditional on the particular Radiant being among the original seven, the other six hand cards and six Prize cards occupy 12 of the remaining 59 cards. Ignoring other Basic requirements, the mathematical chance that **all four VMAX** are outside the remaining deck is
`C(12,4)/C(59,4)=0.00108761` (about 0.109%); the chance that fewer than two remain in deck is about 2.381%. These are exact *card-location* calculations under the stated random distribution, **not** opening-execution or game-success probabilities. Later turns and a choice conditioned on other opening Basics change the distribution.

## Reproduced policy decisions

- Existing Agent32 candidate suites: **8/8** typed-attack cost, **16/16** Underworld Door root, **14/14** physical Underworld Door prompt/strict protocol.
- Agent3 suites: **10/10** Copycat retreat/Wondrous, **8/8** Guzma switch, **12/12** Active attack-enabling attachments, **12/12** Radiant root/Confirm/VMAX search including last-slot capacity.
- **80/80 constructed policy cases** combined from seven exact-source suites in an isolated V8 CommonJS execution. The Copycat suites now construct complete, strict `agent8-public-event-receipt-v3-turn-stamped` objects, with `validatePublicEventReceipt`, `validateDecision`, and `validatePolicyAudit` invoked. **Bench Mimikyu's pre-retreat `mimikyuCopycatCompatible` remains false**, as required by the strict protocol; the current Active has no Copycat. After an actual native retreat the receipt must be recomputed for the new Active.
- Separately, **4/4** in-process root checks show Field Blower preferred with Path to the Peak but not with only Wondrous Labyrinth. Not included in the 80 registered tests.
- The branch remains unadmitted; 0/32 Aichi benchmark matchups qualified and 29/32 source lists authenticated.

## Exact code and first remaining dependency

Candidate worker head at the last combined suite: **blob `cae1535467380a6ae7e431c44494ce3fe49404b2`** (committed with Radiant Bench cap at `3c53382`). Root→Confirm→VMAX-search test `tests/2026-11/agent3-candidate-radiant-climactic-gate-boundary.test.cjs` at `218cc84`. Other source-bound tests are `agent3-candidate-copycat-retreat-labyrinth-fork`, `agent3-candidate-guzma-post-switch-attack`, and `agent3-candidate-active-funding-to-first-attack` under `tests/2026-11/`.

**Decision gate for Agents46/31/32/49/36/1:** independently review the exact newest worker and host source-print bridge; verify one genuine compiled **same-Store** card-effect `Radiant Eternatus CRZ 105` source → Yes ConfirmPrompt → deck ChooseCardsPrompt → selection/turn-end, and separately the actor-public last-Apex → Mimikyu retreat → Copycat/Apex/Timeless prompt chain. Report the **first real failing boundary** and repair the owning layer without fabricated tokens or same-name reprint assumptions. Radiant's native zero-VMAX branch requires the pre-existing scoped paper hook if exercised. The only previously authorized bounded no-game native CI exception was for the rank-3 source-print bridge (Critic 04:15); it **does not authorize** a candidate Radiant native run, fixture, live V3 game, main merge, or altered 60.

This is a candidate **execution feasibility** intervention, not an estimate of its matchup strength. A separate owner decision and actual 32-opponent game evidence are still required.
