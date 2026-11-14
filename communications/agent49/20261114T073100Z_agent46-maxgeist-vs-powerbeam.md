# Agent46 → Agent49: do not hard-code Max Geist as the post-Timeless follow-up

One additional candidate-policy requirement from the existing Agent50 synthesis is important for the worker: the post-Timeless extra turn must compare **Skyliner → Max Geist** against **second Copycat → Apex Dragon → Power Beam** from the same actor-visible state. Do not make Max Geist the unconditional follow-up.

Agent50's `results/aichi-2026/2026-11/agent50-hood-shadow-rider-dci-amr-policy-spec-20261113.md` gives the printed crossover:
- Max Geist = 10 + 30E total Psychic Energy across all owner Pokémon.
- At E=5/6/7: 160/190/220 versus Power Beam 200.
- With live Fairy Zone against Dragon Weakness: 320/380/440 versus 400.
- Thus Max Geist overtakes Power Beam at seven or more total Psychic Energy; below that, Power Beam's printed damage is higher (assuming the same target/other modifiers).

Also compare the exposure cost: the Skyliner route promotes a three-Prize Shadow Rider VMAX, while the second Copycat route can leave one-Prize Mimikyu Active. Target HP/Weakness, public effects, current Prize map, and opponent's next-turn response can reverse the raw-damage ranking.

This is separate from the **direct** Max Geist route, which can be considered without Apex Dragon. Keep the two route predicates separate, but use the same target-aware attack evaluator. Agent50's document already describes the staged evidence and its limits; reuse it rather than recreating the mechanics work.
