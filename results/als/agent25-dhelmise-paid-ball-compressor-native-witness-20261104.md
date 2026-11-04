# Paid Hide 'n' Sneak donor plus one Battle Compressor: real native Store action witness

**4 November 2026 | Agent 25 | four pre-registered synthetic midgame branches | pinned Twinleaf native Store + opt-in HNS paper hook | zero qualified games.**

## Why this native check exists

The [exact opening-resource calculation](agent25-dhelmise-ball-discard-hns-opening-20261104.md) found a missing opportunity: discarding one eligible Hide 'n' Sneak donor from hand for Quick Ball or Mysterious Treasure can combine with a single Battle Compressor discarding three eligible donors from deck, meeting Dhelmise M5 39's four-Pokémon discard threshold. The exact combinatorial screen by itself cannot establish that a concrete Trainer payment and attack sequence works.

A four-arm synthetic midgame fixture was **registered before its first native execution** at [the immutable precommit registration](registrations/agent25-ball-one-compressor-staged-store-20261104.json). Each seat gets a real printed Dhelmise M5 Active with a Psychic Energy SVE already attached, a hand with Quick Ball SSH, Battle Compressor PHF and one payment card. Its owner deck contains three separate Banette M5, a Basic Dhelmise search target and three filler Psychic Energy. The opposing Active is Shadow Rider Calyrex V CRE with ten damage already present. This is deliberately a small staged Store game state, **not an initial natural-dealt 60-card game**.

The branches use two alternative hand payments: Shuppet M5 (a donor), or Grass Energy MEE (a non-donor negative control). Each is executed on both physical seats. All three actions are actual native roots: Quick Ball's `PlayCardAction`, Battle Compressor's `PlayCardAction`, and Dhelmise's `AttackAction`. Native owner-hand payment, owner-deck search and donor selection, reveal/shuffle, and wait prompts must settle. The final attack is wrapped in the already tested **reversible HNS Ability-lock paper-count hook**, pinned to the same Store commit.

## Successful selected native run and physical receipts

- [Pinned native workflow run 41764206685](https://github.com/FlareZ123/experiment-01/actions/runs/41764206685), source commit `8a6ba6d60c518613011a10b1376e40f44146429a`, engine pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- [Complete four-arm machine-readable artifact](https://github.com/FlareZ123/experiment-01/actions/runs/41764206685/artifacts/13291866530). The artifact is retained by GitHub for fourteen days; the deterministic source and preregistration remain in the repository for exact reproduction.
- [Native reproducible staged program](../../simulation/twinleaf/agent25-ball-compressor-staged-native.cjs), running inside the preexisting [Agent25 native workflow](../../.github/workflows/agent25-hns-discard-native-counterexample.yml). Later workflow versions make this test explicitly opt-in to avoid disrupting the preexisting default native suite.
- The four arms each recorded **14 actual root or prompt-dispatch events**, with native prompt validators accepting each selected physical card and no prompts left unresolved. The printed hand donor is identified by the **same card object**, not merely by name.

| Stage | Seat 0, pay Shuppet | Seat 0, pay Grass Energy | Seat 1, pay Shuppet | Seat 1, pay Grass Energy |
| --- | --- | --- | --- | --- |
| Native Quick Ball hand payment | Shuppet M5 | Grass Energy MEE | Shuppet M5 | Grass Energy MEE |
| Native Compressor deck-to-discard payments | three distinct Banette M5 | three distinct Banette M5 | three distinct Banette M5 | three distinct Banette M5 |
| Effective HNS Pokémon in own discard at attack | **4** | **3** | **4** | **3** |
| Settled Vengeful Anchor damage | **170** | **30** | **170** | **30** |
| Final opponent Active damage, including staged initial 10 | 180 | 40 | 180 | 40 |
| Native status | pass | pass | pass | pass |

The same three Banette object IDs `80036, 80037, 80038` are physically removed from the owner deck and found in owner discard after the Compressor prompt. The paid card ID `80034` is likewise present in owner discard. Native Quick Ball and Compressor Item objects are placed into owner discard after completing their roots. The one-card difference in final HNS donor count changes the settled attack damage by exactly **140**, consistent with Dhelmise's printed text.

The paper HNS hook reported one attack count check per arm with raw/effective HNS counts `4/4` or `3/3`. No opponent lock was active. All four staged cases returned `STAGED_NATIVE_ACTIONS_SETTLED` and the collector labeled `allPassed:true`, `competitiveGameQualified:false`, `qualifiedGames:0`.

## Failure provenance

The [first native workflow run 41763884028](https://github.com/FlareZ123/experiment-01/actions/runs/41763884028) failed its synthetic harness after its initial Quick Ball root because it incorrectly assumed the native card-selection prompt's **CardList wrapper object** must be the same wrapper object as the owner's hand or deck. The card objects offered within the prompt were genuine. The harness was corrected to match the actual offered **physical card instances** against the owner's visible zones and to validate each prompt choice natively. The original positive/negative arms and expectations remained unchanged. The first failure is a harness-interface failure, not card-interaction disproof.

## What is established and what remains unresolved

**Established:** In this controlled, pre-settled board position, a genuine paper-costed Quick Ball payment of held Shuppet followed by one native Battle Compressor of three Banette produces four HNS donors and a real 170-damage Dhelmise attack on either seat. The non-donor payment control produces only 30 damage. The native interactions agree with the corrected analytical *existence of a resource route*.

**Unresolved:** This does not certify first-turn legal action from a randomized natural opening, a bot that chooses the route over competing Quick Ball searches, a real opposing Item/Ability/Supporter lock, a fully accounted 60-card two-seat game, or any win probability. The Energy was staged already attached, and the hand/deck/Prize zones were explicitly synthetic. It is a first mechanically validated pathway, still short of a full policy execution. The next meaningful release test is a **natural fixed-60** source game with an actual owner-only paid discard, no hidden read, a meaningful counterplay opportunity and no paper quota violation. The full Aichi 2026 Top 32 remains unqualified and the 99.5% objective remains aspirational.
