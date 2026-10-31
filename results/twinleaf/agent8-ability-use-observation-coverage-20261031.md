# Public once-per-turn Ability-use state missing from the actor decision observation

**Agent 8 | 31 October 2026 | evidence: source-text census + pinned-engine and policy-source inspection.** This is a structural policy sufficiency finding. No full-game competitive performance is inferred.

## Measured original 29-list exposure

I parsed the supplied `card-list.zip` archive and resolved every Pokémon row in `results/aichi-2026/full-decklists.json` by exact English set abbreviation and collector number. Promos use their ordinary `SM` or `XY` number prefix: `SMP 217` maps to `smp-SM217`, `XYP 67` to `xyp-XY67`. All **309 Pokémon decklist rows matched exactly one archive printing**: **102 unique printings** and **467 physical Pokémon copies** summed across the 29 lists.

Among those 102 printings, **33** had an Ability whose English text contained either `once during your turn`, `once during your first turn`, or `you can't use more than 1`. These appear as **179 printed copies across 25 of the 29 original lists**. This is text-exposure incidence, **not** 179 usable Ability actions. Several effects trigger when Bench-entered, consume their own Pokémon, end the turn, or otherwise impose different practical restrictions; the marker requirement for each printing must be verified separately. Textual matching can omit paraphrased history effects. The source manifest contains zero of these identified printings in ranks 6, 7, 24 and 29.

Concrete field printings include:

| Source card | Ranks | Source copies | Relevant printed text |
| --- | --- | ---: | --- |
| Shadow Rider Calyrex VMAX CRE 75 | 1 | 4 | Underworld Door, once per turn |
| Pidgeot ex OBF 164 | 2, 15 | 4 | Quick Search, once per turn and at most one across copies |
| Pidgeotto TEU 123 | 2, 15 | 3 | Air Mail, once per turn |
| Genesect V FST 185 | 5 | 4 | Fusion Strike System, once per turn |
| Regidrago VSTAR SIT 136 | 10,12,13,14,18,20,21,27,32 | 27 | Legacy Star once-per-game VSTAR Power |
| Dedenne-GX UNB 57 | 18 ranks | 22 | Dedechange once per turn when Bench-entered |

The counts are per physical decklist copy and are deliberately not frequency of entering play. The source-matched 29 lists remain incomplete with respect to the specified Top 32 (ranks 23, 25, 28 unresolved).

## Concrete native mechanism

In pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, `ptcg-server/src/sets/10-scarlet-and-violet/set-obsidian-flames/pidgeot-ex.ts`:

- `Quick Search` checks `player.marker.hasMarker(this.QUICK_SEARCH_MARKER)` and throws `POWER_ALREADY_USED` when set.
- On successful use it adds that marker and the public board effect `BoardEffect.ABILITY_USED`; it removes the marker at the relevant EndTurnEffect.
- The actor's `simulation/twinleaf/actor-observation-contract.cjs::visiblePokemon` exports `abilities` and `abilityDetails` but has no Ability-used marker or boardEffect field.

The same pinned source for Shadow Rider Calyrex VMAX CRE `Underworld Door` has a per-Pokémon `UNDERWORLD_DOOR_MARKER` and throws `POWER_ALREADY_USED` if it exists. Its owner-visible resource requirement includes a held Psychic Energy and eligible Benched Psychic recipient, which still require native legality checks. The root observation has current hand and board, but does not carry the native used-marker.

Thus the actor-only view loses public same-turn resource history: after other hand/deck actions, a board with used Quick Search can become observationally indistinguishable from one where it remains unused. Any future general Ability chooser trained on the current detached observation has no authoritative way to tell whether the use has already been spent.

## Why this matters for the shared first-return chooser

This is a prerequisite for comparing genuine same-root actions. If the proposal vocabulary adds Ability activation without preserving its used-state, the option set may contain known-unplayable actions or suppress a still-available one. Native Store rejection is essential as a final gate, but does not repair the *priority comparison* that already chose an invalid plan.

Suggested bounded remedy: introduce a detached per-face-up-Pokémon Ability-use receipt at the authenticated native Store observation boundary, plus player-global once-per-turn and VSTAR/GX quota where relevant. Preserve exact printed card identity, visibility and turn provenance. A public boolean and an explicit `unknown` are preferable to leaking internal Player markers or assuming absence means unused. Native acceptance must validate the interpretation. Use source rank 2/15 Pidgeot ex and rank 1 Calyrex VMAX as focused both-seat positive/negative tests before broad rollout.

The separate source-derived Mega Lopunny movement-history gap is described in `results/twinleaf/agent8-native-movement-observation-alias-20261031.md`. Together these reveal the broader architectural need for **sufficient public event history** in the actor observation contract. Neither report proposes tournament win rates or a claim of 99.5%. **Zero competitively qualified games.**
