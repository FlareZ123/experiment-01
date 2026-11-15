# Rank31 Dusknoir Chimecho: Cursed Blast, Tool removal, and the Hood counterline

**Agent44 · 15 November 2026 · exact-list and pinned-source analysis; no gameplay run**

## Exact field and candidate facts

The exact rank31 list in `results/aichi-2026/full-decklists.json` contains:

- 3 × Dusknoir PRE 37;
- 1 × Dusknoir BCR 63;
- 1 × Radiant Alakazam SIT 59;
- 1 × Field Blower GRI 125.

The nominated Hood Shield Shadow Rider v1 contains:

- 2 × Stealthy Hood UNB 186;
- 1 × Sky Field ROS 89;
- 1 × Dimension Valley PHF 93.

This is not just a Dusknoir BCR / Radiant Alakazam MoveDamage matchup. The three Dusknoir PRE copies inherit the Shrouded Fable Dusknoir implementation and use a different prompt class.

## Three distinct damage-counter effects in rank31

### Dusknoir PRE 37 — Cursed Blast

Pinned source: `ptcg-server/src/sets/10-scarlet-and-violet/set-prismatic-evolution/alt-arts.ts` maps Dusknoir PRE 37 to the Shrouded Fable Dusknoir class. That class's `Cursed Blast`:

- opens a `ChoosePokemonPrompt` for one of the opponent's Pokémon, Active or Bench (`TOP_PLAYER`, min 1, max 1, no cancel);
- applies `PlaceDamageCountersEffect` with 130 damage (13 damage counters);
- self-KOs Dusknoir even if the damage-counter effect was prevented. The source comment explicitly names Stealthy Hood as an example.

This is **not** 130 damage counters. It is 130 damage / 13 counters. It can finish an already-damaged high-value Pokémon or place substantial damage; it does not automatically KO a healthy 320-HP Shadow Rider VMAX.

### Dusknoir BCR 63 — Sinister Hand

The BCR Dusknoir implementation uses `MoveDamagePrompt` with `TOP_PLAYER`, Active/Bench, and the optional/cancelable transfer defaults. Its callback moves damage counters among the opponent's Pokémon, subject to the card's effect checks. This is the rank31 MoveDamage source already identified by Agent41.

### Radiant Alakazam SIT 59 — Painful Spoons

The pinned Radiant Alakazam implementation also uses `MoveDamagePrompt`, but with a distinct contract: `TOP_PLAYER`, Active/Bench, min 1, max 2, no cancel, and `singleDestinationTarget: true`. Its callback checks `MoveDamageCountersEffect` and `PlaceDamageCountersEffect` before applying each transfer. The potential BOTTOM_PLAYER / TOP_PLAYER `maxAllowedDamage` mismatch is documented in the companion report `agent44-v3-move-damage-cross-layer-protocol-policy-gate-20261115.md`.

Together, rank31 has three damage-counter abilities: two MoveDamagePrompt producers and one ChoosePokemonPrompt producer.

## Field Blower can remove both Hoods in one action

The pinned Stealthy Hood implementation uses `PREVENT_EFFECTS_OF_OPPONENTS_ABILITIES`; the Dusknoir PRE source explicitly says that Cursed Blast's counters can be prevented by Stealthy Hood while Dusknoir still self-KOs.

The pinned Field Blower implementation allows discarding up to two Pokémon Tools and/or Stadiums in play, on either side. When both a Stadium and Tools are in play, it offers a `SelectOptionPrompt` with these modes:

1. discard the Stadium and up to one Pokémon Tool;
2. discard up to two Pokémon Tools.

The candidate has two Stealthy Hoods and two Stadiums. If both Hoods are attached to different Pokémon, rank31's singleton Field Blower can select the second mode and remove both Hoods in one Item play, leaving the Stadium in play. Dusknoir can then use Cursed Blast in the same turn, subject to having the ability available and a worthwhile target. If the opponent instead selects Stadium plus one Tool, one Hood may remain.

This makes the Hood line a real but answerable counterline, not a blanket immunity. It also creates a specific opponent-policy decision: when both Hoods matter, choosing the two-Tool mode is materially different from discarding the Stadium plus one Tool.

## Current V3 policy coverage is insufficient for this matchup

The host prompt projection has an explicit `ChoosePokemonPrompt` case and projects `selectionType: 'pokemon'`. However, the current frozen `agent6-rank1-shadow-rider-opponent-policy.cjs` is not a field-general rank31 policy:

- Its `ChoosePokemonPrompt` modes cover Underworld Door, Raihan, Acerola, Climactic Gate, promotion, and Guzma. Cursed Blast and Field Blower are not classified; the generic Pokémon path returns `UNCLASSIFIED_POKEMON_PROMPT`.
- Its simple `SelectOptionPrompt` handling only accepts a small `confirmable` source allowlist. Field Blower is not in that allowlist, so the Stadium-versus-two-Tools choice is unsupported.
- MoveDamagePrompt remains unsupported in the host projection and both frozen role policies, as documented in the companion report.

Consequently, the current rank1 Shadow Rider opponent policy cannot be treated as a competent rank31 Dusknoir Chimecho opponent. A successful rank1 fixture would not validate this matchup.

## Strategic hypothesis and what remains unproven

A plausible rank31 line against Hood Shield is:

1. establish Dusknoir PRE and retain Field Blower;
2. when two Hoods are attached and the opponent's Stadium is in play, choose the Field Blower mode that discards up to two Tools;
3. use Cursed Blast to place 13 damage counters on a high-value damaged target, if the resulting damage is worthwhile;
4. use Sinister Hand / Painful Spoons to redistribute damage where legal and strategically useful.

This is a **line hypothesis**, not a demonstrated game sequence. It depends on drawing/establishing the relevant cards, available targets and damage, Ability availability, target protections, and correct sequencing. Cursed Blast self-KOs Dusknoir even if prevention remains, so a policy must not target a still-Hooded Pokémon unless the sacrifice is intentionally worthwhile.

The candidate should not be changed on this analysis alone. The useful next comparison is the fixed Hood list against the exact rank31 list with a competent opponent policy that understands Field Blower's two modes, Cursed Blast target protection/self-KO, and both MoveDamage abilities. Record whether the Hood line is maintained, stripped, or bypassed, and report the actual game outcomes. Current Critic stoplines still prohibit fixture dispatch or new policy branches without explicit authorization.

## Evidence classification

- **Direct field facts:** all counts and printings above are in the exact rank31 decklist.
- **Direct pinned-source facts:** the card implementations, prompt types/options, Field Blower modes, Stealthy Hood prevention hook, and Dusknoir self-KO behavior are present in the pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- **Static policy conclusion:** the inspected rank1 opponent policy has no handlers for Cursed Blast or Field Blower's relevant prompts; the MoveDamage gaps are separately documented.
- **Strategic hypothesis:** Field Blower can remove both Hoods before Cursed Blast; no match has demonstrated the line.
- **Not established:** rank31 matchup win rate, candidate advantage, frequency of the line, or any 99.5% field performance.
- **No implementation:** no deck, policy, simulator, workflow, or fixture was modified or dispatched.


## Exact frozen opponent-policy failure mode

The rank1 opponent policy's generic Pokémon branch has a particularly important behavior for Field Blower. When `selectionType === 'pokemon'` and `minimumCount === 0`, it returns the `empty-selection` token before its `UNCLASSIFIED_POKEMON_PROMPT` fallback.

Therefore, if Field Blower is played while Pokémon Tools are in play and no Stadium is in play, its `ChoosePokemonPrompt` (min 0, max 2) is answered with an empty selection: the Item resolves without discarding either Hood. If both a Stadium and Tools are in play, the earlier `SelectOptionPrompt` branch rejects Field Blower as an unsupported confirmation source. Cursed Blast's min-1 prompt instead reaches `UNCLASSIFIED_POKEMON_PROMPT`.

This is more than missing strategic sophistication: the frozen policy can silently choose a legal no-op for the exact Tool-removal action that answers the candidate's two-Hood package, or fail at the Stadium/tool mode choice. A simulation that uses this policy against rank31 would materially understate the opponent's available counterplay. This conclusion is conditional on the policy actually selecting Field Blower; it does not establish how often its root action policy will do so.


## Rank31 prompt-coverage matrix on the inspected V3 branch

| Rank31 effect | Native prompt | Host projection | Frozen rank1 opponent policy | Practical consequence |
|---|---|---|---|---|
| Dusknoir PRE — Cursed Blast | ChoosePokemonPrompt, min 1/max 1 | Supported as `pokemon` | No Cursed Blast mode; `UNCLASSIFIED_POKEMON_PROMPT` | Cannot choose a target if ability is selected |
| Field Blower, Stadium + Tools | SelectOptionPrompt | Supported as `option` | Field Blower absent from confirmable allowlist | `UNSUPPORTED_CONFIRMATION_SOURCE` |
| Field Blower, Tools only | ChoosePokemonPrompt, min 0/max 2 | Supported as `pokemon` | Generic min-0 path selects empty-selection | Legal no-op; removes no Hoods |
| Dusknoir BCR — Sinister Hand | MoveDamagePrompt | Unsupported | No handler | Prompt projection fails |
| Radiant Alakazam — Painful Spoons | MoveDamagePrompt, max 2, single destination | Unsupported | No handler | Prompt projection fails |

The host projection's `projectSimplePrompt()` explicitly supports SelectOptionPrompt, so the Field Blower mode is not a host projection gap. The failure is in the frozen role policy. This distinction matters: adding host support for a prompt already represented by the host does not repair an unclassified or strategically incorrect worker decision.
