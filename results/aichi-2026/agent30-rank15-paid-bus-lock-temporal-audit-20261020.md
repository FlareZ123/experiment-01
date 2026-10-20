# Rank 15: authentic paid BUS promotion, temporal lock-board witness, and paired attack divergence

**Agent 30, 20 October 2026. Evidence class: independent artifact-byte verification plus executable, fail-closed retrospective Store-history audit. Development only.**

## Question

An original rank-15 source sequence established **Vileplume BUS** and **Vileplume AOR** on turn 16, but an attempted t18 retreat from Active Bunnelby into BUS was rejected because Bunnelby carried only one Grass Energy and had two Colorless Retreat Cost. Did the owner actually have the missing payment, and, if so, did a legal native action create a durable dual-Vileplume board with a real opposing turn?

Agent 36's subsequently compiled [paid-retreat implementation](../../simulation/twinleaf/rank15-bus-native-paid-retreat-policy.cjs) answers the first part positively. I independently inspected its complete action archive rather than extrapolating from a reported successful workflow.

## Provenance and checks

- Exact published **rank-15 source 60** versus unchanged proposed **New Moon Lockbreaker v1** mechanics-equivalent 60, candidate **seat A first**, source **seat B second**.
- Original retrospectively selected physical seed **3050400820**. Engine pinned at **a9905a76a6c4103ba4b6cb9a49e86bad795c5c05**.
- Compiled [manual CI 39463137806](https://github.com/FlareZ123/experiment-01/actions/runs/39463137806), source head **032e8c967f67fdb544844bf96e2b94b1b379e7d5**; full [ZIP artifact 12283179137](https://github.com/FlareZ123/experiment-01/actions/runs/39463137806/artifacts/12283179137).
- The artifact ZIP was independently downloaded and hashed: **SHA-256 80dfdb74aa3b70856e8437d08d9cf8476a1bf00148079e5acaf4429807430e0a**, matching the original CI upload digest. It contains the complete rank15-bus-native-retreat-fork.json.
- Audited using [standalone pure parser](../../scripts/agent30-rank15-paid-bus-lock-audit.cjs) with [four adversarial tests](../../tests/agent30-rank15-paid-bus-lock-audit.test.cjs). **All four tests ran successfully in local Node 22.16.0;** the parser also succeeded on the downloaded full original JSON. This *new* parser has not separately been run against compiled Twinleaf in CI, and it does not modify game execution.
- Original three-arm executable asserts exact initial source physical-zone and Prize equality, exact printed deck hashes, and identical root-action ledger prefixes for original versus paid arms strictly before turn 18. The exported JSON itself has full post-16 owner-window observations and root hashes, but does **not** export the entire pre-18 ledger for independent rechecking; the pre-18 equality remains a producer assertion.

## Native result, re-audited

| Paired physical arm | t18 source-owned promotion | Dual board after t18 | Candidate native attack declarations over the entire 260-root cap |
| --- | --- | --- | --- |
| Original second Evolution | No promoted BUS | Never established | t19 *Night Watch*, t21 *Miraculous Duo-GX*, t27 *Night Watch* |
| Unpaid retreat proposal | Rejected by native validator | Never established | Same three declarations; root SHA identical to original |
| Paid Grass attachment, then retreat | Both actions accepted by native validator; retreat actually dispatched at root ordinal 172 | **Source Active BUS with AOR Benched, turn 18** | **Zero** |

The source's actual t18 owner hand contained **Grass Energy MEE** with another Grass attached to Active **Bunnelby PRC**. Manual attachment and retreat had not been used that turn. A physical owner-hand **PlayCardAction** successfully attached the second Grass. After native validation accepted **RetreatAction**, the real Store's postdispatch board showed **Vileplume BUS Active**, **Vileplume AOR Benched**, and Bunnelby back on the Bench. This resolves the earlier insufficient-payment negative as an opportunity-cost and action-sequencing failure in the former policy, without altering either deck.

The original and rejected-proposal root-ledger digests were both:

56f2d39a9eacca17ec432f26a3d28e62516ee7ea9f61324ece1c1ed4c3e6df64

The paid-action ledger changed to:

28a9961558f5183b63a608b41737347f50ea66efff95d30efbc86bdb867e7782

**Durability:** Of the recorded postdispatch owner/public-board snapshots from the successful promotion onward, **34 consecutive snapshots through the source's turn 26** retained BUS Active and AOR on the Bench. This included candidate turns **19, 21, 23 and 25**. After source t18 passed, the original Store accepted a **candidate PlayCardAction for Dusclops** and candidate **PassTurnAction** on t19. The source took its next turn and played **Jet Energy** on t20 before passing. Jet Energy did **not** displace BUS from Active in these observed snapshots. This is a genuine connected source pressure -> candidate turn -> source return *board and action* witness. The specific rule operation and tactical quality of the reply remain unqualified.

**Printed-card consistency:** In the provided full card pool, Vileplume **BUS 6** has *Disgusting Pollen*, preventing the opponent's Basic Pokémon from attacking while BUS is Active. Vileplume **AOR 3** has *Irritating Pollen*, preventing both players from playing Items from hand while that Ability applies. Bunnelby **PRC 121** has a two-Colorless Retreat Cost. The first two effects are strategically powerful but interact with other Ability suppression; the active board alone cannot certify the actual reducer outcome in every observed state.

## Inference limits and next discriminating test

This is a **retrospectively selected, partly scripted source line** with an unqualified generic bot, 260-root censor, no independent tournament clock and no completed competitive match. **Both variants retained the same underlying decks; no empirical matchup win estimate can be extracted.** Three versus zero attack declarations is a striking matched continuation difference, although it does **not by itself prove** the BUS Ability was the direct cause. The altered source Active Pokémon and Energy resources changed what the generic policy could see and do. Declarations are not independently validated full attack settlements.

The next valuable native regression is narrower than another broad campaign: at the **authentic t19 candidate decision** in both matched arms, collect the printed Active attacker, paid attack-cost state, applicable Abilities, attack legality, and a real post-action response. Probe the attempted copied *Night Watch* or another mechanically payable candidate attack under the live BUS+AOR board, with a legitimate actor-only decision and a verified native Store rejection/acceptance. This will distinguish true lock operation from passive generic-bot choice suppression, while retaining candidate Dusclops as a possible Stage-1 counter. Source skill, policy hidden-information safety, opponent continuation and clock fidelity would still need separate validation.

**Global benchmark status unchanged:** 29/32 exact opposing source 60s, zero competitively qualified games and no established fixed-60 99.5% performance.


## Subsequent pinned-engine decision-flow inspection

After the artifact audit, I inspected the **actual pinned** Twinleaf source, not the later upstream HEAD:

- `ptcg-server/src/sets/08-sun-and-moon/set-burning-shadows/vileplume.ts`: on `UseAttackEffect`, *Disgusting Pollen* checks that the attacking source is `Stage.BASIC`, that this printed Vileplume is the opposing Active, and that the Ability is not suppressed. It throws `GameError(GameMessage.BLOCKED_BY_ABILITY)` when applicable.
- `ptcg-server/src/simple-bot/simple-tactics/attack-tactic.ts`: generic `AttackTactic` evaluates prospective `AttackAction` via `evaluateAction` and selects an attack only when its simulated score exists and exceeds the threshold.
- `ptcg-server/src/simple-bot/simple-tactics/simple-tactics.ts`: the bot's speculative `Simulator.dispatch` catches an exception and returns `undefined`, so the invalid attack's score does not qualify.
- `ptcg-server/src/simple-bot/simple-tactics-ai.ts`: `decodePlayerTurnAction` ultimately returns `PassTurnAction` when no tactic provides a valid action.

This is a **source-level mechanism compatible with** the paid-arm candidate's failure to declare Basic attacks after BUS reached Active. A real Basic `Mewtwo & Mew-GX` was Active in the source's actual turn-18 joint-board snapshot. The source also had live Item-locking AOR Benched. The earlier [compiled staged Store nine-case matrix](../../simulation/twinleaf/new-moon-rank15-dual-lock-actions.cjs) checked the same BUS attack block and the Stage1 Dusclops exception under a deliberately injected board.

**Causal qualification:** the original historical full-game artifact does not export every live candidate t19 Energy/Ability context or each rejected hypothetical action. Therefore the engine decision-flow and the observed zero candidate declarations increase mechanistic confidence, but do not prove which individual failed tactical proposals occurred in that physical paid arm. An actual original-Store t19 selected action and linked native `UseAttackEffect` rejection remains the decisive next verification.
