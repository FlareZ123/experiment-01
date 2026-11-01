# Original ranks 4 and 16: Crobat V's global Ability limit in pinned Twinleaf

**31 October 2026 | Agent8 | source audit, native diagnostic pending execution**

The original Aichi Top32 inventory contains two Crobat V DAA104 in each of ranks **4 and 16**; 11 other registered lists carry a single copy. The [official Pokémon Trainers card entry](https://asia.pokemon-card.com/ph/card-search/detail/619/) says a player cannot use more than one **Dark Asset** Ability each turn.

Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, file `ptcg-server/src/sets/09-sword-and-shield/set-darkness-ablaze/crobat-v.ts`, checks `player.marker.hasMarker(this.DARK_ASSET_MARKER,this)` and writes `addMarker(name,this)`. That is a **source-specific** check; it does not see a different Crobat V's marker. A second Crobat played from hand therefore apparently offers its Dark Asset confirmation again, contrary to the printed global limit.

The controlled counterfactual starts with two Crobats in hand. Playing the first, accepting Dark Asset and drawing up to six then playing the second leaves five cards before its Ability. A second accepted Dark Asset would draw an extra card. It is an illegal advantage in two-source-copy lists, if the bot actually chooses the second use.

`tests/agent8-double-crobat-dark-asset-native.test.cjs` (commit `7759e508`) stages both Crobats on both real physical seats, with genuine Bench plays and native confirmation prompts, and compares the raw pinned Store against a correction. `simulation/twinleaf/crobat-global-dark-asset-hook.cjs` (commit `72e23a55`) is opt-in, reversible, and bypasses only the second triggered Ability while allowing the second Basic Pokémon to enter the Bench. The vendor submodule is unchanged.

**Native paired test not yet executed.** The source-level defect is compelling, but successful draws, hook integration and any competitive effect remain unverified. Existing engine `Store.propagateEffect` visits all cards in all physical zones, including hand, deck and Prize; marker cleanup upon EndTurn is therefore expected even if the first Crobat moves from its Bench, although this has not been explicitly tested.

The detached decision observation also omits the player's public global Dark Asset used status. A correct policy needs a global predicate for this printing; a per-Pokémon predicate is appropriate for CRE75 Underworld Door but is inadequate here.

**Benchmarks unchanged:** 29/32 original-source sixty-card lists, 0 competitively qualified games, 99.5% target not shown.

## 1 November 2026 compiled native resolution

The previously pending two-seat test **executed and passed on both physical seats** in the existing manually dispatched [Twinleaf smoke run 41322144796](https://github.com/FlareZ123/experiment-01/actions/runs/41322144796), pinned vendor revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. CI's overall status was **failure** because a later separate Pidgeot native test was still being repaired; the Crobat native step itself reported **2 passed, 0 failed**. In each seat the stock Store allowed two distinct Crobat V DAA cards played from hand to activate Dark Asset during the *same* turn, drawing one extra physical card on the second activation. With the existing default-off research-owned `installGlobalDarkAssetHook`, the second Crobat still entered the Bench, the second Dark Asset did not activate and the extra draw was zero. The original hook was restored after each native run.

This confirms the described bounded native defect and the opt-in correction on a staged board. It does not show a naturally shuffled original-rank-4/16 game, a player actually selecting this line in the field, a qualified canonical-runner guard, or a competitive win. The shared frozen policy profile must explicitly record this hook before inheriting its narrow paper-fidelity benefit. **Competitive-qualified games remain 0.**
