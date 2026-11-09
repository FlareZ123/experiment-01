# Cape Sentinel survives original rank-1's conditioned paid four-Psychic Max Geist

**Agent 25, 9 November 2026.** An opt-in experiment using two complete original 60-card inventories, a pinned genuine Twinleaf Store, and native Guzma plus Max Geist actions. The experimental candidate changes exactly one physical copy in the existing Sentinel Vileplume list: **3 Stealthy Hood -> 2 Stealthy Hood, 0 Luxurious Cape -> 1 Luxurious Cape**. No full-game strength or 99.5% win-rate evidence is claimed.

## Actual answer to a previously reproduced tactical loss

Agent 28 independently demonstrated that the existing [Sentinel Lopunny/Vileplume](../candidate-sentinel-lopunny-vileplume-v1.psv) first-turn Item lock is vulnerable to the unchanged original rank-1 Shadow Rider's real **Guzma -> Vileplume AOR becomes Active -> four-Psychic Max Geist for 130 -> 130-HP Vileplume Knock Out, one Prize**. The conditioned active damage and Prize resolution were already validated on both physical seats in [its detailed native evidence](agent28-sentinel-rank1-guzma-counterreply-native-20261108.md).

The **new fixed [Cape Sentinel v1 printed 60](agent25-cape-sentinel-v1.psv)** preserves the original 60 except for one Tool swap. The printed and natively implemented **Luxurious Cape PAR 166** increases the maximum HP of an attached Pokémon without a Rule Box by 100. When attached to Vileplume AOR, a real 130-damage attack cannot KO the resulting **230-HP Vileplume**. However, a later Knock Out caused by an opposing attack awards the opponent **one additional Prize**, making the protection potentially very expensive if the opponent can hit for 230 or remove the Tool at a favorable time.

## Two-physical-seat native experiment completed

[Successful manual workflow 42559456392](https://github.com/FlareZ123/experiment-01/actions/runs/42559456392), job `128972445640`. Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, no added vendor modifications or hook for Cape. Reproducible [actual action test](../../../simulation/twinleaf/2026-11/agent25-cape-sentinel-maxgeist-native.cjs), machine-readable [one-slot modified 60](agent25-cape-sentinel-v1.json), and unmodified [source-rank1 original sixty](../full-decklists.json). The four output records are preserved in the workflow artifact `agent25-cape-maxgeist-native`.

| Candidate physical seat | Cape on evolved Vileplume | Actual Max Geist Knock Out | Opponent actual Prize cards taken | Resolution |
| --- | --- | --- | --- | --- |
| 0 | No | **Yes** | **1** | Prize and replacement Active prompts |
| 0 | Yes | **No** | **0** | Vileplume retains 130 damage, survives |
| 1 | No | **Yes** | **1** | Prize and replacement Active prompts |
| 1 | Yes | **No** | **0** | Vileplume retains 130 damage, survives |

All four arms:
- Instantiate the exact fixed candidate and exact original published rank-1 source from `planAichi`; verify **60 unique actual card objects and six distinct Prize cards for each player**.
- Arrange a deliberately conditioned source board on native global turn 3, with a real Benched Stage-2 Vileplume (Cape preattached in treatment), original source Bunnelby Active, and rank-1's actual Shadow Rider VMAX on Bench with four physical Basic Psychic attached, plus original Guzma in the rank-1 hand and Mimikyu on Bench.
- Dispatch authentic `PlayCardAction(Guzma)`, accept both native `ChoosePokemonPrompt` responses, promote the genuine opposing Vileplume and source powered VMAX, and confirm Supporter quota was consumed.
- Dispatch authentic native `AttackAction('Max Geist')`, settle engine prompts and inspect actual damage, Knock Out, physical discard, remaining Prizes and full card object custody.
- Use the official compiled `LuxuriousCape` CardManager printing and native HP/Knock Out logic, not an emulated attack, theoretical effect, or mocked native play.

## Immediate practical qualification: can the Tool be in place before the reply?

**The four states are favorable midgame conditionings, rather than proof the opening line can produce Cape-equipped Vileplume on the first Item-lock turn.** Against the natural original rank-1 response, Cape must be attached to Oddish before the source's Bunnelby uses TM: Evolution twice, since the attack ends the turn. Cape remains attached through evolution, per ordinary Pokémon Tool/evolution rules. The known Sentinel first-turn paid Guzma & Hala line normally obtains **TM: Evolution as its sole Tool**, and Stadium Artazon plus Jet Energy in the other channels. If this line relies on G&H to locate TM, the single Tool search cannot independently fetch Cape as well. Access must instead come from a separately held Cape, another legitimate prior search, or a revised setup sequence that preserves the necessary TM.

The fixed one-Cape list also has a concrete cost: reducing Stealthy Hood from three to two weakens protection against some opposing Ability suppression. Cape can enable an opposing two-Prize Knock Out later even if the initial four-Psychic hit fails, and Tool removal or a larger Max Geist turn can make it worse. A Rhyperior Wide Wall shield has a separate first-turn timing issue because Grand Tree cannot evolve its line on either player's first turn and TM: Evolution requires Bunnelby Active during its attacks.

**Decision:** Advance Cape Sentinel to a **first-turn, physically paid native opener test** with Cape held/attached before TM evolution, then a native rank-1 Guzma/Max Geist answer from the same source conditioning. Evaluate real Cape access and retained Hood protection before any prospective original-29 opponent policy comparison. Preserve the two original fixed 60s, root choices and failed search paths. No complete games qualified and the remaining original ranks 23/25/28 are still unverified.
