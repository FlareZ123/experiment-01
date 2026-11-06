# Agent36 issue25 acceptance packet

**Updated:** 6 November 2026  
**Purpose:** One auditable decision on the current common policy, the paid-retreat successor, and competitive release eligibility.

## Decision

- **SELECT v8 as the current developmental common-policy baseline.** It is the broadest executed bilateral policy profile and has the strongest source-attack execution evidence currently available.
- **Retain v4 and v5 as historical controls.** V4 is no longer the active developmental baseline.
- **DEFER v9 paid-retreat integration.** Its native A/B/A control gate failed. No treatment root was observed within its 128-root horizon.
- **Select no final 60-card deck.** No fixed 60 has passed the full-field competitive gate.
- **Competitive qualification: FAIL.** Paper-qualified competitive games: **0**. The 99.5% target has no demonstrated evidence.

V8 selection is strictly a research-policy decision. It does not imply that the candidate 60s are strong, that the opponent policy is competent, or that the native games qualify as paper tournament games.

## Evidence and release decision matrix

| Profile or experiment | Registered/native evidence | Main failure or limitation | Decision |
| --- | --- | --- | --- |
| Selected v4 | Eight registered arms across original ranks6/11; six 48-root caps, two engine errors. One physical Capture Energy deck-to-Bench attachment. | No settled source attack followed by consequential opponent response. | Historical control. |
| V5 Prize/promotion prompt treatment | Eight matched arms; one of two aborts rescued; seven 48-root caps, one error. | No qualified game and no source terminal. | Historical component experiment. |
| V6 common Thorns root | Eight prospective 96-root arms; four source-owned Volt declarations reached mandatory Energy prompts. | The first policy did not settle the Energy choice. | Superseded component baseline. |
| V7 owner Volt continuation | Five source attack declarations settled 5/5, with five same-epoch opponent roots. Six root96 caps, two engine errors. | The source owner's first observed return decision was Pass in 5/5 cases. Opponent policy remains weak. | Valid focused continuation component, integrated into v8. |
| **V8 broader common policy** | Eight registered contexts across original ranks6/11/1/3; both source seats represented; 128 roots per attempt. Independent audit: 20 source attack declarations, 19 settled, three source Prize transitions, 19 same-epoch opponent roots. | Three root128 caps, five engine errors, zero terminal games. Most opponent responses were Pass or otherwise weak. Rank11 cross-candidate source-deal fingerprints differ despite shared seed labels. | **SELECT for continued developmental policy work. Competitive admission FAIL.** |
| Agent42 natural paid-retreat A/B/A | Four fresh seed groups, two candidate 60s, three phases, 24 attempts. Agent42's report records one treatment root: Shadow Rider VMAX paid two Psychic to promote funded Latias ex, followed by Eon Blade for 200 and the final Prize. A/A' controls matched. However, the general audit does not yet verify that the pre-attack Active is the exact promoted target, and the natural archive lacks per-card Energy object identity. Treat the terminal line as a promising reported witness pending those joins. | One source terminal win and seven censored/nonterminal rows. Natural archive lacks physical Energy object identity for that game. Separate staged tests verify two-Basic-Psychic custody on both seats. | Promising policy component. Not yet integrated or release-qualified. |
| **V9 common paid-retreat A/B/A** | Exact eight v8 trial IDs/seeds, three phases, 24 attempts. All eight physical openings matched across A/B/A. Each phase returned eight rows. | A/A' root ledgers did not repeat. The native test failed `controlsRepeatedExactly`. B produced zero RetreatAction roots and zero root divergences within 128 roots. The known Agent42 positive is at root131 and was not in this seed cohort. | **DEFER. Invalid A/B/A control and inadequate horizon. No negative policy inference.** |
| Team Flare Grunt v1 | Intended Supporter PlayCardAction was accepted; card left hand and Supporter quota changed 0 to 1. | Card did not reach discard, no opponent Energy moved to discard, and the run aborted with `CANNOT_USE_POWER`. The effect remained unsettled. | Failed prompt-follow-through experiment. No denial result. |
| Night Watch seed audit | Four adjacent seed schedules showed the same first selection index; the original native archive corroborated the same first selection while later choices varied. | Shared entropy/seed coupling prevents treating the four adjacent seeds as independent random samples. | Require SHA-separated seeds and isolated streams for successor experiments. |

### Supporting records

- [V7 focused native report](agent36-issue25-common-v7-native-volt-continuation-20261106.md)
- [Independent v8 native audit](agent32-independent-v8-native-8way-audit-20261106.md)
- [V8 runner](../../simulation/evaluation/agent36-issue25-common-v8.cjs)
- [V8 registration](../aichi-2026/registrations/agent36-issue25-common-v8-broader-prospective-20261106.json)
- [Agent42 natural paid-retreat report](../aichi-2026/2026-11/agent42-four-fresh-seed-paid-retreat-prize-terminal-20261106.md)
- [V9 A/B/A failure report](agent36-issue25-v9-paid-retreat-aba-128root-20261106.md)
- [Agent20 independent v9 audit](agent20-v9-paid-retreat-aba-audit-20261106.md)
- [Twinleaf seed-stream isolation](../twinleaf/seed-stream-isolation.md)
- [V9 registration](../aichi-2026/registrations/agent36-issue25-common-v9-paid-retreat-aba-20261106.json)
- [V9 workflow run](https://github.com/FlareZ123/experiment-01/actions/runs/42246115429)
- [V9 uploaded artifact](https://github.com/FlareZ123/experiment-01/actions/runs/42246115429/artifacts/13519261081)
- [Team Flare v1 workflow run](https://github.com/FlareZ123/experiment-01/actions/runs/42227408708)
- [Agent20 Aichi retreat-modifier census](agent20-aichi-retreat-modifier-field-census-20261106.md)
- [Agent20 paid-retreat selector audit](agent20-two-unit-paid-retreat-proposal-audit-20261106.md)
- [Agent48 adjacent-seed Night Watch audit](agent48-nightwatch-adjacent-entropy-first-selection-20261106.md)
- [Agent48 original-native Night Watch corroboration](agent48-nightwatch-real-original-first-entropy-corrob-20261106.md)

## v8 selection rationale

V8 integrates the v7 owner-only Volt prompt continuation into a broader source-independent two-seat policy. Its four-rank sample and 19 settled source attacks provide substantially more policy-execution evidence than v4's six capped arms and two errors with no settled source attack. The three source Prize transitions are useful payoff evidence. The 19 same-epoch opponent roots show that the run progressed beyond isolated source actions.

The selection remains provisional for development. Five engine errors and three root caps remain. Most opposing responses are weak. No game reached a native terminal. V8 is not a complete paper-legal policy and does not establish a competitive win rate. The cross-candidate rank11 physical-deal mismatch also prohibits pairing those candidate rows solely by seed.

## v9 failure interpretation

The v9 runner and registration are preserved. The A/B/A run returned 24 rows and matched all initial physical-deal fingerprints. Its repeated A controls did not reproduce identical root ledgers. The test failed at `tests/agent36-issue25-common-v9-paid-retreat-aba.native.test.cjs:28`.

The runner manifest reports `randomnessProtocol: legacy-shared-prng`, `policyRandomIsolation=false`, and `physicalShuffleRandomIsolation=false`. This is a treatment-dependent randomness confound. However, `headless.runMatch` seeds `Math.random` from each request seed and restores it after the match, so sequential phase consumption alone does not explain the A/A' mismatch. Request-seed mutation, stateful wrappers, or another source outside the per-match RNG remain possible. The exact replay defect is unisolated. The zero treatment divergence is descriptive only. The treatment did not reach a RetreatAction in the 128-root window, and the known natural paid-retreat rescue occurs at root131.

Agent20's root-horizon objection is accepted. The next attempt must use a 240-root horizon. It must preserve the exact eight v8 trial IDs and seeds, and prove that each control reproduces the v8 first-128-root prefix before post-128 behavior is interpreted. Add the known Agent42 rank1 root131 context as a separately labelled retrospective canary.

## Hard competitive release gates

| Gate | Current status | Required evidence |
| --- | --- | --- |
| One fixed, legal 60-card paper Expanded deck | **FAIL** | One unchanged 60-card list with exact counts, legal printings, and validated deck construction. |
| Full Aichi Open League 2026 Top32 field | **FAIL** | 32 exact, provenance-backed opponent 60s. Current inventory is 29/32; ranks23,25,28 are missing. |
| Exact historical physical printings | **FAIL / PARTIAL** | The 29 inventories are name/count authenticated. Agent17 found 120 Basic Energy copies across 22 ranks annotated with artwork released after the May 2026 event. Preserve original transcriptions and explicit printing substitutions. |
| Complete paper rules and card interactions | **FAIL** | Test the full Black & White-onward pool, including the Night Watch randomness mismatch and all retreat modifiers. |
| Owner-only information provenance | **PARTIAL** | Prove every decision uses only the acting owner's hand and public board state. Preserve hidden-information noninterference tests. |
| Effective paid-retreat cost and opportunity comparison | **FAIL** | Handle Latias ex Skyliner, Snorlax Block, Active GX attacks, incomplete attack metadata, Float Stone alternatives, unknown modifiers, and actual Prize value. Fail closed when the public state is insufficient. |
| Exact physical payment custody | **PARTIAL** | Expose the actual root Store via an inert `onRootStoreCreated(store)` hook from `headless.runMatch`; ignore speculative Store instances. Bind the accepted real Store RetreatAction and exact root ordinal to the Energy object identities, discard zone, promotion, quota, and subsequent settled attack. Verify the follow-on attack's `publicBoardBefore[sourceSeat].active.name` equals the promoted target printing. Current observer covers only Shadow Rider VMAX with two Basic Psychic and does not yet bind the actual root Store or root ordinal; its receipts remain unverified. |
| Team Flare Grunt follow-through | **FAIL** | Observe the pending prompt, choose only an eligible opponent-attached Energy, and verify physical discard movement before counting a denial. |
| Deterministic A/B/A controls | **FAIL** | Reset/isolate policy and physical-shuffle streams per trial and phase; reproduce identical root tapes. |
| Full games and competent opponent policy | **FAIL** | Complete native games with meaningful opposing responses and a credible decision policy for all 32 opponents. |
| Official 25-minute match adjudication | **UNVERIFIED** | Apply paper match clock and tournament termination rules. |
| 99.5% field game win rate | **NO EVIDENCE** | Per-opponent sample sizes, uncertainty, complete-game results, and a defensible field-weighting model. |

### New retreat-specific release vetoes

Agent20's census identifies Latias ex SSP 76 Skyliner and Snorlax PGO 55 Block in the authenticated field. The current paid-retreat selector reads printed Retreat Cost and some Stadium/Tool/status conditions, but does not consume the public abilityDetails needed for every effective-cost decision. The selector also needs explicit negative tests for a payable Active GX attack, incomplete Active attack metadata, a held Float Stone route, and payment classes beyond two Basic Psychic.

A successor must prove the acting owner's effective retreat cost before proposing a paid retreat. If an ability or restriction cannot be evaluated from public information, it must decline the proposal. A native accepted RetreatAction alone is insufficient. The full line must prove physical payment, target promotion, settled printed attack, damage, Prize transition, immediate opponent reply, and the source's next owner turn.

### Night Watch randomness veto

Agent48's adjacent-seed audit and original-native corroboration show deterministic first-choice coupling across four adjacent seed schedules. This is evidence about the seed/stream protocol. It does not establish intrinsic sampler bias. Successor experiments must use SHA-separated seed derivation and independently reproducible policy and physical-shuffle streams. Retain the historical observations without counting them as independent random samples.

## Required next actions

1. Agent48 and the simulation owners: implement and test deterministic per-trial/per-phase RNG isolation. Reproduce the v8 first-128-root control prefix.
2. Agent20 and Agent42: implement an ability-aware, fail-closed paid-retreat guard and expand physical custody beyond the two-Basic-Psychic VMAX case where needed.
3. Agent41: expose the actual root Store callback in the headless adapter. Agent42: bind v2 custody to that Store/root ordinal, fix the follow-on attacker identity join, add speculative-Store and Switch-before-attack negative fixtures, and verify root132's pre-attack Active is Latias ex SSP. Agent36: register a 240-root A/B/A preserving the eight exact v8 contexts and seeds, plus a separately labelled Agent42 root131 canary. Keep all errors, caps, and mismatched physical deals.
4. Agent5 and Agent17: recover the exact Team Flare pending prompt and validate a separately versioned follow-through.
5. Field researchers: authenticate missing ranks23,25,28 and resolve historical printing substitutions.
6. Policy researchers: improve opposing decision quality and complete-game evaluation before estimating any matchup strength.
7. [Agent36 v10 paid-retreat successor design](agent36-v10-paid-retreat-successor-design-20261106.md) records the staged 240-root, RNG, ability, and custody gates.

## Final status

- Current developmental policy baseline: **v8 selected**.
- Historical policy baselines: v4/v5 retained.
- v9 paid-retreat integration: **DEFER**.
- Final fixed 60-card deck: **none selected**.
- Paper-qualified competitive games: **0**.
- Original Aichi Top32 lists: **29/32**.
- Demonstrated 99.5% game win rate: **no evidence**.
- Demonstrated 99.5% event-match win rate: **no evidence**.
