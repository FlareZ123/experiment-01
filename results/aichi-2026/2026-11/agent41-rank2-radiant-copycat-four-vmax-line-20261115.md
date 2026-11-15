# Rank-2 Radiant–Copycat VMAX ladder

**Status:** rules-derived conditional line; not native-tested and not a matchup win-rate claim.

## Finding

The nominated Hood Shadow Rider 60 contains a second, higher-ceiling branch for the rank-2 Vileplume Control matchup. The existing Mimikyu Copycat counterline can be preceded by Radiant Eternatus's Climactic Gate. If the candidate starts Mimikyu Active, Radiant can put two Shadow Rider VMAX onto the Bench before the opponent's first-turn Bunnelby / Technical Machine: Evolution sequence. Mimikyu can then copy Evolution and evolve one or two additional Shadow Rider V from the Bench.

This is an extension of the simpler two-VMAX line in the Agent 36 report, not a decklist change.

Relevant exact inputs:
- Candidate: results/aichi-2026/candidate-hood-shadow-rider.json — 1 Mimikyu GRI 58, 1 Radiant Eternatus CRZ 105, 4 Shadow Rider Calyrex V CRE 74, 4 Shadow Rider Calyrex VMAX CRE 75, 11 Psychic Energy.
- Rank 2: results/aichi-2026/full-decklists.json — 2 Bunnelby PRC 121, 2 Technical Machine: Evolution PAR 178, 1 Grand Tree SCR 136, 2 Vileplume AOR 3, 1 Stoutland BCR 122.
- Existing base line: results/aichi-2026/2026-11/agent36-rank2-mimikyu-copycat-evolution-counterline-20261115.md.
- Reproducible direct-draw screen: agents/agent41/rank2_radiant_copycat_access.py.

## Three-VMAX branch

This is the less bench-intensive Radiant branch.

1. Start Mimikyu Active.
2. On the candidate's first turn, attach one Psychic Energy to Mimikyu and bench one Shadow Rider V. Complete any other desired Item actions before Radiant Eternatus.
3. Play Radiant Eternatus from hand onto the Bench as the final action. Climactic Gate searches for up to two Shadow Rider VMAX and puts them onto the Bench. If used, the Ability ends the turn.
4. The opponent takes its first turn and uses Bunnelby's non-GX Evolution attack twice.
5. On the candidate's second turn, attach a second Psychic Energy to Mimikyu. If Dimension Valley is available, it reduces Copycat's Colorless requirement and only one Psychic Energy is needed. Use Copycat to copy Evolution. If the remaining VMAX is in the deck, Copycat evolves the Benched V; if it is in hand, the V was already in play from the prior turn and can evolve normally.
6. The board now has Radiant Eternatus and three Shadow Rider VMAX on the Bench, with Mimikyu Active. One Bench slot remains.

The three VMAX can each use Underworld Door once that turn. Each successful activation attaches a Psychic Energy from hand to a Benched Psychic Pokémon and draws two cards: up to three attachments and six cards if three Psychic Energy are in hand.

## Four-VMAX branch

For the maximum ceiling, bench two Shadow Rider V on the first turn before playing Radiant Eternatus.

- Radiant Eternatus puts two VMAX onto the Bench and ends the turn.
- The opponent's Evolution attack creates the Copycat target.
- On the response turn, Mimikyu pays Copycat with two Psychic Energy, or one Psychic Energy with Dimension Valley.
- Copycat evolves the two Benched Shadow Rider V into the remaining two VMAX if those VMAX remain in the deck. If one or both VMAX are in hand, the two V were already benched on the previous turn and can evolve normally from hand instead.

The resulting board is Mimikyu Active plus Radiant Eternatus and four Shadow Rider VMAX on the Bench. This fills all five Bench spaces exactly. Do not bench Clefairy, Tapu Lele, Latias, or another support Pokémon if pursuing this full-board line.

All four VMAX can then use Underworld Door once each. That is up to four Psychic Energy attachments and eight cards drawn, provided four Energy cards are available in hand and legal Benched Psychic targets remain. This is a ceiling, not an expected draw count.

## Rules and timing

- Radiant Eternatus's Climactic Gate puts up to two Pokémon VMAX from the deck onto the Bench and ends the turn if used. All first-turn attachments, search Items, and Pokémon placement must therefore happen before activating it.
- Mimikyu GRI 58's Copycat condition is satisfied by Bunnelby's Evolution attack: Evolution is a non-GX attack. Mimikyu pays its own Psychic-plus-Colorless attack cost; it does not pay the copied attack's cost separately.
- The copied Evolution effect searches the candidate's deck for Evolution Pokémon and evolves the selected Benched Pokémon. The supplied advanced manual's C-12 rule allows this kind of effect to evolve a Pokémon even if it was played that turn. Thus a V played on the response turn can still be evolved by Copycat if its VMAX remains in the deck.
- Grand Tree does not create a first-turn Stage 2 lock here. Its own printed reminder prohibits evolving a Basic Pokémon during the player's first turn or a Basic Pokémon put into play that turn. Its Stage 2 step is conditional on its own Stage 1 step having evolved that Pokémon. The opponent's first-turn TM Evolution attacks can produce Stage 1 Pokémon, but Grand Tree cannot use that first-turn Basic-to-Stage-1 step to chain into Vileplume or Stoutland. The rank-2 list contains no Rare Candy. The candidate therefore has its response turn before those Stage 2 locks are available.
- The rank-2 list's Vileplume AOR Item lock and Stoutland Supporter lock do not stop the Copycat attack itself. More importantly, neither Stage 2 lock is established by the described first-turn sequence.

## Exact direct-draw screen

The accompanying script exactly enumerates a deliberately narrow natural-draw subset. It assumes Mimikyu is in the opening seven and is selected Active; Radiant and the first Psychic Energy are in the opening seven plus the candidate's first-turn draw; the second Psychic Energy is in the candidate's second-turn draw pool; and the listed VMAX / V counts are directly seen rather than searched.

| Direct-draw branch | Probability across all shuffled deals | Conditional on Mimikyu in opening seven |
|---|---:|---:|
| Three-VMAX board | 0.158829% | 1.361392% |
| Three-VMAX, with Copycat evolving at least one | 0.144973% | 1.242621% |
| Four-VMAX board | 0.010927% | 0.093661% |
| Four-VMAX, with Copycat evolving at least one | 0.010794% | 0.092521% |
| Four-VMAX, with Copycat evolving both | 0.008564% | 0.073402% |

These are exact probabilities for the defined direct-draw subcases, not actual line frequencies. They exclude Fog Crystal, Mysterious Treasure, Quick Ball, Hisuian Heavy Ball, Supporter draw, Forest Seal Stone, Dimension Valley access, Mimikyu switch-in lines, discard costs, mulligan bonuses, and opponent policy. The candidate has four Fog Crystal, four Mysterious Treasure, one Quick Ball, one Hisuian Heavy Ball, and draw Supporters, so a searcher-aware access model is the next quantitative step. The screen must not be used as a win-rate estimate.

## Limitations and next validation

- This is a rules-derived line; no Twinleaf match or source-dealt fixture was run.
- The direct-draw screen is a strict subcase and does not model the candidate's search policy.
- The full four-VMAX branch requires Mimikyu Active to respect the five-Bench limit. A Mimikyu-on-Bench line needs a switch and a reduced Radiant package; it is not counted here.
- The opponent must actually use Evolution during its last turn for Copycat to copy it.
- After the existing integration acceptance / seed-disclosure gate is resolved, a source-dealt test should cover: Mimikyu Active; first-turn Energy and two V on Bench; Radiant last; two VMAX placed; opponent Bunnelby uses Evolution twice; candidate attaches the second Energy and copies Evolution; two further VMAX enter play; then each of the four Underworld Door Abilities is checked independently.

**Conclusion:** keep this as a high-ceiling Rank-2 pilot branch, not as evidence that the candidate beats the matchup. It strengthens the rationale for preserving the existing Radiant / Mimikyu package, but it does not justify a one-card substitution or any change to the frozen candidate policy.
