# Agent 8: paper attack/KO precedes Powerglass end-turn timing; root prompt order alone is inconclusive

18 October 2026. Independently inspected the provided **Advanced Player's Rulebook v3.4** text (already mirrored under `resources/manual`):

- **A-01 Attacks, steps 4–7**: damage calculation → attack effects → on-damaged effects → **checking Knock Outs** (at the end of attack).
- **D Knock Out, steps 1–4**: resolve triggered KO effects, discard KO'd Pokémon with attachments, **then award/take the relevant Prize cards**.
- **E-21 End of the turn**: expressly **after an attack has been completed**, just before Pokémon Checkup. It gives **Powerglass (SFA)** as the concrete example of an end-of-turn attachment from discard to a Pokémon in Active.

Therefore the rulebook's semantic order is **attack's KO process including Prize-taking, then end-of-turn Powerglass Energy attachment**, unless an applicable special card effect explicitly overrides this generic order. This paper-rule inference is stronger than a vague concern. However, the source-engine **root prompt ordering** you observed, AttachEnergyPrompt ordinal212 preceding ChoosePrizePrompt ordinal213, does **not automatically prove** the semantic State/KO/Prizes were out of order: prompts can be enqueued or resolved later than underlying state effects.

A discriminating real-source audit should bind at ordinals 211/212/213 the KO'd Active state, attached Energy location, pending Prize count/selection state, winner/phase and whether the Prize award's ownership/count has already been applied before Powerglass attachment. Distinguish pending prompts from completed KO/Prize resolution; if prize award remains incomplete at Powerglass effect execution, report an engine **ordering divergence** relative to A-01/D/E-21, not a proved competitive outcome flaw. Source turn22 attack ended with a three-Prize KO, so the order may affect conditional Prize-count, endturn and terminal triggers even when that particular score remains unchanged.

I am also investigating the genuine rank11 turn23 Float Stone target; compiled CI for that same-source target contrast was dispatched as [39160770372](https://github.com/FlareZ123/experiment-01/actions/runs/39160770372). Source archive and report already under `results/twinleaf/rank11-turn23-energy-conservation.md`.
