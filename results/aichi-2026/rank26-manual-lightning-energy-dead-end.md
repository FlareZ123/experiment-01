# Rank26 first-turn Crisis Punch: manual Lightning attachment is a source-locked energy dead end

**Agent 4, 18 October 2026. Evidence class:** printed card text and frozen source inventory, applied to one actual Store-selected source-dealt action. No game-win, stochastic attack-rate or competitive policy inference.

## Observed source action

In [compiled source CI 39141327634](https://github.com/FlareZ123/experiment-01/actions/runs/39141327634), source rank26 Meloetta plays first in physical B against rank6 Iron Thorns, seed `49957955`. Two otherwise different first-turn policies both choose a legal ordinary **Lightning Energy attachment** after using Canceling Cologne. The original six-action line then passes. The Mail-intervention line additionally plays and resolves Trainers' Mail, then plays Float Stone, but likewise passes. The preexisting [full-board original trace](https://github.com/FlareZ123/experiment-01/actions/runs/39126323092) confirms Lightning actually attached to active Meloetta, with no second attachment.

## Printed-resource invariant

The [published registered rank26 60](full-decklists.json) contains precisely two **basic Lightning Energy** and one **Double Colorless Energy**. Its sole non-manual Energy accelerator is **Tapu Koko Prism Star TEU 51**. [Dance of the Ancients](https://limitlesstcg.com/cards/TEU/51) attaches one Lightning from discard to each of **two different Benched Pokémon**. The archived TPCi ruling cited [here](https://www.pokebeach.com/forums/threads/team-up-rulings.149390/) explicitly disallows putting both on the same Benched Pokémon. [Technical Machine: Crisis Punch](https://asia.pokemon-card.com/sg/card-search/detail/11180/) requires three Colorless Energy. The attached [Advanced Player's Rulebook](../../resources/manual/EN_advanced_manual-2025-transcription-structured.md) states one normal Energy attachment from hand per turn.

If that single hand attachment is spent on a basic Lightning, the source list cannot manually attach its sole Double Colorless later that turn. Koko can place **at most one additional Lightning on Meloetta**, even after legal Active-to-Bench movement. Its total for that first turn is therefore at most **one manual Lightning + one Koko Lightning = two Energy units**, strictly below Crisis Punch's **three**. Retreating or switching cannot increase this maximum. No other printed card in the exact source rank26 60 provides a Special Energy attachment or transfers a third Energy unit to Meloetta on turn one.

**Conclusion:** once the actual source bot attaches Lightning from hand to Meloetta on its first turn, the rank26 first-turn Crisis Punch line becomes **unreachable under the frozen 60**, irrespective of later access to Risky Ruins, the five self-KOs, Canceling Cologne, Tool, or Prize recovery. This is a demonstrated necessary sequencing failure of both tested policies, independent of whether their subsequent generic bot would have searched well. It is narrower than a match-loss or zero attack probability claim.

## Repair target

Any serious rank26 first-turn opponent policy must **reserve the normal attachment for Double Colorless Energy**. During source-first openings without DCE in hand, finding DCE or a legal alternative attaching three Energy is a prerequisite to the intended line. Merely adding Item search or completing Pump recovery cannot rescue a turn after a prematurely selected basic Lightning attachment. An evidence-standard repair would demonstrate a source-legal replacement action on the *same original root*, followed by an actual DCE attachment and completed Energy/Tool attack under correct Koko Bench positioning, with authentic opponent replies.

This single-seed decision veto is useful for competence audit of rank26 opponents against fixed challengers. It must not be counted as an independent game or as evidence of the target 99.5% field win rate. Project status remains 29/32 exact opponent lists and zero independently qualified competitive games.
