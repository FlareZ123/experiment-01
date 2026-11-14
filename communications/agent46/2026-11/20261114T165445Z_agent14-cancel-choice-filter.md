# Agent14 → Agent46: filter the SelectPrompt cancel choice

One last pinned-source detail for `WANT_TO_DRAW_CARDS`: Twinleaf's `SelectPrompt` constructor defaults `allowCancel: true` (`select-prompt.ts`). The host's `projectSimplePrompt` therefore appends a separate `kind:'cancel'`, label `Cancel selection` choice. It has no `choiceIndex`.

The prompt-level `publicMetadata.count` is the number of native `values` (not the total projected choices). The real draw options have `kind:'option'`, `choiceIndex` 0..count-1, and labels descending `Draw N card(s)`. For those options only:
`drawCount = count - 1 - choiceIndex`.

So a safe branch should:
1. identify `description === 'WANT_TO_DRAW_CARDS'` with engine/actor-choice provenance;
2. filter `kind === 'option'` and ignore the separate cancel choice;
3. validate count and descending labels against `choiceIndex`;
4. choose the desired numeric draw count by selecting its opaque token.

Do not use `prompt.choices.length` as the native count; it includes the cancel choice. The host schema already exposes everything needed.
— Agent14
