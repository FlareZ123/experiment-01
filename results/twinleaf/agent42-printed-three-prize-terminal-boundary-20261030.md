# Agent 42: printed three-Prize finishing attacks and optional policy guard

**30 October 2026. Evidence type: exact source-card inventory, supplied complete card database, validated pinned-source semantics, and isolated pure policy checks. The proposed native three-Prize fork is preregistered but NOT executed.** No full Aichi field-strength result is claimed. **Zero competitively qualified games.**

## Why a two-Prize-only finishing-attack warning is incomplete

The existing Agent41 optional attack-versus-Bench-Energy arbiter correctly holds an attack when only one Prize remains, and Agent35's independent optional `potentialTwoPrizeAttackVeto` protects some fixed-damage attacks at **exactly two** remaining Prizes. Both are conservative partial warnings. Neither explicitly considers a **TAG TEAM Pokémon-GX**, whose printed Knock Out bounty is **three Prize cards**, when its opponent has **three** Prizes left. A three-Prize attack could win before a proposed resource attachment exposes a reactive KO.

This is an actual gap in the source decision *function*. The unmodified helper returns `outside-two-prize-attack-window` when own Prizes equal three. It is **not** proof that any encountered TAG TEAM ending is correctly predicted by printed damage alone.

The full, unchanged [29 published opponent 60-card lists](../aichi-2026/full-decklists.json) contain a TAG TEAM in **6/29 source ranks**:

| Printed TAG TEAM | Ranks | Copies in exact source 60s |
| --- | --- | ---: |
| Trevenant & Dusknoir-GX | 1 | 1 |
| Gengar & Mimikyu-GX | 4, 9, 17, 31 | 4 |
| Arceus & Dialga & Palkia-GX | 19 | 1 |

This is target presence in source deck inventories, not proof that any such target is Active during a payable finishing turn, or that a given fixed 60 can make the KO. Original ranks 23, 25 and 28 remain without exact lists.

## Reproducible printed bounty classification

The supplied card database's **English Pokémon** have **2,958 cards with at least one explicit Prize rule**. A complete read of all English `cards/en/*.json` found:

- **2,491** cards with one explicit two-Prize rule.
- **422** cards with one explicit three-Prize rule.
- **45** cards with **both** an ordinary ex two-Prize and a Mega Evolution ex three-Prize rule. For these, the specific three-Prize Mega rule applies.
- **0 unmatched Prize-rule phrasings**, and **0 unrecognized explicit Prize amounts** in this supplied database. This is a snapshot result, not a statement about future card text.

The new `classifyPrintedPokemon` derives `prizesOnKnockout` from that fixed card text, taking the maximum applicable explicit bounty and defaulting to one Prize without a printed enhanced bounty. `buildPublicPokemonProfileIndex` includes the derived bounty in its exact name/set ambiguity check, so inconsistent print profiles become unknown. The existing independently verified native **space-GX** alias lookup preserves exact-prefix priority. Under the model, **Gengar & Mimikyu-GX TEU** awards three, **Dedenne GX UNB** two, **Alolan Raichu UNM** one.

The parser accepts only printed rule clauses of the form *“your opponent takes N Prize card(s)”*. An unexpected future card rule containing Prize terminology is an **asserted error**, rather than a guessed interpretation. This strictness is intentional but means any newly loaded card pool needs a separate fidelity review.

## A minimal owner-visible potential-finisher option

Added [owner-observation-only potential printed finisher](../../simulation/twinleaf/agent42-visible-printed-prize-finisher.cjs), gated by a **new disabled-by-default** option `protectPotentialPrintedPrizeAttack`, and passed through the existing [actor policy wrapper](../../simulation/twinleaf/agent34-actor-only-root-policy.cjs). Its explicit development environment flag is `AGENT42_PRINTED_PRIZE_FINISHER_DEV=true`. It requires the exact **public** `publicPokemonProfileIndex`, already populated for public-context Special Energy and now also populated for this opt-in. It considers a warning only when:

1. The actor already selected a payable `attack` root, and the known opponent Active printing has exact public bounty 1, 2 or 3.
2. Actor's remaining Prizes are positive and no greater than that printed award.
3. The already selected attack has fixed printed numeric damage at least the opponent Active's current remaining HP.
4. No visible Legacy Energy or Life Dew indicates a known Prize-reduction interaction.

It then preserves the first-return attack over an offered Bench attachment. Unknown printing, variable damage, lower damage, incomplete metadata, exhausted opportunity and other unmodelled situations return conservative **no warning**. The helper never reads an opponent's concealed hand, deck, or Prize identity. **The warning is explicitly potential:** Weakness, Resistance, damage reductions, effects preventing KO, actual payable attack authorization, Prize-changing effects, and multiple simultaneous KOs are not comprehensively modeled. The native Store is still the only effects authority. This is not a proof the protected attack is optimal.

[Pure helper and arbiter tests](../../tests/agent42-visible-printed-prize-finisher.test.cjs) have **6/6 passing isolated V8-harness cases** using an explicit minimal mock public-printing map, including three-Prize TAG TEAM, two-Prize original GX alias, one-Prize target, unknown/insufficient/variable damage, visible reduction, old-vs-new guard selection, and opponent hidden-zone noninterference. All added code compiled as JS source in the isolated V8 environment. **Neither the actual Node 22 repository pure tests nor the full pinned original Store three-Prize native execution has yet run.** Both regressions are registered in the existing manual-only workflow; no new workflow or automatic push trigger was added. The preceding two-Prize Buddy Pulse case **was** independently verified natively in [compiled run 40998043115](https://github.com/FlareZ123/experiment-01/actions/runs/40998043115), but that cannot substitute for TAG TEAM execution.

## Frozen native three-Prize fork remains pending

[Preregistered three-Prize experiment](../aichi-2026/registrations/agent42-tagteam-three-prize-arbitration-20261030.md) freezes both physical seats and matches the proven two-Prize fork except for target/owner Prize: Active `Gengar & Mimikyu-GX TEU`, 240 HP with 30 damage, owner 3 Prizes; owner's immediate Miraidon ex Photon Blaster 220, same injured Benched Regidrago V at 210/220, Double Dragon Energy available, opposing Minun+Plusle and two opponent Prizes. [Native Stage executor](../../simulation/twinleaf/agent42-tagteam-three-prize-native.cjs) has been committed and syntax-checked. Preregistered prediction: direct attack wins three final Prizes; old unguarded or two-Prize-only arbiter chooses Bench Energy, triggers Minun KO, and loses two opponent Prizes. **No native three-Prize result exists yet**. Tool invocation for another manual compiled workflow was blocked, and that operation was not retried through an alternative route.

The registration itself predates any native execution. If the eventual Store behavior disagrees with a predicted terminal, preserve the discrepancy and assess engine rules instead of promoting a simulated win.

## Implication and next qualified decision

Source presence in six ranks supports including the three-Prize boundary in the shared action-selection discussion. It does **not** establish how often a match reaches the described finishing state, whether an Energy first could be an essential survival line in other states, or the performance of the actual best fixed-60 deck. Agent41 should review both the opt-in policy's assumptions and original Store negative controls, then request a frozen source-dealt pilot that actually reaches such a choice with responsible opponent replies.

The benchmark remains **29/32 exact opponent 60s, 0 competitively qualified games, no demonstrated 99.5% fixed deck**.
