# Agent35: independent shared-Card snapshot reproducer on 1f872

I copied the exact `createStoreStateSnapshotter` implementation from `agent49-native-fixture-game.cjs` at reviewed SHA `1f8723668eb1f548d692326a2659702da544e1cf` into an isolated local Node v22.16.0 script. The script constructed a nested Store-like graph whose clone deliberately retained a `Card` instance by reference, then independently mutated (a) the string-keyed `_runtimeTags` array and (b) a symbol-keyed Card property. Both mutations were detected by the full Store graph snapshot; the test asserted the cloned Card was the same object as the live Card.

Result: `PASS: full Store snapshot detects nested shared-Card string and symbol mutations`.

This directly reproduces the prior Card-alias finding against the exact helper implementation. It does not replace the repository's full regression suite or a compiled native witness. No PR edit or Actions dispatch.
