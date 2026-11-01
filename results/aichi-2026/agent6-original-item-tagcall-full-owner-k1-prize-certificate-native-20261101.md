# Existing owner-K1 full Prize inference works on a genuine first-turn Tag Call Item search

**Agent 6 | 1 November 2026 | native noninvasive compatibility audit, no competitive games.**

## Question and exact source

The new [cross-turn 140-damage K1 rescue](agent6-cross-turn-owner-k1-native-speed-recovery-20261101.md) initially preserved only source-owner deck counts for Thunder Mountain and Speed Lightning at a first-turn Tag Call. The repository already contains the more principled [`captureOwnerK1`, `advanceOwnerK1` and `assessRequiredDeckPrinting` API](../../simulation/twinleaf/owner-k1-prize-knowledge.cjs), which reconstructs known Prizes by subtracting **own visible cards and actual owner deck** from the owner’s registered 60 only during an authenticated owner-deck search.

We preregistered a focused [compatibility falsification](registrations/agent6-firstturn-item-native-canonical-k1-accounting-20261101.json) at `98b7c30` before modifying the development adapter: **can the existing canonical K1 inference account for a first-turn Tag Call Item while its own deck search is unresolved, or will any in-flight card bookkeeping leave the inferred Prize multiset uncertified?**

We then added a default-off, read-only `includeCanonicalOwnerK1Snapshot:true` flag to the existing reversible owner Tag Call adapter. At its genuine **accepted original Store first-turn Tag Call owner `ChooseCardsPrompt`**, the adapter calls the preexisting `captureOwnerK1(state,seat,registeredOwnPhysical60)`. The resulting summary includes the exact six legitimately inferred Prize printings, `prizeInferenceCertified`, `unaccountedTotal` and the exact-print Thunder singleton classification; it makes no new decision itself. The source+opponent original 60s, matched physical source seeds, both option arms, native prompts and decision policies are unchanged from prior compiled run 41358800704.

## Genuine native result

[Compiled manual CI 41360281468](https://github.com/FlareZ123/experiment-01/actions/runs/41360281468) **SUCCESS**, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, exact main head `01bc3421b5ff19640581a06471bdac5b1358b22f`. [Unabridged original Store artifact 13104509685](https://github.com/FlareZ123/experiment-01/actions/runs/41360281468/artifacts/13104509685): ZIP **17,895 bytes**, independently checked SHA256 `825e3dab008e8292c91dddaa0159eb5a0bca7b487bf306474c61be07c5dd7670` against provider; JSON contains six fully retained native action ledgers, first-turn full owner K1 summaries and later settled source attack witnesses.

| Source seat and original seed | Authenticated full Prize inference | Thunder Mountain status at T1 owner Tag prompt | Actual T3 policy |
|---|---|---|---|
| **A / `2341469307`** | **6/6 Prizes inferred exactly**, `unaccountedTotal=6` | **`known-prized`**, **0** searchable Thunder copies | K1 carry OFF: dead G&H Stadium search, Pass; K1 carry ON: native two-card G&H payment, Speed attachment, settled **140** damage to Latias ex |
| B / `516187842` | **6/6 Prizes inferred exactly**, `unaccountedTotal=6` | `unknown` Prize status because **1** Thunder in searchable deck | Both policies preserve the same real G&H Thunder+DCE search, Volt Cyclone, opposing Girafarig KO and 1 Prize |
| B / `2411836147` | **6/6 Prizes inferred exactly**, `unaccountedTotal=6` | `unknown` Prize status because **1** Thunder in searchable deck | Both policies preserve the same Stadium-only G&H search, Volt Cyclone, opposing Mimikyu KO and 1 Prize |

In source seat A seed `2341469307`, authenticated `captureOwnerK1` reconstructed these **six registered Prize printings** solely from the source player's own legally observed deck, hand and public zones:

- `Captivating Poké Puff STS`
- `Faba LOT`
- `Guzma & Hala CEC`
- `Guzma BUS`
- `Thunder Mountain Prism Star LOT`
- `Trainers' Mail ROS`

The source therefore legitimately knows that its singleton Thunder is Prized and that one of its two G&H copies is also Prized, leaving the latter searchable. The source physically had four Speed Lightning in the T1 deck. The two other genuine source first-turn deck prompts produced a certified six-card Prize multiset without Thunder among them; the singleton was physically searchable in each case.

**All six new native trial attempts completed without exceptions.** All three paired source physical initial deals and actual opponent turn-two accepted action roots remained identical. Crucially, an independent direct comparison of the **entire original Store accepted root ledger against archived pre-audit run 41358800704** established **6/6 exact action-sequence equality**: 160 roots per arm for source A seed234, 40 per arm for source B seed516, and 160 per arm for source B seed241. Source deal digests also matched in all six historical-versus-new comparisons. This is an unusually strong no-decision-perturbation witness for the generic K1 **read-only** capture at a genuine first-turn Item search.

## Meaning and integration recommendation

The feared missing in-flight Item accounting **did not occur** in these original native Tag Call searches: `unaccountedTotal` exactly equaled the public remaining six Prize cards on every attempt, so existing general `captureOwnerK1` genuinely certified the full Prize multiset. This establishes a direct positive bridge from the preexisting owner-K1 machinery to a naturally dealt Aichi source-first Item line.

The earlier *decision* flaw remains: despite having obtained legal K1 on T1, a later policy that does not carry that certified knowledge may still waste G&H on a known-Prized singleton and fail to attack. Future shared policy work should **reuse** `owner-k1-prize-knowledge.cjs` with owner-/game-scoped persistence and its existing conservative mutation invalidation API. The narrow `agent6-owner-k1-turn-bridge.cjs` is an opt-in proof of causal value, and should not become a competing general knowledge system. An isolated Prize-count check alone is insufficient when Prize identities could swap without changing count. Only prior legitimate own-deck searches may authorize K1; K0 must stay owner/hidden-information-safe.

This noninvasive three-deal selected comparison does **not** establish universal correctness across all Item-resolution paths, full-game owner-knowledge update coverage, viable opponent behavior, paper-clock outcomes, deck optimality or any aggregate game win rate.

**29/32 original exact Aichi lists, zero competitively qualified games, no demonstrated 99.5% fixed-60 win rate.**
