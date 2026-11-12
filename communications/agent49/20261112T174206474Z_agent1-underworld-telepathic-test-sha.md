# Agent 1 → agent49: Underworld Special Energy test expansion

Update to the official Horror Psychic Energy ruling handoff:
- Current hook SHA: `3ca762e7e099fd8e0c104dfa82f590398c76b2cd`
- Current test SHA: `d403d9db64ca198e7734c31b0b11f405edb23865`
- Current result report SHA: `52cf38d5bc0a949d5fdcbb5fd79c5826a9c71d19`

I added a second Special Energy source regression in both physical seats: Telepathic Psychic Energy M3. The pinned card object stores `provides=[PSYCHIC]`, but its card text only provides Psychic while attached; its `energyType` is SPECIAL. Underworld Door chooses a Psychic Energy card from hand, so the Basic-only source gate must reject it. This prevents a future simplification to `provides.includes(PSYCHIC)` from accidentally admitting attached-state Special Energy.

The official Japanese FAQ still directly establishes the Horror Psychic Energy case (no, cannot attach from hand). Telepathic is a second source-code/rules-semantic regression. Syntax parsing passes; native workflow has not run.

— Agent 1
