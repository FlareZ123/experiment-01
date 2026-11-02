# Exeggutor Blockade in the Aichi rank-2 Bunnelby TM engine: actual two-turn native chain and stringent direct-access ceiling

**Agent 40 | 2 November 2026 | original rank-2-derived exploratory challenger v2 | zero competitively qualified games.**

## Research question

Agent18's [fixed exploratory 60](agent18-exeggutor-vileplume-native-v2.json) replaces original published Aichi rank-2 Vileplume Control's Stoutland 2 Lillipup / 2 Herdier / 1 Stoutland with 1 Exeggcute PLF, 1 Exeggcute VIV, 2 Exeggutor PLF and the third Jet Energy. This has a documented physical full-stage unprized-supply benefit, while adding 30-HP forced-opening risk. The missing question is whether the actual first-turn `Bunnelby PRC` Ω Barrage + `Technical Machine: Evolution PAR` line can produce the promised **player-level Supporter lock** through an owner-visible sequence, and exactly when the lock starts.

`Exeggutor PLF` is Stage 1 with `Blockade` for one Colorless, 10 damage and prohibition on opposing Supporters **during the opponent's next turn**. The supplied Advanced Player's Rulebook, C-19 and E-01, treats this as an effect on the player with a next-turn duration. An Exeggutor placed on the Bench by Bunnelby's Evolution attack has not yet attacked. Using Bunnelby's first and Ω Barrage second attacks consumes the source turn and ends the normal action window. Jet promotion of the Exeggutor for an attack must be a later source-turn action in this particular line.

## Source-correct staged native test

Test: [`tests/agent40-native-bunnelby-exeggutor-blockade-continuation.test.cjs`](../../tests/agent40-native-bunnelby-exeggutor-blockade-continuation.test.cjs). It uses original [authenticated rank-2 physical 60](../aichi-2026/full-decklists.json), resolved through the existing printed-card alias adapter, and applies exactly the announced five-for-five delta. This matters because the challenger JSON calls the ACE SPEC `Grand Tree SCR`, while the actual pinned `CardManager` registers that existing physical source as `Great Tree SCR`. All newly added Exeggcute/Exeggutor and Jet printed classes are registered at Twinleaf pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

The test conditions on Bunnelby Benched, one Oddish and one Exeggcute VIV Benched, one TM Evolution and **two Jet Energy in the source owner's hand**, and the three Stage targets remaining in the small staged source deck. It uses original-source Girafarig LOT Active. The opponent's original authenticated rank-1 Shadow Rider deck supplies the opponent, including a specifically held original rank-1 `Guzma BUS` moved from the original deck into its hand. This creates a **conditioned partial game-state fixture**: initial cards, source deck and Prize arrangement are staged, and the opponent is instructed to pass once. No natural 60-deal win evidence follows.

| Physical turn | Actual native actions and effect | Verified outcome |
| --- | --- | --- |
| Source turn 2 | Owner-only actor proposes TM equip to Benched Bunnelby and first Jet attach to it. Jet promotes Bunnelby; `Evolution` then Ω Barrage's prompted second `Evolution` resolve through actual Store prompts | Stage 1 `Exeggutor PLF` and Stage 2 `Vileplume AOR` established on Bench; Bunnelby remains Active |
| Opponent turn 3 | All attack/checkup/draw WaitPrompts completed; opponent receives PLAYER_TURN and takes a deliberate PassTurnAction | **No Exeggutor Blockade player lock exists yet**. The held Guzma is still in hand and Supporters are not prohibited by the established AOR Item lock |
| Source turn 4 | Second held Jet attaches to Benched Exeggutor; its mandatory switch promotes Exeggutor; printed `Blockade` AttackAction resolves | 10 damage to opposing Active and native opponent `cannotPlaySupporterCards=true` |
| Opponent turn 5 | Actual `PlayCardAction` attempts original-rank1 held Guzma | Rejected `BLOCKED_BY_EFFECT`; exact opposing hand remains unchanged |

This chain passed **2/2 native seat tests with full compiled manual GitHub Actions SUCCESS** in [run 41379797374](https://github.com/FlareZ123/experiment-01/actions/runs/41379797374) at commit `76eaa4f9056e02190ced34204e9c9bbf85a21705`. Both tests pass explicit Ω Barrage `ChooseAttackPrompt` = Evolution checks, all genuine Stage and Wait prompts, both actual Jet attachments/switches, and a player-level opposing Supporter denial. This is a **mechanical and staged sequential action certificate**, not a game, setup success estimate, or matchup rating.

### Potential action-selection bottleneck beyond legal access

The ordinary generic [owner-visible Jet Bench switch](../../simulation/twinleaf/agent40-public-jet-bench-frontier.cjs) prioritizes preserving an already-payable Active attack. Once the first source turn has ended, the Active Bunnelby retains its first Jet and can pay its one-Colorless `Burrow` or `Rototiller` attacks. That generic preservation can block selecting the second Jet to Exeggutor, even when `Blockade` against Supporters is more strategically important. A distinct, default-off [Blockade continuation proposal](../../simulation/twinleaf/agent40-owner-blockade-continuation.cjs) is under native validation. It is deliberately restricted to the public Bunnelby/Exeggutor/AOR board, held Jet, an open Energy quota, a relevant player lock target, and absence of Temple of Sinnoh. It preserves a likely immediate Burrow deckout if the opponent has at most one card in deck. The policy proposal is a hypothesis until its own live Store actor-root acceptance is verified.

## Exact hand-resource conjunction for the untutored two-Jet route

Separate from the staged game mechanics, count a narrow **direct natural-hand-only** event through the first seven opening cards and the first two ordinary draws. The 60 is divided into disjoint copy groups:

`[2 Bunnelby, 2 Exeggcute, 10 other Basics, 2 TM Evolution, 3 Jet Energy, 41 other]`.

On source turn 2 (first eight visible cards), require one Bunnelby, one Exeggcute, one TM and one Jet. By source turn 4 (first nine visible cards), require a **second** Jet. Condition on at least one Basic in the opening seven. The six uniformly random face-down Prizes are marginalized: the two natural draws are exchangeable ordered cards from the 53 unseen physical cards left after the opener, before their unknown Prize allocation is inspected. This is an overinclusive screen: it ignores whether the Stage printings were Prized or accessible, any timing/Bench/payment obstacle, and actual opponent actions.

Exact favorable card-access sequences: **340,221,072**.

Exact Basic-valid denominator: **916,872,253,440**.

<escape>**Conditional event probability: 7,087,939 / 19,101,505,280 = 0.03710670387543405%** (approximately 1 in 2,695).</escape>

The unconditional analogous probability is **0.03196406052044868%**. These are **not** projected successful setup rates or win probabilities. In particular, `Guzma & Hala`, `Tag Call`, card draw, alternate attachment/payment lines and Prize recovery can create actual legal Blockade sequences without satisfying the artificially direct-hand-only conjunction. The result shows only why tutors and sequencing are fundamental to this particular two-Jet construction.

Reproducible source-count BigInt enumeration: [`agent40-exeggutor-direct-two-turn-access.cjs`](../../simulation/evaluation/agent40-exeggutor-direct-two-turn-access.cjs) with three independent tests including exact expected numerator/denominator and exhaustive toy physical-deal enumeration [here](../../tests/agent40-exeggutor-direct-two-turn-access.test.cjs). All **3/3 passed** in the same compiled [run 41379797374](https://github.com/FlareZ123/experiment-01/actions/runs/41379797374); Python `Fraction`/`comb` and a separate JavaScript enumeration independently reproduced the fractions.

## What is still required

1. Certify that a **real owner-visible policy** elects to spend the second Jet on Blockade despite an immediately payable Bunnelby Burrow and retains appropriate alternatives when opponent deckout is available.
2. Replace the passive rank-1 opponent turn with **opponent-active original-rank6 Iron Thorns and rank11 Mega Absol/Garbodor response** on actual registered prints, ideally conditional paired original Stoutland versus Exeggutor v2 games with fair hidden-zone and policy handling.
3. Count natural openings, full physical six-Prize configurations, Supporter contention, first-turn accesses through Tag Call/Guzma & Hala, 100-HP Exeggutor survival, and the source turn in which player-level lock actually becomes enforceable.
4. Maintain all-five-piece paper fidelity assessment: root/prompt/payment/effect/randomness; verify this challenger against **all 32** original opponents once the three missing source decklists are authenticated.

**Benchmark status remains 29/32 authenticated opponent lists, zero competitively qualified match games, no demonstrated 99.5% fixed-deck result.**
