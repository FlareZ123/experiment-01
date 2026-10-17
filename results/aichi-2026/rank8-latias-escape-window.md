# Rank-8 source-dealt Latias escape window

**Agent 9, 17 October 2026.** Direct source action-summary audit, **not** a qualified game or winner counterfactual.

[Manual CI run 39041216040](https://github.com/FlareZ123/experiment-01/actions/runs/39041216040) [artifact 12104312369](https://github.com/FlareZ123/experiment-01/actions/runs/39041216040/artifacts/12104312369) ZIP SHA256 `0c091afb45b6c212c07010ebea5641121d5c732a0ad7032721aacdbc1ffb99f3`. Internal `aichi-campaign-diagnostic.json`, `pilot:8:0:champion-reference:A`, actual candidate first, seed **3755937400**, research revision `0de5fdf1965dbc388cebe65dff400cb5a5494b9c`; pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Independently verified trace digest `ea18abc87f8e4fdd759298689ca50c749a1dcbca5e8e579efc359677e24bd910`.

Four **separate turns in the same game** contained an identical tactical resource conjunction at the candidate's Pass: global turn/action **21/136**, **23/143**, **25/149**, **27/159**. The candidate had Active **Latias ex SSP76** with two Psychic, Benched **Trevenant & Dusknoir-GX SM217** with three Psychic, and **Field Blower GRI125** in hand. The opponent had Active Crobat V and Benched **Garbodor LTR68** holding **Float Stone**. The candidate passed on all four turns.

**Paper-text route to test:** Field Blower can discard the Float Stone, disabling Garbotoxin's Tool prerequisite. This would restore Latias's Skyliner, giving Basic Latias zero Retreat Cost. Its ordinary retreat could promote the already three-Psychic Trevenant & Dusknoir-GX for **Night Watch** (printed three-Psychic cost; 150 damage and two random opposing hand cards shuffled into deck). Also, Latias's printed retreat cost is two Colorless, so its two Psychic provide a separate potential **paid normal retreat** even before removing Garbotoxin. The opponent's prior turn 20 recorded Pass and the earlier attack chronology shows no contemporary attack-caused retreat lock.

**Unresolved:** The action summary does not certify that the once-per-turn normal retreat was unused or that no residual restriction exists; its full reducer/prompt history is absent. **Neither route has been submitted to the original pinned Store.** Preserve original source-state noninterference, execute both branches from the genuine turn21 pre-Pass Store, verify actual card selection, power recalculation, retreat legality, Night Watch effects, and opponent's continuation. Do not splice separate dealt games.

The original 45-turn diagnostic eventually awarded the champion the win after later Trevenant & Dusknoir attacks. Four observed Passes are correlated opportunity observations, **not** four lost games or any estimated increase in win rate. Existing competitive evidence remains **0** qualified games out of an incomplete 29/32 exact source field.

## Why the complete resource conjunction matters

The same source artifact also has `pilot:8:0:hood-shield-v1:A`: the candidate passed **nine** times against an equipped Benched Garbodor, and held Field Blower at **eight** such passes. It did **not** have a three-Psychic Trevenant & Dusknoir-GX available at those eight states, so these cannot be treated as equivalent immediate Night Watch opportunities. In addition, the hood candidate's Latias had Float Stone; restoring Skyliner there is not the same mobility gain.

Thus a naive count of "held Field Blower while locked" substantially overstates the immediately executable tactical paths. The champion-reference's four repeated states are distinctive because the potential attack destination was already powered. Preserve this distinction in AMR/connector modeling.

Another important control: hood-shield Latias ex **used Eon Blade on global turn 25** and passed on turn 27; Eon Blade's own text prevents that same Pokémon from attacking on its following turn. That turn-27 Pass is not evidence of an omitted legal Eon Blade. Source-card effects and temporal restrictions must be included before classifying any cost-covered Pass as a bot failure.
