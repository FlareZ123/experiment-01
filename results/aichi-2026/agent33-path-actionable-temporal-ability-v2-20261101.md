# Path to the Peak: active Ability value differs from presence of printed Ability text

**Agent33, 1 November 2026.** Research class: paper-card-text reasoning plus an optional source-policy correction, compiled native result pending. **No original-source match performance or competitive win claim.**

## Concrete defect in the v1 root chooser

The earlier optional `pathToPeakOpposingAbility` asks whether each publicly visible Pokémon has a Rule Box and a printed Ability. It rejects Path whenever any such own Pokémon is in play and proposes an opponent target when any such opposing Pokémon is in play. That detects potential *printed* Ability presence but does not establish an ability is *still usable*. This matters directly to the original 2026 Aichi source field.

Original printed 60s in `results/aichi-2026/full-decklists.json` contain **eight Path to the Peak CRE148** in seven final ranks:

| Rank | Exact source archetype | Path copies | Relevant source Pokémon |
| --- | --- | ---: | --- |
| 5 | Mew Genesect | 2 | 4 Genesect V, 1 Dedenne-GX, 1 Crobat V |
| 9 | Absol Electrode | 1 | 1 Dedenne-GX, 1 Squawkabilly ex |
| 12 | Regidrago | 1 | 3 Regidrago VSTAR, Dedenne-GX, Crobat V, Tapu Lele-GX |
| 15 | Lopunny Vileplume | 1 | Eldegoss V |
| 20 | Regidrago | 1 | 3 Regidrago VSTAR, 2 Dedenne-GX, Tapu Lele-GX |
| 21 | Regidrago | 1 | 3 Regidrago VSTAR, Dedenne-GX, Crobat V, Tapu Lele-GX |
| 27 | Regidrago | 1 | 3 Regidrago VSTAR, Dedenne-GX, Crobat V, Tapu Lele-GX, Eldegoss V |

These are physical card counts, **not** observed in-game Path opportunities.

## Precisely bounded temporal classification

Official supplied Advanced Player's Rulebook, section **E-06**, limits Abilities beginning "When you play this Pokémon from your hand onto your Bench" to that event. The supplied English card pool confirms this is the entire Ability text of exact `Dedenne-GX UNB57` (Dedechange), `Crobat V DAA104` (Dark Asset), `Tapu Lele-GX GRI60` (Wonder Tag) and `Eldegoss V RCL19` (Happy Match). After one is already in play, its entry trigger is over. A Path placed *now* cannot retroactively prevent its completed arrival effect.

The printed `Regidrago VSTAR SIT136` has **Legacy Star** as its sole Ability. Its text and pinned reducer establish that it is a once-per-game VSTAR Power. After the player-wide **`usedVSTAR===true`**, that Ability cannot be used again, and Path has no immediate additional effect on Legacy Star. `Apex Dragon` remains an attack, which Path does not suppress.

In a default-off v2 correction to `simulation/twinleaf/agent33-path-to-peak-public-lock.cjs`:

1. **In-play entry-only Pokémon** listed above no longer count as currently actionable own or opponent Ability targets. A copy still in the owner's *hand* remains protected because it can be played later with its Ability live.
2. **In-play and held Regidrago VSTAR SIT** stop counting as prospective Ability access once the *own player's* public `vstarUsed` flag is true. Likewise, a spent opponent's Regidrago VSTAR alone is insufficient to justify a current Path proposal.
3. **Genesect V FST185 Fusion Strike System**, ongoing Pokémon VMAX draw Abilities, and unknown Rule Box Abilities remain conservatively active. The existing unused Forest/Sky Seal Stone public-power check is unchanged.

This classification is **instantaneous**. Bounce-and-rebench effects, future ability recovery, opponents removing Stadiums, opportunity cost of the Stadium slot, a held opponent evolution and longer-term resources are unresolved. It does not assert that playing Path is optimal, only that certain earlier v1 immediate self-lock and target flags were demonstrably too coarse. A card's printed Ability can also be suppressed by an existing effect; this model does not certify currently executable powers in those cases. In particular, Genesect's once-this-turn use marker is **not** currently exposed through the canonical detached owner observation; the new rule preserves its self-lock veto even when a particular copy might already have used Fusion Strike System.

## Reproducibility and tests

- Code: `simulation/twinleaf/agent33-path-to-peak-public-lock.cjs`, version `agent33-path-to-peak-visible-actionable-power-v2`. The root flag `pathToPeakOpposingAbility` remains **off in frozen benchmarks**.
- Pure regression suite: `tests/agent33-path-to-peak-public-lock.test.cjs`, now covers held versus already-played arrival triggers, spent versus unspent VSTAR, preserved live Genesect and public-only boundaries.
- Compiled pinned native baseline Path-to-Genesect suppression had previously passed both seats in [CI 41272652518](https://github.com/FlareZ123/experiment-01/actions/runs/41272652518). This does not by itself prove the new temporal policy.
- No original-source 60s, registered seeds, vendor revision, candidate fixed 60s or prior study results were changed.

**Release status:** 32/32 known archetypes, **29/32 authenticated original opposing 60s**, **0 competitively qualified games**, and no established 99.5% fixed-deck performance.
