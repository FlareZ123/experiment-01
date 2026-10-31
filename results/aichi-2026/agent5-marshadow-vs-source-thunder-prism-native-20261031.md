# Champion Marshadow removes source Thorns Thunder Mountain despite Initialization

**Agent 5 · 31 October 2026 · genuine pinned native Store, staged both-seat mechanical test.** This note advances a **source-relevant tactical line**, with zero qualified competitive matchups.

## Registered source intersection

The authentic Aichi Open League 2026 Top32 source list collection [`full-decklists.json`](full-decklists.json) contains:

| Source final rank | Original printed card | Copies |
| ---: | --- | ---: |
| 1, Yasunori Kato, Shadow Rider Calyrex | **Marshadow UNB 81** | 1 |
| 6, Ryutaro Numahara, Iron Thorns | **Iron Thorns ex TWM 77** / **Thunder Mountain ♢ LOT 191** | 4 / 1 |
| 24, Keiichiro Miura, Iron Thorns | **Iron Thorns ex TWM 77** / **Thunder Mountain ♢ LOT 191** | 4 / 1 |
| 29, Ryuhei Harada, Iron Thorns | **Iron Thorns ex TWM 77** / **Thunder Mountain ♢ LOT 191** | 4 / 1 |

The source rank1 also uses **2 Sky Field ROS**, **1 Dimension Valley PHF**, **1 Field Blower GRI**, **1 Hisuian Heavy Ball ASR**, **4 Fog Crystal CRE**, and **4 Mysterious Treasure FLI**. This makes the singleton Marshadow strategically accessible through its Basic Psychic status, but no line frequency is established without actual draw/Prize and policy modeling.

## Why this interaction is discrete

Three effects interact:

1. **Iron Thorns ex Initialization**, while Thorns is Active, makes Pokémon with a Rule Box (other than Future Pokémon) have no Abilities. **Marshadow UNB has no Rule Box**, so the opponent's Initialization does not suppress its **Resetting Hole**.
2. **Thunder Mountain Prism Star** reduces Lightning Pokémon attack costs and has a protective rule against Item and Supporter effects directed at the Stadium. Thus the rank1's conventional **Field Blower** cannot remove that Stadium with its Item effect, while a Pokémon **Ability** such as Resetting Hole can.
3. **Prism Star replacement**: when the Stadium would be discarded, it is sent to its *owner's Lost Zone*. Resetting Hole also discards the Benched Marshadow and its attachments, freeing that Bench slot. The lost-zone destination is essential. A simulator test that checks only the discard pile will incorrectly label this successful interaction as a failure.

The rank1 alternatives of **Sky Field** and **Dimension Valley** can replace an opponent's Stadium subject to Stadium play restrictions. They must be compared against the Marshadow route because playing one's own Stadium can preserve a useful Bench support Pokémon and may have additional strategic effects. Being able to remove the Stadium does not automatically make spending the singleton Marshadow optimal.

## Preregistration and actual test

The [preregistered paper/natively testable contrast](registrations/agent5-marshadow-thunder-mountain-20261031.md) uses pinned Twinleaf Store `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Independently stage each actual physical seat 0 and 1:

- Own Active: Venonat MEW with attached Psychic Energy SVE and payable **Gnaw**.
- Own Bench index 0: **Marshadow UNB**.
- Opposing Active: **Iron Thorns ex TWM**.
- Opposing live Stadium: **Thunder Mountain Prism Star LOT**.
- Sufficient ordinary cards in both decks and six Prize slots. No original 60 naturally dealt, no fabricated opponent concealed hand.

For each seat, the two treatment branches start from independently reconstructed Stores with **identical detached owner-visible observations**. Control executes genuine native Gnaw, leaving the opposing Stadium. Treatment dispatches genuine `UseAbilityAction('Resetting Hole')` for the physical Benched Marshadow, settles only nondiscretionary native `WaitPrompt` steps and inspects public Stadium, Lost Zone, Bench and discard. On success, it dispatches genuine native Gnaw afterward. A no-Stadium negative branch tries the Ability without a target and retains the exact native failure.

### Native outcomes

| Check | Owner physical seat 0 | Owner physical seat 1 |
| --- | --- | --- |
| Baseline Gnaw accepted | Yes | Yes |
| Resetting Hole dispatch accepted | Yes | Yes |
| Thunder Mountain removed from Stadium | Yes | Yes |
| Thunder Mountain in opposing Lost Zone, absent from ordinary discard | Yes | Yes |
| Marshadow left own Bench for own discard | Yes | Yes |
| Same owner turn remains for an attack | Yes | Yes |
| Subsequent Gnaw accepted after removal | Yes | Yes |
| No-Stadium Ability variant | Native rejected (error retained) | Native rejected (error retained) |

**Positive count: 2/2 independently staged physical seats.** These are deterministic **mechanical validations**, neither game-win observations nor an estimated win probability.

The first older CI [run 41167906890](https://github.com/FlareZ123/experiment-01/actions/runs/41167906890) reported zero positives despite clean Ability dispatch because its postcondition incorrectly demanded that the Prism Star Stadium appear in ordinary discard. The [preregistration was corrected before inspecting those native results](registrations/agent5-marshadow-thunder-mountain-20261031.md), to require its owner's Lost Zone. The updated genuine Store test then passed in [CI run 41168151212](https://github.com/FlareZ123/experiment-01/actions/runs/41168151212).

### Reproducibility

- **Final CI:** [run 41168151212](https://github.com/FlareZ123/experiment-01/actions/runs/41168151212), completed success, head `b9cd73e2d68d7d48f22a9e2885567840d41d53db`, actual Twinleaf pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- **Raw artifact:** [13029593195](https://github.com/FlareZ123/experiment-01/actions/runs/41168151212/artifacts/13029593195), archive `actor-only-root-native-retrospective-rank11`, SHA-256 `b11816f4df137d1a68932f0590897aaaab0264d3415a686b6ae7765dc45e0987`, retained through 30 November 2026. File `agent5-marshadow-thunder-mountain-native.json` contains full physical-seat observations, accepted actions, public-zone snapshots, negative errors and control damage.
- **Runnable source:** [`simulation/twinleaf/agent5-marshadow-thunder-mountain-native.cjs`](../../simulation/twinleaf/agent5-marshadow-thunder-mountain-native.cjs) as invoked by the existing **manual-only** [`agent5-owner-root-native.yml`](../../.github/workflows/agent5-owner-root-native.yml). The original upstream Twinleaf is not modified.
- **Paper sources:** supplied complete card-pool JSON `sm10-81` Marshadow, `sv6-77` Iron Thorns, `sm8-191` Thunder Mountain; Advanced Player's Rulebook §C-01, E-20, and passive Ability mechanics. See also the [official card text](https://limitlesstcg.com/cards/unb/81) and [Prism Star mechanics](https://bulbapedia.bulbagarden.net/wiki/Prism_star).

## Immediate research handoff

The existing common actor root supports only a narrow set of activated Abilities, including Perfection. It currently lacks a public-observation-safe **Benched Resetting Hole decision proposal** and typed native `UseAbilityAction` case. A default-off independent proposal could examine *publicly visible* opposing Stadium name, its explicit source effect, Marshadow's Bench presence, actual Ability locks, and the owner opportunity cost of an available Stage/Supporter/search/attack or held Sky Field. It should be applied symmetrically to both seats and reconciled against native physical outcomes. **Do not unconditionally prioritize Marshadow over playing an accessible Sky Field or Dimension Valley.**

Only rank1 versus ranks6/24/29 is authenticated here. Other source Stadiums can change usability, including **Silent Lab PRC** suppressing Basic Pokémon Abilities. A separate Path/Silent matrix was preregistered but its proposed native implementation could not be created because the repository tool blocked that operation. No matrix result should be inferred.

The 99.5% single-60 objective remains unproven. The full field still has missing final ranks **23/25/28**, opponent action policies and clock logic remain unqualified, and **zero** games qualify as competitive evidence. This tactical result should improve future decision policy and matchup study, without being counted as a game win.
