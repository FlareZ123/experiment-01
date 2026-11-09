# Rank-9 original source v13: highest-HP opponent Rope defense backfires

**9 November 2026 | native original-source developmental diagnostic | 32 real matches / 16 exact matched physical pairs | zero competitively qualified games**

## Decision

The opponent's automatic replacement choice is a decisive confound in the successful original rank-9 v12 Escape Rope line. A stronger opponent-specific stress policy that chooses its highest-current-HP Benched Pokémon at its own native `ChoosePokemonPrompt` was **physically accepted** in both affected games. It did **not** suppress the original source's Claw victory. Against New Moon, it accelerated the source's win, selecting a 240-HP three-Prize TAG TEAM vulnerable to the 200-Darkness source attack.

This falsifies **maximum printed remaining HP** as a generally useful defensive Escape Rope heuristic in this field. A defensive policy must account for Weakness, prizes surrendered and attacking opportunity, rather than just printed HP.

## Exact native observations

- [Manual native run 42597351313](https://github.com/FlareZ123/experiment-01/actions/runs/42597351313), successful, fixed GitHub head `0d95bf259251d1469f9e8bd3cf549bed5cd7389b`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Downloadable workflow artifact **13664127514**, `agent29-rank9-rope-opponent-survival-v13`, retains **all 32 genuine native attempts**, complete controls and censored trials.
- Original source v12 control and v13 counterpolicy treatments use the same fixed printed original rank-9 60 and candidate 60s, same 16 actual two-player physical opening deal fingerprints. **16/16 v13 control root ledgers exactly match prior independent v12 treatment**. Fifteen of 16 v13 control/treatment root action ledgers are byte-identical. Both arms have 11/16 native terminals and five caps, no native errors and no newly completed wins.
- Source rank-9 seat0 versus champion-reference: source `Escape Rope BST` native root181 global turn44; opponent-own `ChoosePokemonPrompt` root182, source-own switch root183, source Claw root184. Opponent owner chose **Latias ex SSP**, 210HP. The original bot also chose Latias, leaving the native source win at root223 unchanged.
- Source rank-9 seat0 versus New Moon: source Rope root105 global turn18, opponent prompt root106, own prompt root107, first Claw root108. The old v12 opponent chose **Galarian Articuno V CRE**, 210HP, worth 2 Prizes after a Darkness-weak KO. V13 selected **Gengar & Mimikyu-GX TEU**, printed 240HP with Darkness Weakness, **three-Prize TAG TEAM**, thus original Mega Absol ex M1L's 200-Darkness Claw knocked it out. V12 source Prize transitions after successive Claws were `[6,4] -> [4,4] -> [1,4] -> [0,4]`, three Claws and source native win at root135. V13's transitions were **`[6,4] -> [3,4] -> [0,4]`**, only two Claws and source native win at root**123**.
- The actual owner of the defending Pokémon, not the source attacker, made the v13 choice. It was a native `ResolvePromptAction` accepted by the actual Store; the source actor was never given opposing concealed information. The opponent then played Tapu Lele-GX and passed, a serious opponent policy weakness. Zero paper-competitive qualification.

**Subtle measurement limitation:** the action-type root ledger does not expose the selected physical Pokémon inside an accepted `ResolvePromptAction`. Root prefix identity cannot certify equal prompt contents or tactical outcomes. Read the attached native opponent-choice audit and attack settlement alongside root hashes.

## Implementation

Existing opt-in [post-Bomb Rope adapter](../../../simulation/twinleaf/2026-11/agent29-rank9-postbomb-escape-rope.cjs) accepts `defensiveOpponentChoice:true`. Its owner-only `chooseOpponentRopeSurvival` chooses maximum public `pokemon.hp - slot.damage`, validates the exact native prompt and never intervenes in the original source's own choice. [Pure tests](../../../tests/2026-11/agent29-rank9-postbomb-escape-rope.test.cjs) guard prompt owner, eligible slots, two source-seat orientations and invalid cards. [Native runner](../../../simulation/evaluation/agent29-rank9-compressor-owner-bridge-retro.cjs), [precommitted registration](../registrations/agent29-rank9-v13-opponent-rope-survival-20261109.json), and [manual only workflow](../../../.github/workflows/agent45-electrode-bomb-native-store.yml) preserve and differentiate every condition.

## Direction

Build a v14 **opponent-owned public printed damage / Weakness / Prize-aware native prompt policy** in a new frozen incremental same-deal comparison, while preserving v12 and v13 controls. This is a necessary adversarial pressure test before treating the original source's two natural wins as meaningful against capable opponents.

The benchmark still lacks 3 original Top32 source lists, 32 competent matchups and independently paper-certified full games. Do not nominate one final fixed 60 or claim 99.5% based on these source-native games.
