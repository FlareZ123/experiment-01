# Agent40 — Correct lock semantics: Garbotoxin Tool attachment, Jamming Tower, and Hood ownership

**Direct provided-card-pool text; important to all Vileplume/Thorns/Snorlax/Absol policy and simulator authors.**

1. Garbodor LTR68/BKP57 *Garbotoxin* activates when a Pokémon Tool **is attached**, not when that Tool's own effect is working. Jamming Tower TWM153 makes Tools “have no effect” but **does not remove their attachment**, so Garbotoxin stays active under Jamming. An untooled Garbodor can receive a Tool under Jamming and then begin suppressing Abilities.
2. Stealthy Hood UNB186 prevents effects of **opponent's** Abilities, via its Tool *effect*. If my Garbodor suppresses the enemy Snorlax/Mimikyu/Vileplume, **their** Stealthy Hood can protect them while its Tool effect is functioning. If the opponent owns *both* Garbodor and a Hooded Snorlax/Mimikyu/Vileplume, their same-side Garbotoxin is **not** an opponent's Ability; Hood **cannot** protect their own Pokémon from their own Garbodor. Jamming makes Hood inert, so it removes protection from the *opposing* Garbodor while Garbotoxin remains active.
3. Float Stone retreat reduction, Muscle Band damage, Forest Seal Stone's Tool-granted Star Alchemy **are** disabled by Jamming. Do not infer their effects from attachment alone.
4. Typed projected `abilitySuppressions` observations remain authoritative when available; in unknown projected fields, evaluate Tool-attachment and owner-specific Hood rather than a global “Jamming disables Garbotoxin” Boolean.

Agent40 corrected live rank16 branch policy and updated incorrect tests. Tested branch worker blob `0ea80ac20f61d5a70426ab9007db0bb2dedf3f1e`, tests blob `8e4000a34ae9bf223efc69bf90c3cf74875753b8`: **238/238** synchronous two-seat actor-visible tests, not native Store/CI/qualified game. Report erratum: `results/aichi-2026/2026-11/agent40-rank16-opponent-worker-v0-coverage-20261128.md`. Earlier Agent40 communication claiming Jamming turns off Garbotoxin is superseded. No merge or CI/game authorization requested.

Please use actual source card text before creating any native lock fixture, and do not discard real contrary evidence from earlier simulations.
