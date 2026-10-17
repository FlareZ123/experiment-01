# Garbotoxin re-Tool response after Faba: why Hood changes lock persistence

**Agent 6, 17 October 2026.** Scope: a conditioned Stage 2 board with **real two-turn pinned Twinleaf Store actions**, source-printed card effects, and full turn-transition prompts. The starting state and available responses are deliberately staged, so this is **not** a full source-dealt matchup, opponent-policy observation, or win-rate test.

## Exact source motivation

The [published Aichi field manifest](../aichi-2026/full-decklists.json) records at **rank 2** one **Faba LOT 173**, three **Stealthy Hood UNB 186** and two Item-locking **Vileplume AOR 3**. Every published Garbotoxin deck (**ranks 8, 11, 16 and 22**) includes **four Quick Ball FST 237** and **six Pokémon Tools**: rank 11 carries three Float Stone, one Muscle Band, two Forest Seal Stone; each of the other three ranks carries four Float Stone, one Muscle Band, one Forest Seal Stone. These deck quantities do not establish that a player actually holds a replacement Tool on the crucial turn.

The supplied Advanced Player's Rulebook treats pre-2023 attached **Pokémon Tool** cards as Tools even when their older printed instruction or taxonomy mentions Items. Therefore a Float Stone from the hand can be attached while a Vileplume AOR Item restriction is active, provided there is a legal Tool slot. Garbotoxin from Garbodor **BKP 57** or **LTR 68** resumes as soon as a Tool is attached, potentially suppressing bare opposing Vileplume. Hood protects the attached Vileplume from the **opponent's** Ability.

## Reproduced chronological action sequence

The [self-asserting fixture](../../simulation/twinleaf/garbotoxin-retool-after-faba.cjs) constructs a Vileplume player's evolved Oddish/Gloom/Vileplume Bench stack, an opposing Trubbish/Garbodor stack with Float Stone attached, ordinary Active Pokémon, Prize cards and nonempty decks. It executes:

1. **Faba LOT from hand**. Select the opposing Pokémon Tool mode and target Garbodor using the engine's Select and ChoosePokemon prompts. Verify the first Float Stone enters the opponent's **Lost Zone** and Garbodor no longer carries it.
2. In one branch, attach **Stealthy Hood UNB from hand** to Vileplume **after Faba**, while Vileplume's Item lock operates. In a second branch Hood is already attached; a third branch has no Hood.
3. Issue a genuine **PassTurnAction**, resolve the nonvisual **Pokémon Checkup and next-turn/draw WaitPrompts**, and verify the opponent's turn begins. The fixture does not assign the next active player or increment the turn manually.
4. **The opponent plays a second Float Stone BKT** from hand on Garbodor through Item lock.
5. **The opponent attempts Quick Ball FST** from hand. The Store must accept the Item if bare Vileplume is suppressed again, and reject it if opposing Garbotoxin cannot bypass Hood on Vileplume. Assert card preservation, real prompt issuance and both Tool locations.

The matrix covers **two player seats × two actual Aichi Garbodor printings × three Hood timing cases = 12 complete source-card action chains**.

## Results

[**Manual compiled GitHub Actions 39028335765 passed**](https://github.com/FlareZ123/experiment-01/actions/runs/39028335765) at research commit `ee8f11717591a00d74b3d212de3317511fb12e5d` with Twinleaf pinned `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. All existing Faba/Tag Call and Grand Tree checks in that manual workflow passed concurrently.

| Hood on the rank-2 Vileplume | Opponent reattaches Float Stone during Item lock | Garbotoxin effect on Vileplume | Opponent Quick Ball |
| --- | --- | --- | --- |
| **None** | **Accepted** | Suppresses bare Irritating Pollen again | **Accepted**; effect prompt opens |
| **Already attached** | **Accepted** | Hood protects Vileplume from opposing Garbotoxin | **Rejected**, remains in hand |
| **Attached from hand after Faba** | **Accepted** | Newly attached Hood preserves Irritating Pollen | **Rejected**, remains in hand |

Both printed Garbodor versions and either source-owner physical seat produced these results. The original Float Stone remained in the Lost Zone while the new Float Stone was attached. The engine's turn Checkup and starting draw were executed rather than approximated.

## Strategic interpretation and qualification

Against a Garbodor player who **actually has another Pokémon Tool in hand**, an isolated Faba removal can provide only a **temporary Item-lock window**: on the next turn, the opponent may reattach a Tool even while Vileplume blocks Items, enabling Garbotoxin and opening Quick Ball access. A Hood attached to Vileplume, even if attached after Faba during the restored lock, prevents this specific re-Tool counterline. This shows why rank-2's three Hood copies and the competing Garbodor decks' six Tool slots deserve stateful treatment instead of independent lock bonuses.

The test does not model fair drawing, actual source Prize layouts, timing of Stage 2 setup, availability of a spare Float Stone, alternate Tools, opposing removal of Hood, evolution/retreat countermoves, strategic choices, or entire matches. A real player may prefer another action even when this counterline is legal. **The result establishes conditional mechanics and chronology; it adds zero qualified games toward the Aichi Top 32 objective.**

Related action study: [Faba/Tag Call same-turn temporal sequencing](garbotoxin-faba-tag-call-temporal-order.md); earlier [Hood-vs-Garbotoxin priority matrix](garbotoxin-vileplume-priority.md).
