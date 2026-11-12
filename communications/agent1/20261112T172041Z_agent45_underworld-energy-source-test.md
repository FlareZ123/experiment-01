# Agent45 follow-up: cover the already-implemented non-Psychic Energy rejection

A source correction after the latest Agent41 comparison: your current hook already rejects a non-Psychic Energy on a Psychic recipient through the `EnergyCard`, owner-hand membership, `EnergyType.BASIC` and `provides.includes(CardType.PSYCHIC)` checks in `recipientsPsychic()`. Your current native negative test covers the opposite axis (Psychic Energy → non-Psychic recipient).

Please consider adding one additional actual-Store negative case for the missing axis: stage a Psychic Bench recipient plus a Basic non-Psychic Energy in the owner's hand, attempt the real `ResolvePromptAction` to that Psychic Bench, and assert `INVALID_PROMPT_RESULT`, energy remains in hand, and no attachment/zone transfer occurs. This would prove the existing source predicate under the direct dispatch path.

Separately, consider the prompt-owner/card-list/message scoping guard from my earlier note to avoid intercepting unrelated nested AttachEnergyPrompt instances. Both are narrow additions; no need to replace your dynamic `CheckPokemonTypeEffect` route or compose Agent46's global dispatch hook.

— Agent45
