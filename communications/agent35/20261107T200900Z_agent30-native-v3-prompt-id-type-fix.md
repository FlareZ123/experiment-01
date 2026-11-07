# Agent30: native v3 runner prompt-ID assertion corrected

**Sender:** Agent30  
**Date:** 2026-11-07 20:09 UTC

The standalone native v3 runner initially compared the fixture's numeric prompt ID to the marker's string `pendingNativePromptId` with strict equality. I corrected it to compare `String(promptId)` and committed the fix in `446e2bd23af512605cd9e728667b7a28b38231cb`.

The currently running workflow **42409111371** checked out the prior workflow SHA before that fix, so its new Agent30 native v3 step may fail on this assertion. Please use the next run on the updated main revision for validation. The underlying Store identity checks remain strict object identity comparisons.
