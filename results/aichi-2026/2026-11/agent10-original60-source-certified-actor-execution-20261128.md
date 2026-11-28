# Original-60 Shadow Rider: source-certified actor paths that previously could not execute

**Research checkpoint:** 2026-11-28, Agent10 normal mode. **Status:** review-only coherent candidate and rank-2 opponent workers; no native game, no matchup qualification, no endorsement of a 99.5% result.

## Decision and working branches

- Fixed source candidate: [Hood Shield Shadow Rider V1, 60](../../decks/hood-shield-shadow-rider-v1-expanded-legal-60.md). **No cards changed.**
- Integrated candidate policy + prompt projector + certified source bridge: `agent10/candidate-supporter-continuation-20261128`.
- Separate original Aichi runner-up rank-2 control opponent worker: `agent10/rank2-v2-selective-executable-continuations-20261128`; **39/39** focused V8 strict-protocol groups on that opponent, without a native game.
- Native Twinleaf pinned source used for effect shapes: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Original 60 source-print identity is a different requirement from the native `fullName` ID.

## Materially repaired actor→effect paths

| Original source-60 line | Previous executable-policy failure | Replacement on review branch |
| --- | --- | --- |
| Guzma | First opponent gust scored against departing Active even though Guzma forces an own Bench switch | Score actual paid successor attack; opponent target vs actor promotion kept distinct |
| Forest Seal Stone → Star Alchemy | Tool `PlayCardAction` and once-per-game VSTAR root not selected | Physically attach to legal Pokémon V; select source-bound ability; search deck only for a needed piece |
| Stealthy Hood | All targetable Tools received identical root score, wasting the Tool on filler instead of VMAX Underworld Door | Verify physical actor-owned target, Tool slot occupancy and opponent lock; reserve VMAX Tool slot |
| Float Stone → free retreat | Singleton Tool never selected though retreat consumer existed | Attach on actual Active only when the next retreat enables a better already-paid Bench attack |
| Hisuian Heavy Ball | Temporary legal Prize reveal rejected as hidden because original Prize slots remain face down | Require genuine actor-owned temporarily revealed Prize objects, exact native Basic-only filter and source; project only legal Basic choices or explicit empty selection |
| Raihan | No Supporter root or non-Underworld discard-to-board AttachEnergyPrompt adapter | After actual prior-turn KO, attach physical Basic Energy from public discard to Active/Bench, then search for one source-bound card; does not consume ordinary Energy attachment |
| Teammates | KO-gated Supporter root never selected | After confirmed prior-turn KO, retrieve two legal source-bound deck choices |
| Acerola | Damaged VMAX recovery root unselected; generic prompt failed to distinguish damaged same-print physical targets and could not select Active | Root gated by damaged prized board; exact actor-owned physical Bench/Active target and missing-source fail-closed |
| Iono | Card never selected as root | State-gated hand-disadvantage disruption with one-Supporter contention |
| Pokémon Ranger | Unable to unlock legitimate Budew Itchy Pollen attack Item lock | Select only with public previous-turn Budew attack, current Item lock, an Item to use, and no enduring opponent Vileplume Ability lock |
| VS Seeker / Wonder Tag | Could fetch strategically unplayable KO-gated Teammates/Raihan or heal-less Acerola; excluded competing Supporter | Carry real public prior-KO receipt into source-bound Supporter scoring, enforce current playability and existing hand contention |
| Second Shadow Rider V and Max Geist exact KO funding | Agent1 independently found missing second engine setup and +30 lethal Energy turn | Reused Agent1's **original code behavior and tests** on the same integrated worker; not claimed as independent discovery |

Critically, **the native projector runs before the certified source-printing bridge**. Pinned native card names are `Raihan EVS` and `Hisuian Heavy Ball ASR`, while the paper source IDs are `Raihan EVS 152` and `Hisuian Heavy Ball ASR 146`. The projector now accepts only those exact verified pre/post native labels, and the worker requires the complete *post-bridge* paper identity. Physical discard/Prize source custody, target ownership, and native prompt validation remain mandatory. Review-branch bridge file is Agent32's PR #94 module copied **unchanged** as a dependency, not invented or reimplemented here. Its full host integration changes in `simulation/twinleaf/actor-observation-contract.cjs` were **not** adopted.

## Concrete replay evidence

Executed in isolated synchronous V8 CommonJS against **the real fetched policy/projector/protocol source and Agent32 bridge**, using thin `node:test` / `node:assert/strict` shims (no mocks of worker decision logic):

| Suites | Focused groups | Result |
| --- | ---: | --- |
| Agent1 second engine and exact Max Geist knock-out preconditions | 42 | 42 passed |
| Agent10 Guzma, Forest Stone, Hood, Float Stone | 34 | 34 passed |
| Agent10 Heavy Ball complete path and native Prize projector | 22 | 22 passed |
| Agent32 paid-color and native-shaped Underworld Door root/attachment | 38 | 38 passed |
| Agent10 Raihan projector and full two-prompt continuation | 24 | 24 passed |
| Agent10 Teammates/Acerola/Iono and attack-locked Ranger | 26 | 26 passed |
| Agent10 VS Seeker playability and source-certified pre/post bridge | 15 | 15 passed |
| **Total** | **201** | **201 passed, 0 failed** |

All test files are under `tests/2026-11/` and retain individual source/target and both-seat negative controls. Representative decisive integrative test: `agent10-native-raw-to-certified-raihan-heavy-ball-actor.test.cjs`: projects actual pinned **native-shaped** Raihan/Heavy Ball prompts, maps them with certified full-60 synthetic map (58 Basic Psychic + 1 Raihan + 1 Heavy Ball, **contract test only, not an original Aichi candidate deck**), and verifies the candidate worker picks a legal physical Basic Energy or Prized Mimikyu. Map-cloning/mutation negatives are included. Native Judge/Store and original full-60 loading are not used.

Recommended Node replay **not executed here**:

```bash
node --test tests/2026-11/agent1-candidate-second-v-early-engine.test.cjs \
  tests/2026-11/agent1-candidate-maxgeist-lethal-attach.test.cjs \
  tests/2026-11/agent10-*.test.cjs \
  tests/2026-11/agent32-candidate-colored-cost-fork.test.cjs \
  tests/2026-11/agent32-candidate-underworld-door-root.test.cjs \
  tests/2026-11/agent32-candidate-underworld-door-attach-energy-prompt.test.cjs
```

## What this does and does not establish

**Established:** previously unreachable functions of the *unchanged* fixed 60 now have bounded, source-authorized actor actions and decisions, with concrete regressions; identical-print physical targeting and legal Prize reveal no longer conflate game state or visibility.

**Not established:** a compiled pinned-native Store start-to-finish witness, any competitive bot's actual use of the new line, legal complete 60 loading through the PR94 host observer, matchup performance, full 32 opponent coverage, or a 99.5% win rate. Current qualifying original Aichi evidence remains **0/32**. Three original Top32 source decks (ranks 23, 25, 28) remain unauthenticated in current collection.

**Priority for owners:** selectively integrate the complete actor chain with PR #94 certified source bridge (pre-driver SHA), PR #86 actor tags and exact original-60 native resolver, then run a single owner-authorized **capped native, no-game root→first prompt→final Store dispatch** for the Raihan and Heavy Ball paths before considering any game. If that cannot complete, do not escalate to gameplay and do not report wins. Coordinate with Agent36/49/46/32 owners, and use the original Aichi Top32 field rather than a convenient subset for eventual performance evidence.

The rank-2 opponent branch also needs a native two-switch Guzma continuation witness. Neither branch is a frozen V3 policy admission.
