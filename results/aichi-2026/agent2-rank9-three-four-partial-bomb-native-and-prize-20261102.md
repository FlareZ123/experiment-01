# Rank-9 Electrode-GX: paper-legal 3/4-card partial Bomb native Mega Absol attack + exact Prize-ceiling revision

**Agent 2 | 2 November 2026 | printed card + official ruling, staged real pinned Store, exact combinatorial analysis | zero qualified competitive games**

## Why this changes an important necessary condition

The original authenticated Shun Ito rank-9 Aichi source 60 has **4 Prism, 2 Darkness and 1 Telepathic Psychic Energy**, just seven physical Energy cards. Its Electrode-GX CES48 can attach Energy from discard to modern lowercase Pokémon ex, including original MEG86 Mega Absol ex. Previous [Agent29 five-card source research](agent29-rank9-electrode-modern-ex-native-chain-20261102.md) correctly demonstrates a complete five-Energy packet and quotes an initial-Prize availability ceiling requiring at least five unprized Energy.

However, Pokémon's [official Japanese Electrode-GX Q&A](https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%83%9E%E3%83%AB%E3%83%9E%E3%82%A4%E3%83%B3GX&regulation_faq_main_item1=all) explicitly permits **using Extra Energy Bomb with fewer than five Energy in discard** and requires transferring **all available cards** (for a positive quantity under five). If at least five exist, selecting fewer than five is prohibited. This follows the supplied Advanced Player's Rulebook v3.4, II-A exception for insufficient quantities. It opens a **three-card** packet sufficient to pay Mega Absol's printed `Darkness, Darkness, Colorless` Claw of Darkness when the packet includes two Darkness-capable physical cards.

**Combinatorial point:** Any three-card subset of the original seven Energy contains at least two of the six Darkness-capable cards (four Prism + two Darkness), because the only non-Darkness-capable card is the one Telepathic Psychic Energy. Therefore **all 35 physical three-card subsets** can pay `D,D,C` on Basic Mega Absol if abilities and costs have no intervening modifiers. This is an Energy-payability result, distinct from a claim that the cards will be in discard, unprized, or legally playable against a specific opponent lock.

## Real pinned native test: 3 and 4 Energy

Implemented [six two-seat source-representative regressions](../../tests/agent2-rank9-partial-bomb-native.test.cjs) under the existing optional [card-specific paper hook](../../simulation/twinleaf/electrode-gx-energy-hook.cjs). **[Compiled workflow 41500841457](https://github.com/FlareZ123/experiment-01/actions/runs/41500841457) succeeded 42/42 full job tests**, including all six new cases.

- **3-card packet:** two original Prism ASC and one Basic Darkness (SVE equivalent of original MEE printing) from owner's discard were transferred to genuine original MEG86 Mega Absol, in owner physical seat 0 and seat 1.
- **4-card packet:** three original Prism ASC and one Darkness SVE equivalent were similarly transferred, both seats.
- In all four positive instances, Electrode-GX CES48 self-Knocked Out, the **opponent took exactly two actual physical Prizes**, and the Mega Absol remained Active with the transferred physical Energy cards. A genuine `AttackAction('Claw of Darkness')`, native opposing-hand `ChooseCardsPrompt`, and subsequent native attack-animation continuation caused **200 settled damage** to a surviving Regidrago V SIT and physically discarded an opponent's Fog Crystal from its hand.
- In both negative owner seats, **five** physical discarded Energy were available and an attempted transfer of only **four** was rejected by the opt-in card-specific correction, leaving all five still in discard.

These observations directly test the **native effect and actual same-turn attack under prepared board assumptions**. They do **not** show the printed original 60 starting naturally, playing Evolution and discard Items on schedule, overcoming the opponent's decision policy, or winning a normal match. The real Mega Absol print is checked by Agent29's source controls; this extension reuses its compiled name `Mega Absol ex M1L`, resolved to original MEG86 by the pinned registry. The source representative energies are the above exact physical profiles. The stage uses synthetic opposing hand, deck and Prize fillers, and no paper-competition score is inferred.

## Exact original six-Prize, Basic-valid first-seven resource ceiling

Extended the source's exact six-Prize enumeration from a **five** unprized Energy requirement to **three**, preserving all other printed prerequisites: the singleton Voltorb and singleton Mega Absol must be unprized, at least one of the two Electrode-GX must be unprized, and the opening seven must have a Basic. This only compares **physical Prize availability without retrieval**. The full original rank-9 printed Basic count is eleven, including Voltorb and Mega Absol.

| Physically unprized Energy threshold | Exact probability conditional on Basic-valid opening seven |
| --- | --- |
| At least 3 | **80.7816191125849%** |
| At least 4 | 80.68932794155074% |
| At least 5, Agent29's prior full-packet bound | 79.19623419896161% |

For the **three-card** threshold, the reduced exact fraction is:

`4371513615743 / 5411520174720`.

This is approximately **1.585385 percentage points higher** than the five-card physical prerequisite. It is still far below a certainty due principally to the protected original singleton roles and remaining Electrode requirements. The 80.78% is an **upper bound for unprized resource readiness**, not a play-sequencing, first-attack, timed-match or win probability.

Reproduction: [BigInt exact enumeration](../../scripts/agent2-rank9-three-energy-bomb-prize-window.cjs), [four independent assertions and five-threshold cross-check](../../tests/agent2-rank9-three-energy-bomb-prize-window.test.cjs). [Compiled workflow 41501361085](https://github.com/FlareZ123/experiment-01/actions/runs/41501361085) succeeded **13/13 pure tests and 42/42 pinned native tests**; its exact-bound receipt reported numerator `4371513615743`, denominator `5411520174720`, probability `0.8078161911258491`.

The stronger requirement `at least five unprized` remains appropriate for a **complete five-card transfer**, but must not be called a necessary prerequisite for **any** Electrode-GX into Mega Absol attack line.

## Highest-value newly identified natural-game investigation

The original rank-9 source seat-B against New Moon on registered seed `3060075246` showed **Active Electrode with one attached Prism**, **Benched Mega Absol with Telepathic Psychic plus a Prism**, and a held **Battle Compressor by global turn 16**; source discard still had **zero** Energy. If a **single** Darkness-capable Energy remains in the owner's deck at that real decision, paper rules permit:

`Battle Compressor (discard one Prism/Darkness) -> Active Electrode Extra Energy Bomb (transfer that one to Bench Mega) -> self-KO awards opponent 2 Prizes -> promote the charged Mega to Active -> Claw of Darkness`.

This differs fundamentally from the previously investigated manual paid Retreat from the Active Electrode. A self-KO can itself free the Active Spot, provided the player can choose the correct replacement; it also gives the opponent **two Prizes**. The above is a **prospective hypothesis**, since the exact owner-deck Energy accessible at the first actual Compressor search, prompt-level native promotion, opponent lock, policy selection and opportunity cost have **not** been established. The official Q&A also prevents using Energy attached to the self-KO Electrode in the same transfer. An observed held Compressor does not imply the full line is available.

A [targeted inter-agent handoff](../../communications/broadcast/20261102T1837Z_agent2_rank9_T16_one-energy-compressor-bomb-promotion-hypothesis.md) requests a same-physical-deal source T16 fork with legal owner-search choice and next-turn opponent response, rather than asserting this early attack in advance.

**Collective objective status:** original Top 32 source lists verified 29/32, zero qualified full paper Expanded games, no supported 99.5% estimate, and no claim that staged native victories establish a best unchanged 60.
