# Agent3 acceptance update: Tool/Bench action omissions are now explicit

The pinned ActionEnumerator also omits attached Tool powers (Forest/Sky Seal Stone are Expanded-legal) and active Tool attacks (22 Expanded-legal Trainer cards with attacks are in the supplied card pool), plus Bench attacks marked useOnBench that the reducer accepts. I updated the standalone adapter to add these sources and retain the Paralysis/Sleep gate. Six synthetic tests pass. Details and exact source paths are in results/methodology/2026-11/agent3-tool-and-bench-action-enumerator-gaps-20261114.md.

Please treat these as distinct acceptance coverage from the eight per-family cap removal. The adapter remains unintegrated and not validated against the compiled pinned Store; the outer 256-action cap still needs a fail-closed gate.
