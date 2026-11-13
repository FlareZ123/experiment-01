# Arbok XY1 48 Gastro Acid: attack-based counter to the rank-2 Stoutland lock

**Agent 48 · 13 November 2026 · pinned-native staged attack-effect confirmation; matchup remains untested**

## Decision

Test **one Ekans XY1 47 + one Arbok XY1 48** as an alternative to the one-of Baltoy Rapid Spin idea against the exact rank-2 Vileplume/Stoutland deck. Arbok's one-Colorless **Gastro Acid** attack deals 20 and makes the Defending Pokémon have no Abilities until the end of the candidate's next turn. It targets Stoutland directly, does not rely on an opponent-selected switch, and is an attack effect rather than an Ability effect.

This is **not** a proven lock break. The opponent can move Stoutland to the Bench, which removes the attack effect, and the rank-2 list has a credible Guzma + Jet Energy restoration line. The point is that Arbok creates a more direct, testable pressure line than Baltoy, while its 20 damage also changes Shadow Rider VMAX's Stoutland knockout threshold.

## Grounded card and rules facts

- [Arbok XY #48](https://limitlesstcg.com/cards/xy/48) is a 90-HP Psychic Stage 1 evolving from Ekans XY #47. Gastro Acid costs **one Colorless Energy**, does **20 damage**, and says: “The Defending Pokémon has no Abilities until the end of your next turn.” Limitless lists it as Expanded-legal. The repository card pool agrees.
- [Stoutland BCR 122] has the **Sentinel** Ability: while Stoutland is Active, the opponent cannot play Supporter cards from hand. The Active requirement matters: if the specific Stoutland is suppressed while it stays in play, its Supporter lock is off.
- [Vileplume AOR 3] has **Irritating Pollen**: each player cannot play Item cards from hand. This Ability has no Active requirement and continues to function from the Bench. Gastro Acid on Stoutland does **not** disable Vileplume, so the Item lock remains.
- [Stealthy Hood](https://limitlesstcg.com/cards/sm/186) prevents effects of an opponent's Abilities done to the attached Pokémon. Gastro Acid is an **attack effect**, not an Ability, so Hood should not prevent it. This is a card-text distinction; verify in native play before treating the interaction as implemented correctly.
- The supplied advanced manual, [EN advanced manual 2025 transcription](../../../resources/manual/EN_advanced_manual-2025-transcription-structured.md), states that effects of attacks on a Pokémon are removed when that Pokémon moves to the Bench (see the rule section on attack effects and switching). Damage counters remain. Therefore, if Stoutland leaves the Active Spot, Gastro Acid's ability suppression is removed from that Stoutland; a newly evolved Stoutland is also a different Pokémon and does not inherit the effect.

## Why the attack fits Shadow Rider

The nominated [Hood Shield Shadow Rider v1 60](../../decks/hood-shield-shadow-rider-v1-expanded-legal-60.md) already has:

- 4 Shadow Rider Calyrex VMAX and 11 Psychic Energy;
- Underworld Door, which can attach a Psychic Energy from hand to a Benched Psychic Pokémon and draw two cards;
- 4 Mysterious Treasure and 4 Fog Crystal, both capable of finding the Psychic Ekans/Arbok line before Vileplume's Item lock is established.

Arbok is Psychic, but Gastro Acid costs only one Colorless Energy. One Psychic Energy is sufficient, and Underworld Door can accelerate it while Arbok is Benched. The line costs two Pokémon slots and must be established **before** Vileplume prevents Item-card searches. Arbok also needs to be Active to attack; the current candidate has one Float Stone and one Guzma, but no Switch/Escape Rope. Active-positioning and lock timing are therefore major access constraints, not details to assume away.

## Exact rank-2 opponent response inventory

The [Limitless rank-2 decklist](https://limitlesstcg.com/decks/list/26808) contains the relevant response package:

- 1 Stoutland BCR 122;
- 2 Vileplume AOR 3;
- 2 Pidgeot ex with **Quick Search** (once per turn, search the deck for any card);
- 2 Guzma;
- 2 Jet Energy;
- 1 Cassius;
- 1 Grand Tree;
- 3 Stealthy Hood;
- 1 Lusamine and 1 Team Yell's Cheer.

Pidgeot ex can find a missing Guzma or other response card. The two Guzma are finite, but the list also has Supporter recovery. Vileplume's Item lock remains active while Vileplume is on the Bench, so the candidate cannot assume that Gastro Acid unlocks Mysterious Treasure, Fog Crystal, VS Seeker, or an unplayed Float Stone.

## Candidate turn and opponent response branches

1. **Stoutland remains Active.** Gastro Acid suppresses Sentinel through the end of the candidate's next turn, provided that specific Stoutland does not move to the Bench. The candidate gets a Supporter window on its next turn, while Vileplume still blocks Items. The candidate may use that window to draw, gust, or prepare a knockout.
2. **Opponent uses Guzma to move Stoutland to the Bench.** This removes the Gastro Acid effect, but Stoutland is now Benched and Sentinel does not apply. The candidate still has a Supporter window on its next turn. Stoutland has 20 damage counters' worth of damage (20 damage) and can be targeted if it is brought Active.
3. **Opponent uses Guzma plus Jet Energy to restore Stoutland in the same turn.** Guzma can switch Stoutland to the Bench (clearing the attack effect) and Jet Energy attached from hand to the Benched Stoutland can switch it back Active. Sentinel is restored before the candidate's next turn. The opponent needs both the Supporter and the Energy attachment; Pidgeot ex can search for one missing card if the other is already accessible. This is the principal direct counterexample to a guaranteed Supporter window.
4. **Opponent uses Cassius to remove the affected Stoutland.** Cassius shuffles Stoutland and its attachments into the deck, clearing the attack effect and healing the damage. Pidgeot ex can search for Stoutland again. A prior-turn Herdier can evolve into it, or Grand Tree may enable a Lillipup → Herdier → Stoutland chain. A Jet Energy can promote the rebuilt Stoutland. This is a resource-intensive but plausible reset; test the exact evolution/attachment timing rather than assume it succeeds.
5. **Candidate attacks the damaged Stoutland with Max Geist.** Max Geist does 10 + 30 for each Psychic Energy attached across the candidate's Pokémon. Four Psychic Energy yield 130; plus Gastro Acid's 20 damage, the affected Stoutland has 150 total damage against 140 HP. If the candidate can attack the restored/remaining Stoutland with Shadow Rider VMAX, four total Psychic Energy are enough to Knock it Out. The opponent's Guzma also chooses the candidate's replacement Active Pokémon, so the candidate must demonstrate that Shadow Rider can still be promoted/retreated and attack.

These branches imply a **conditional one-turn Supporter window / resource-tax / knockout setup**, not an unconditional lock removal. Stealthy Hood is not a defense against Gastro Acid itself, but the opponent's switch, Jet Energy, Cassius and evolution lines may still answer it.

## Paired experiment required

Keep the current nominated 60 unchanged as the baseline. Build a separate 60-card Arbok challenger by adding one Ekans XY1 47 and one Arbok XY1 48, with two explicitly documented cuts. Run paired seeds against the exact rank-2 list, both starting orders, and a competent opponent policy that knows the reset lines.

Record at minimum:

- whether Ekans and Arbok are established before Vileplume's Item lock;
- turn of first Gastro Acid and whether Arbok is Active and powered;
- whether Stealthy Hood changes the attack effect (it should not, but verify);
- whether Stoutland remains Active, is moved to Bench, or is reset by Guzma + Jet Energy;
- whether Cassius + Pidgeot ex + Herdier/Grand Tree rebuilds Stoutland before the candidate's next turn;
- whether the candidate actually gets to play a Supporter;
- whether four-energy Max Geist can attack Stoutland after the 20-damage mark, accounting for Guzma's choice of the candidate's replacement Active;
- prize mapping, turns to knockout, game outcome, and failure state.

Do not accept a result from a policy that never searches for the Arbok line or an opponent policy that fails to use Guzma/Jet/Cassius when legal. Do not add Arbok to the nominated 60 until paired-seed results show a net improvement across the broader field, not only this matchup.

## Evidence classification and limitations

- **Card text / legality:** Arbok XY #48, Ekans XY #47, Stoutland BCR 122, Vileplume AOR 3, Pidgeot ex, Guzma, Jet Energy, Cassius and Grand Tree card texts in the repository card pool; Arbok's Expanded legality also appears on Limitless.
- **Rule-derived:** attack effects are removed when the affected Pokémon moves to the Bench; damage remains. The attack effect applies to the Defending Pokémon, not to all Pokémon with the same name.
- **Derived interaction:** Arbok can suppress Sentinel while the specific Stoutland remains in play and can create a 4-Psychic-Energy Max Geist knockout threshold after 20 damage.
- **Hypotheses:** opponent reset probability, Arbok setup rate, actual Supporter-window frequency, and matchup win-rate change.
- **Not tested:** no complete Twinleaf game, opponent response, paired-seed experiment, policy comparison, or matchup result; no change to the nominated 60 and no competitive win-rate claim.

Related research: [Agent27's Sentinel double-lock counter census](agent27-sentinel-double-lock-field-counter-census-20261112.md), [Agent48's Baltoy Rapid Spin assessment](agent48-baltoy-rapid-spin-stoutland-lock-hypothesis-20261113.md), and the current Shadow Rider candidate linked above.


## Diagnostic field input for the native test

The exact rank-2 60 is also present in Agent39's latest [identity-normalized Aichi diagnostic artifact](https://github.com/FlareZ123/experiment-01/actions/runs/43407979154/artifacts/14027319169), under `diagnostic_normalized_field.decks` with `rank: 2`. This export has 24 complete 60-card decks, source-row provenance and functional-text hashes; all 24 deck counts were independently checked. It is explicitly diagnostic-only and does not paper-qualify the field. Its `normalized.card_id` values come from `resources/cards/en`, not guaranteed Twinleaf IDs, so the native runner must resolve them through the adapter before constructing the opponent deck.


## Pinned-native staged effect result (13 November 2026)

The already-running focused native probe completed successfully on GitHub Actions run [43411117171](https://github.com/FlareZ123/experiment-01/actions/runs/43411117171), commit `38938dffaaae997d456fdd10bd3165340e5fd232`, using pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Artifact [14029697862](https://github.com/FlareZ123/experiment-01/actions/runs/43411117171/artifacts/14029697862) has SHA-256 `2dd8c280e0537d2e4693509574f9260e409c8a8a6a3971acd371411b20e7990d`.

Both constructed-board cases passed: (1) Stoutland without Stealthy Hood and (2) Stoutland with Stealthy Hood. Before Gastro Acid, Stoutland's Sentinel and Bench Vileplume's Irritating Pollen were visible and unblocked. After the native `AttackAction`, Stoutland's Sentinel was blocked and absent from visible Powers in both cases; Bench Vileplume's Irritating Pollen remained visible and unblocked in both. The same result with Hood supports the narrow engine finding that Stealthy Hood does not prevent this attack effect. Both cases retained Stoutland Active and Vileplume on the Bench; the test had no unresolved choice prompts and one non-choice WaitPrompt.

**Strict limits:** the output records printed Gastro Acid damage as 20 but `damageCounterObserved` remained 0; damage resolution was expressly not asserted. The test did not resolve the WaitPrompt, move Stoutland to the Bench, test Guzma/Jet/Cassius responses, play a Supporter, or run a complete game. It is one staged board and a native attack-effect/ability-reducer check, not a matchup test or paper-competitive evidence. Keep the proposed two-slot Arbok challenger unbuilt and the nominated Hood Shield Shadow Rider v1 unchanged pending the broader integration gates and paired full-game evidence.
