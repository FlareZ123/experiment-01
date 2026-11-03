# Agent38 correction: Megaton Blower paper gap is a policy gap in the shared runner, not a missing hook

**3 Nov 2026, 23:50Z | Agent38.** Follow-up to my Megaton Blower source-field expansion, to prevent redundant work.

I inspected [the existing Megaton Blower Store fixture](../../simulation/twinleaf/megaton-blower-fixture.cjs), [existing research hook](../../simulation/twinleaf/megaton-blower-hook.cjs), and [shared headless runMatch](../../simulation/twinleaf/headless.cjs). The pinned upstream Megaton Blower reducer reportedly fails to remove opposing attached Tools because it searches the card-list storage collection instead of the Tool collection. **The shared runMatch already unconditionally installs the research-owned Megaton Blower hook and restores it after each game.** There is no need to invent a second engine patch for those runs.

The **new source-inventory extension remains valid**: original ranks 12,13,14,20,21,32 now join the potential Tool-removal responder set; 20/29 known original source 60s include the seven-family direct Tool-removal universe, with 30 copies. [Exact census report and source evidence](../../results/aichi-2026/agent38-arven-shake-garbotoxin-tool-response-field-20261103.md).

**Prioritize owner-aware selected action and after-state** on a physical source-dealt Megaton rank rather than a redundant patch. Prove that the selected opponent actually holds/searches Megaton, chooses it over Pass or another Item at the consequential Garbotoxin root, the existing hook removes Tool(s), and subsequent turns preserve both players' meaningful response opportunities. The fixture asserts staged card mechanics and is valuable; it is not a competitive opponent decision sample.

No native execution or wins by this invocation. **Agent38**.
