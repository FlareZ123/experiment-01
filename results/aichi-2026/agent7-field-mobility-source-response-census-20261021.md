# Paper Expanded Aichi Top-32: printed opponent self-mobility recovery channels

**Agent 7 | 21 October 2026.** Evidence type: deterministic original published 60-card source inventory census, checked printed effects, independent rules interpretation. **Zero newly simulated games.** Does not repair or qualify the playing policy.

## Question

After [Agent42's genuine native T6 Escape Rope](agent42-native-sourcefirst-escape-rope-20261021.md) caused a rank-11 New Moon loss-to-win engine reversal under weak source play, what printed mobility opportunities exist across the actual Aichi opponent field? The decisive distinction is **potential source-deck access** versus **a native source player actually holding, selecting and settling a legal recovery line**.

## Frozen source inventory and method

Read [29 published exact 60-card decks](full-decklists.json) from the 10 May 2026 event. The other three ranks (23, 25, 28) remain unavailable. For each source count only five **exact card names** whose printed effects conditionally permit bringing a charged Benched Pokémon Active without paying a forced Active Pokémon's ordinary printed Retreat Cost. The script is [agent7-source-mobility-roster.cjs](../../scripts/agent7-source-mobility-roster.cjs), guarded by [four reproducible tests](../../tests/agent7-source-mobility-roster.test.cjs). Names and counts were independently recomputed directly over the repository's source JSON; automated CI dispatch was safety-blocked in this invocation, so the Node test itself **has not been run in Actions**.

| Printed channel | Copies in 29 source 60s | Tactical and resource condition |
| --- | ---: | --- |
| Guzma | 48 | Use an available Supporter to gust an eligible opponent Bench Pokémon, then switch own Active with chosen Bench. Supporter quota and target geometry matter. |
| Float Stone | 24 | Attach a Tool to an eligible Pokémon, then use normal retreat for no Energy if retreating is otherwise allowed and unspent. Tool slot, lock and temporary restrictions matter. |
| Escape Rope | 11 | Play an Item; each side switches with an eligible Bench Pokémon and opponent chooses first. It can expose an undesirable target or permit an opponent escape. |
| Prime Catcher | 3 | ACE SPEC Item gust plus own switch, if opponent has a Bench target and Item/ACE access is legal. |
| Jet Energy | 5 | A hand attachment to a Benched Pokémon can move it Active. Attachment quota, Special Energy lock and Bench geometry matter. |
| **Total counted named copies** | **91** | Overlapping resources, never 91 independent rescue successes. |

All **29/29 published lists** contain at least one of these five printed names; per-list counted copies range from **1 to 6**. Rank 31 has only one counted copy (Escape Rope); rank 11 has six (3 Float Stone, 2 Guzma, 1 Escape Rope); rank 6 has three (3 Guzma). This is a narrow inventory statement about known full printed 60s. The missing three rank lists are excluded, and other recovery mechanisms such as Scoop Up Cyclone, search, recycling, Pokémon attacks or Abilities are deliberately omitted.

## Counterplay implication

A source opponent that repeatedly passes with an uncharged, forced-promoted Active while its previously charged attacker remains on the Bench has a **decision-competence failure hypothesis** that must be checked against *actual owner-hand/known-deck resources*. A printed source list containing Guzma does not prove one was in hand, the Supporter was still available, or its effect would be legal and superior at that point. Equally, an engine game in which a weak opposing bot never tries available ways to regain its attacker does not establish a robust counter-deck victory.

The actual rank-11 New Moon Rope treatment produced an authentic T6 Item, opponent-first switch, T7 source Pass and eventual New Moon engine win. The source has three Float Stone, two Guzma and one Rope printed, with access-dependent VS Seeker/Secret Box routes. [The specific rank-11 recovery taxonomy](agent7-rank11-ropesource-recovery-crosswalk-20261021.md) describes why source-root T7 needs an own-hand legality and Store-satisfaction audit before any claim about tactical dominance. In rank-6 Iron Thorns, the three Guzma and three VS Seeker are similarly not proof that post-Rope source switching was actually affordable or available.

## Required validation

Run a source-agnostic owner-visible source switch/recovery policy against the **same actual historical physical deal** first, preserving every selected action, native prompt, no-op, legal reject, source continuation and resulting candidate decisions. Compare with the unchanged weak control; distinguish a missing card from a missed available action. Only then test prospectively frozen independent seeds in both actual-start orders, with broader adversarial policy and paper-clock qualification.

This census is a **policy-recovery prioritization tool**, with known incompleteness and no prospective matchup evidence. The current evidence still supports **29/32 exact source lists, zero competitively qualified matches, no final fixed 60**, and no demonstrated 99.5% rate.
