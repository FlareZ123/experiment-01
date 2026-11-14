# Agent44 review: Clefairy is the right Rondo candidate, but native prompt proof is still missing

**Sender: Agent44 | 14 November 2026, 08:38 UTC**

I checked the full native artifact, the exact card-pool text, and the existing Guzma prompt bridge.

## 1. Own-recipient legality

Guzma BUS/SM3 says: “switch your Active Pokémon with 1 of your Benched Pokémon.” There is no printed restriction to Basic, attacker, or a specific type. Lillie's Clefairy ex JTG was on the candidate's Bench in this state, so it is card-text-eligible.

The native prompt adapter also supports this route:
- `nativeSinglePokemonChoices()` enumerates every physical Active/Bench slot allowed by `pending.slots` and `pending.playerType`, retaining only objects for which the live `pending.validate([physical], state)` returns true.
- `agent43-guzma-prompt-continuation.cjs` selects the planned own `benchIndex`, re-runs the native validator, dispatches `ResolvePromptAction`, and verifies the exact physical printing became Active.

However, the archived artifact only records the accepted Shadow Rider recipient (own bench index 1, physical ID 67). It does **not** record the full own-recipient menu or a Clefairy validation. Therefore the precise conclusion is: Clefairy is eligible by card text and should be in the legal own-Bench menu, but native acceptance of that exact physical Clefairy was not demonstrated in this artifact. A small deterministic native prompt regression should assert `pending.validate([clefairySlot], state) === true` and confirm the same physical Clefairy becomes Active. No full match fixture is needed.

## 2. Damage and prize comparison

The card pool confirms:
- Lillie's Clefairy ex: 190 HP, 2-prize Pokémon ex; Fairy Zone changes each opposing Dragon Pokémon's Weakness to Psychic (×2); Full Moon Rondo costs Psychic + Colorless and does 20 + 20 per Benched Pokémon on both sides.
- Shadow Rider Calyrex VMAX: 320 HP, 3-prize VMAX; Max Geist does 10 + 30 per Psychic Energy attached to all your Pokémon.
- Raging Bolt ex: 240 HP, Dragon type, 2-prize Pokémon ex.

The post-Guzma board still has four Benched Pokémon on each side: switching an Active with a Benched Pokémon preserves the bench count. Thus (B=8).

- **Full Moon Rondo:** (20+20(8)=180); Fairy Zone makes Raging Bolt's Weakness Psychic, so (180\times2=360), lethal to 240 HP.
- **Max Geist:** (10+30(5+1+2)=250); the same Weakness gives (250\times2=500), also lethal.
- Both lines take the same two Prizes for the Raging Bolt ex KO. If the promoted attacker is later Knocked Out, Clefairy ex yields two Prizes while Shadow Rider VMAX yields three.

The public reply state also favors the Clefairy line: Raging Bolt has Lightning Energy + Double Dragon Energy, but no Fighting Energy for Bellowing Thunder; Burst Roar is non-damaging. The remaining visible attackers do not show an immediate 190-HP one-shot. Unknown opponent hand/gust options remain uncertainty, but moving the 320-HP VMAX to the Bench is better than leaving it Active when the opponent's currently visible board has no ready one-shot. This is a local board evaluation, not a match-strength result.

## 3. Recommended regression

**Yes: this deserves a deterministic actor-only policy regression.** It should:
1. build the detached owner view after the opponent's Guzma gust;
2. project the actual own-recipient menu, including Clefairy, with opaque IDs;
3. verify Fairy Zone is live and Raging Bolt is a Dragon target;
4. count current benches dynamically (do not hard-code 8);
5. verify both Rondo and Max Geist are legal and lethal;
6. choose Clefairy as Guzma's own recipient because the KO prize is equal and the active exposure is lower on the visible reply board;
7. validate the selected opaque choice against the live native prompt and verify the physical Clefairy becomes Active;
8. include an ability-suppression/Weakness-lock negative case and a case where the opponent has a ready attack/gust that changes the reply score.

The existing `agent31-late-seeker-guzma-prize.cjs` recognizes printed all-Pokémon-energy scaling (Max Geist) but not Full Moon Rondo's bench-count formula or Fairy Zone's Dragon-Weakness change. The current `agent43-guzma-prompt-continuation.cjs` can validate a planned bench index but does not choose between the two attackers. The new policy should add a pure damage/prize evaluator over actor-visible state; keep native validation and physical object mapping in the host.

No V3 fixture should be dispatched before the worker/host acceptance gates. The current artifact is unqualified for competitive inference, and this is a decision-state counterfactual only.

— Agent44
