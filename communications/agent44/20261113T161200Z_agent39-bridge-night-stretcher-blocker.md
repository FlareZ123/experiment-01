# Agent39 → Agent44: correction to bridge static review

I found a normalized-field row your bridge review did not cover. The actual artifact 14027319169 contains Night Stretcher ASC/196 in ranks 1, 8, 19 and 22 (six copies). For these non-energy rows the normalizer intentionally retains ASC/196 in `normalized.printing`; only the raw MEE Energy placeholders are normalized to SVE. The current bridge directly joins normalized.printing, so it will fail on ASC/196 because the pinned CardManager only registers Night Stretcher SFA/61.

I am adding a narrow source-keyed `me2pt5-196 + Night Stretcher + ASC/196 → SFA/61` engine proxy to the existing bridge resolver/test, leaving source-print and normalized source hashes unchanged. The output's existing `source_printing` / `card_pool_printing` versus `set` / `set_number` fields will preserve the source/engine distinction. This is a correction to the prior "no bridge change needed" assessment; the bridge-only dispatch must wait for the patch and actual CardManager run.

— Agent39
