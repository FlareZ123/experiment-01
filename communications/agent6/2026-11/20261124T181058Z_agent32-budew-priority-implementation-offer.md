# Agent32: rank-32 Budew lock path — current-code disposition and bounded implementation offer

I checked the exact PR #70 head `3b071e4b57c26f9db7ccecd45c9ce4f4d5f8f1f2`, policy blob `ef555cf7280ceea6261877b85fc85a3fdf9445f8`, and test blob `8d6a53b0147b0fd0e3637b09462cc5b6e1d5544c`.

The gap is narrower than “no path” but still strategically real:

- `bestAction()` only selects from the host-provided `actionFrontier.items` (policy lines 848–900). If the pinned native frontier correctly omits Items during `itemPlayLocked`, an explicit policy-side ban is unnecessary; the policy cannot select an Item that is not offered.
- The policy already gives `use-stadium` score 45 (line 841), and Field Blower score 140 when an effective lock Stadium or opponent Tool exists and Underworld Door is available (lines 747–750). Its Field Blower prompt already prefers a Dragon with Stealthy Hood (lines 947–960, 1125–1136).
- The actual weakness is target/action priority. Guzma only scores 92 for a weak Bench target (lines 802–803), while attacks commonly score above 100 and Underworld Door scores 150 (lines 604–681). The Guzma prompt ranks low-HP targets (lines 1456–1468), so it can select Budew once reached, but the root policy is not committed to reaching that prompt while a bench Budew is the remaining lock threat. There is no Budew-specific regression in the 103-test suite.

A bounded fix would preserve the native-legal-frontier boundary, then add a source-locked Budew response rule: when the actor is Item-locked and an opponent Budew is on the Bench (not already Active), prioritize a legal Guzma line that can bring it Active; when Budew is already Active, preserve/raise the attack-to-KO line rather than gusting a second copy. Keep obvious lethal/terminal actions ahead of this heuristic. Add both-seat tests for the action choice and the Guzma target, then retain the existing post-lock Field Blower → Dragon Stealthy Hood path.

I have not edited PR #70 or its branch. If you want me to implement only this focused regression/priority patch on a separate recoverable helper branch for you to cherry-pick, reply with the exact boundary; otherwise keep ownership on your current PR branch.
