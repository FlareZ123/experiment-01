# Sentinel Vileplume first-turn lock: original rank-1 Guzma counter-reply

**8 November 2026 | Agent 28 | Native conditional interaction result. No autonomous two-player game or candidate nomination.**

## Decision-relevant result

The unchanged [Sentinel Lopunny/Vileplume v1 printed 60](../candidate-sentinel-lopunny-vileplume-v1.psv) (blob `0852b8a59287c87f9e2ddabdb1f5c771e86340d1`) can establish its Vileplume AOR Item lock through a fully paid and native-settled conditioned first-turn `Guzma & Hala → Artazon → Bunnelby → Jet Energy → twice TM: Evolution` sequence. Against the original published Aichi rank-1 Shadow Rider printed name/count 60, a conditioned **actual original rank-1 Guzma BUS Supporter** then targets that Benched Vileplume and promotes its own Benched Mimikyu GRI. The two ChoosePokemon prompts resolve through the pinned Store; after the resolution, Vileplume is the Sentinel's Active and Mimikyu is rank-1's Active, on **both native physical seats**.

This gives a concrete answer to a critical conditional weakness: **Item lock does not prevent the opponent's Guzma**. Sentinel's exposed Vileplume is 130 HP, carries no Energy after this exact opener and has printed three-Colorless retreat cost. Because the Sentinel list has no Item-based immediate self-switch usable under its own lock, following turns need an available non-Item switching or retreat line if the newly Active Vileplume is inconvenient. This is a resource/positioning failure mode, **not** a demonstrated forced loss or a frequency estimate.

**Important scope:** rank-1's opponent hand is conditioned to contain its printed Guzma; its Mimikyu is deliberately put onto the Bench from its own remaining fixed 60. Source and opponent decisions are scripted. The attack, damage, Prize race, realistic source response and complete clocked match are absent. No candidate fixed 60, matchup probability or 99.5% claim follows.

## Reproduced native sequence

In [manual pinned Twinleaf workflow 42521763241](https://github.com/FlareZ123/experiment-01/actions/runs/42521763241), all steps completed **SUCCESS**, including the [two-seat exact 60 native test](../../../tests/agent28-sentinel-direct-artazon-native.test.cjs) and its exact physical-deal numerical companion. The job is `128856585494`; selected opt-in is `sentinel_artazon_direct_probe=true`. Workflow head is `a1e97602599fd98876a6eafa248b27a0ec795537`, pinned Twinleaf upstream gitlink `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. No vendor changes or extra workflow.

1. Source has exactly its published Sentinel 60 physically partitioned into legal zones, including six Prizes with Fan Rotom, source Active Oddish, and two Bunnelby remaining in deck.
2. Actual Guzma & Hala discards one held original `Guzma BUS` plus `Karen XYP` to retrieve Artazon, TM Evolution and Jet; subsequent genuine card-play, search, switch, two TM Evolution declarations and prompts produce a Benched Vileplume.
3. At the global turn-3 original rank-1 reply, the Store reports rank-1 `supporterTurn:0`, source Bench Vileplume, own Bench Mimikyu, and an actually held `Guzma BUS`.
4. Native `PlayCardAction` for Guzma removes it from rank-1 hand, places it in its Supporter play zone, increments `supporterTurn` to 1 and presents `ChoosePokemonPrompt`. Its first selected original printed target is Vileplume; its second is own Mimikyu. Both prompts are individually validated against the Store and settled.
5. An attempted source-printed Fog Crystal Item is rejected with `CANNOT_PLAY_THIS_CARD` even after the gust. The Store's rollback preserves the physical opponent hand and new Vileplume Active in the actual **replacement** Store state.
6. Seat 0 and seat 1 native cases **both passed**, along with exact direct-Artazon resource-predicate tests. Source attack count is two; competitive games are zero.

The CI logs contain two `AGENT28_DIRECT_ARTAZON_NATIVE` receipts. In each seat, `AGENT28_POST_GUZMA` shows `opponentSupporterTurn:1`, `cardInHand:false`, `cardInSupporter:true`, and `prompts:["ChoosePokemonPrompt"]`.

## Discovered and corrected acceptance bug

Earlier attempts, [42520831923](https://github.com/FlareZ123/experiment-01/actions/runs/42520831923) and [42521354938](https://github.com/FlareZ123/experiment-01/actions/runs/42521354938), failed the Guzma ChoosePokemon assertion on both seats. The second retained diagnostic logs with `cardInHand:true`, `opponentSupporterTurn:0`, no prompts, while the test still saw its old State. This was an artifact of **the fixture**, whose Fog Crystal Item rejection was executed immediately **before** the Guzma action.

At pinned `Store.reduce` in `ptcg-server/src/game/store/store.ts`, a thrown illegal-action error restores the engine state to a **deep-cloned backup** and reassigns `this.state`. The test had retained references to the previous `State` and `Player`; dispatching a newly indexed Guzma through those stale references did not demonstrate the intended post-lock reply.

Fix: execute the genuine Guzma response and its two settled prompts on the live Store **before** the deliberately rejected Fog Crystal negative control. Following the deliberate rejection, fetch `store.state.players[physicalSeat]` afresh and assert (a) the Store reference changed, (b) the same physical hand inventory is restored, and (c) Vileplume remains Active. Code commits [fee919b2](https://github.com/FlareZ123/experiment-01/commit/fee919b2be4ff20327b13d2b39c41c6c5210aa7b) and [a1e9760](https://github.com/FlareZ123/experiment-01/commit/a1e97602599fd98876a6eafa248b27a0ec795537). The test preserves each seat's explicit positive and negative evidence.

Any research adapter that caches Store State or Player object identities across **rejected native actions** must reacquire them from the live Store before claiming subsequent action settlement. This is directly relevant to negative-control and owner-policy test harnesses, without implying a generic engine game-rule bug.

## Practical counterplay implication and next falsifier

The exact opener used one Jet Energy to put Bunnelby Active. The source has a zero-Energy Vileplume Active after Guzma, so the lock can impede its own attack plan. Vileplume's retreat is three, and Item-based switching remains unavailable to both players while Irritating Pollen is enabled. Conditional solutions require source-owned remaining Jet or Supporter switching, or a different preemptive board/Active line. A separate Stoutland Supporter lock would protect some replies if it is genuinely Active early enough, but its concurrent Active requirement must be paid and demonstrated; merely evolving a Benched Stoutland does not stop the Guzma line.

**Highest-value follow-up:** run the **original rank-1 owner-safe** continuation from this exact physical state and compare actually playable supporter/energy/attack decisions, after determining which opponent lines create a KO or time advantage. A decisive counterplay claim needs a legal attacker payment, resolved native attack, source continuation and eventual paper-valid finish, under the common two-seat policy. Keep the 29/32 historical-source coverage and zero qualified games separate.
