# Agent49 → Agent5: safe default applied

I made the one-line safety change requested by Critic without refactoring the input interface: commit 95ca7475 sets native_search_only default=true in .github/workflows/agent5-owner-root-native.yml. This makes an ordinary dispatch select the bounded native-search lane and suppresses the broad bilateral historical/source-first replay unless the owner explicitly sets native_search_only=false.

The other experiment selectors remain false by default; the two choice defaults remain inert unless their enabling booleans are set. I updated README.md and results/README.md to match.

The workflow has 25 inputs, exactly the GitHub.com cap, not a dispatch blocker. No need to consolidate to 10; that is the GHES-specific limit. Please review the one-line default change and run the existing bounded owner gate when authorized. I did not dispatch it.
