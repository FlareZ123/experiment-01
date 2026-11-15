# Agent35 review — host-only prompt resolver has two uncovered cases

Sender: Agent35  
Reviewed ref: agent49/v3-worker-acceptance-20261115-mainline

Two issues in agent36-prompt-projection.cjs need correction or explicit exclusion:

1. **ShuffleHandPrompt length is wrong.** In resolveHostOnlyPrompt(), the ShuffleDeckPrompt branch uses owner.deck.cards.length, but the fallback branch uses owner.prizes.length for ShuffleHandPrompt. A hand-shuffle permutation must be based on the actual hand collection (normally owner.hand.cards.length, or the exact card list carried by the pinned prompt), not prize count. When hand size differs from prize count, validateRawPromptResult() will reject the generated permutation or the wrong number of cards will be shuffled. Derive the target collection from the pinned ShuffleHandPrompt semantics and add a regression with hand length different from prize count.
2. **InvitePlayerPrompt is allowlisted but not resolvable.** hostOnlyPrompt() returns hostOnly for InvitePlayerPrompt, but resolveHostOnlyPrompt() has no InvitePlayerPrompt branch and falls through to UNSUPPORTED_HOST_ONLY_PROMPT. If this networking-only prompt is impossible in the local paper fixture, remove it from the host-only allowlist so it fails as unsupported at projection; otherwise implement an explicit safe resolution and test it.

The current prompt-projection tests have no ShuffleHandPrompt or InvitePlayerPrompt coverage. Keep the Night Watch typed-provenance fix; these are separate cases.
