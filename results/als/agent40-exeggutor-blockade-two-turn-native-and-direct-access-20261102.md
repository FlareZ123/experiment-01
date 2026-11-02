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

The ordinary generic [owner-visible Jet Bench switch](../../simulation/twinleaf/agent40-public-jet-bench-frontier.cjs) preserves any already-payable Active attack. Once Bunnelby's turn ends, it retains the first Jet and can pay Burrow or Rototiller. A distinct, default-off [Blockade continuation selector](../../simulation/twinleaf/agent40-owner-blockade-continuation.cjs) now overrides that generic choice under a narrow public board: Bunnelby Active holding Jet, Vileplume AOR and Exeggutor PLF Bench, held second Jet, open Energy quota, no Temple of Sinnoh, no existing opposing Supporter prohibition and opponent deck length above one card. The latter preserves an immediate Burrow deckout opportunity. It reads only the detached actor's own hand and both public boards, not concealed deck/Prize/opponent-hand identities.

The first live selection CI run [41380378018](https://github.com/FlareZ123/experiment-01/actions/runs/41380378018) failed 2/2: the selector incorrectly compared a native numeric `CardType.COLORLESS` attack cost against the literal text `Colorless`, so the actor instead chose `attach-basic-energy`. The deliberately isolated synthetic test also used string costs and erroneously passed. An independently printed native actor-observation diagnostic in [41380712348](https://github.com/FlareZ123/experiment-01/actions/runs/41380712348) exposed the actual Blockade attack cost `[9]`. The correction uses `catalog.colorlessEnergyType`, the pinned TypeScript enum supplied by the live catalogue, and updates the synthetic tests to numeric printed costs.

**Compiled actor-selected continuation successfully verified:** [manual Actions run 41381148558](https://github.com/FlareZ123/experiment-01/actions/runs/41381148558), whole workflow **SUCCESS**, pinned source as above. The two native physical seats passed actual `chooseActorRootIntent(...,{exeggutorBlockadeContinuation:true})` selecting the held second Jet on Benched Exeggutor, then accepting the physical native Energy switch, native Blockade attack, 10 damage, and opposing held original-rank1 Guzma denial without hand mutation. The four numeric-enum pure decision tests also passed. These are still **two staged turn sequences and four isolated policy tests, no sampled games**.

## Exact hand-resource conjunction for the untutored two-Jet route

Separate from the staged game mechanics, count a narrow **direct natural-hand-only** event through the first seven opening cards and the first two ordinary draws. The 60 is divided into disjoint copy groups:

`[2 Bunnelby, 2 Exeggcute, 10 other Basics, 2 TM Evolution, 3 Jet Energy, 41 other]`.

On source turn 2 (first eight visible cards), require one Bunnelby, one Exeggcute, one TM and one Jet. By source turn 4 (first nine visible cards), require a **second** Jet. Condition on at least one Basic in the opening seven. The six uniformly random face-down Prizes are marginalized: the two natural draws are exchangeable ordered cards from the 53 unseen physical cards left after the opener, before their unknown Prize allocation is inspected. This is an overinclusive screen: it ignores whether the Stage printings were Prized or accessible, any timing/Bench/payment obstacle, and actual opponent actions.

Exact favorable card-access sequences: **340,221,072**.

Exact Basic-valid denominator: **916,872,253,440**.

**Conditional event probability: 7,087,939 / 19,101,505,280 = 0.03710670387543405%** (approximately 1 in 2,695).

The unconditional analogous probability is **0.03196406052044868%**. These are **not** projected successful setup rates or win probabilities. In particular, `Guzma & Hala`, `Tag Call`, card draw, alternate attachment/payment lines and Prize recovery can create actual legal Blockade sequences without satisfying the artificially direct-hand-only conjunction. The result shows only why tutors and sequencing are fundamental to this particular two-Jet construction.

Reproducible source-count BigInt enumeration: [`agent40-exeggutor-direct-two-turn-access.cjs`](../../simulation/evaluation/agent40-exeggutor-direct-two-turn-access.cjs) with three independent tests including exact expected numerator/denominator and exhaustive toy physical-deal enumeration [here](../../tests/agent40-exeggutor-direct-two-turn-access.test.cjs). All **3/3 passed** in the same compiled [run 41379797374](https://github.com/FlareZ123/experiment-01/actions/runs/41379797374); Python `Fraction`/`comb` and a separate JavaScript enumeration independently reproduced the fractions.

## What is still required

1. Extend the now-verified default-off owner-visible second-Jet selection to competing tactical costs, multiple possible Benched targets, alternative mobility, and source-opponent reply; current proof is the narrow printed Bunnelby/Exeggutor/AOR state only.
2. Replace the passive rank-1 opponent turn with **opponent-active original-rank6 Iron Thorns and rank11 Mega Absol/Garbodor response** on actual registered prints, ideally conditional paired original Stoutland versus Exeggutor v2 games with fair hidden-zone and policy handling.
3. Count natural openings, full physical six-Prize configurations, Supporter contention, first-turn accesses through Tag Call/Guzma & Hala, 100-HP Exeggutor survival, and the source turn in which player-level lock actually becomes enforceable.
4. Maintain all-five-piece paper fidelity assessment: root/prompt/payment/effect/randomness; verify this challenger against **all 32** original opponents once the three missing source decklists are authenticated.

**Benchmark status remains 29/32 authenticated opponent lists, zero competitively qualified match games, no demonstrated 99.5% fixed-deck result.**

## Follow-up: authentic original-rank1 Guzma defeats the exposed setup window

**2 November 2026 follow-up, same fixed Exeggutor v2 and source rank1 60s.** The previously pending [manual compiled Actions run 41381645977](https://github.com/FlareZ123/experiment-01/actions/runs/41381645977), pinned at research head `f4c1d39036ea4eccc173a54b36986e33b6f898ce`, completed **SUCCESS**. The same [two-seat native fixture](../../tests/agent40-native-bunnelby-exeggutor-blockade-continuation.test.cjs), `verify(seat,true)`, now exercises a counterexample in the **intervening original-rank1 opponent turn**, directly after the double TM Evolution and **before** the source Exeggutor has had a chance to use Blockade.

In each staged physical seat, the opponent's original printed `Guzma BUS` is held as a real card. An original `Shadow Rider Calyrex V CRE` is physically moved from that source owner's original hand onto its Bench, creating the required legal own-Pokémon switch target without conjuring any extra copy. The source Bunnelby completes both native `Evolution` attacks, establishing Exeggutor PLF and Vileplume AOR on its Bench. The test verifies the opposing player is then genuinely in an unlocked Supporter action window. The original rank1 player **plays Guzma** using native `PlayCardAction`; genuine owner-matched `ChoosePokemonPrompt` responses gust Exeggutor from the other player's Bench into the Active Spot and promote its own Benched Shadow Rider. Those native prompts validate their selected targets; the Store resolves without pending prompts. Exeggutor becomes Active, the actual opponent Guzma leaves the hand, and `cannotPlaySupporterCards` remains false. The counterline therefore prevents the planned second held-Jet promotion/Blockade sequence from occurring in its intended form.

This is stronger than merely speculating that the exposed turn could allow a counter: the registered opponent has a **native-accepted, actual printed Supporter counter-action** in the stage, with both real prompt target decisions. It is still a **constructed favorable state** rather than naturally dealt source-game evidence. The opponent's decision to choose this action and targets is explicitly scripted, and no subsequent turn, revised source policy, board survival, win condition or tournament clock is tested in this branch. The companion original passive `Stoutland BCR` strategy has not been tested head-to-head under matched natural deals.

**Consequence for the proposed challenger:** any natural source-policy experiment must explicitly account for the immediately intervening opposing Supporter window. It should retain post-TM `Guzma` and alternate switching/Knock Out counterlines, record whether Exeggutor can actually apply its first Blockade, and test a strategically active opponent. **No paper-match winner or competitive performance rate is established.**
