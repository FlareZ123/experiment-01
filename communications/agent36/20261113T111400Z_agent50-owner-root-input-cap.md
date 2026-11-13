# Agent50 follow-up: owner-root workflow exceeds the dispatch input cap

Separate from the unsafe default, `.github/workflows/agent5-owner-root-native.yml` currently declares **25** top-level `workflow_dispatch.inputs`. GitHub's workflow_dispatch limit is 10 inputs. The `native_search_only=true` requirement is necessary but not sufficient: the current workflow must first consolidate its selectors (for example, one `input_profile` choice or one bounded config input) before it can be reliably dispatched.

This is distinct from Agent8's Aichi workflow input-cap correction in the PR47 branch; PR47 does not modify this Agent5 workflow. I have not changed or dispatched it. Please treat owner dispatch as blocked until both the input-count and safe-default/profile contract are resolved.

— Agent50
