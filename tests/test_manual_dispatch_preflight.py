"""Offline regression fixtures for the manual GitHub Actions workflow contract."""

import tempfile
import unittest
from pathlib import Path

from scripts.manual_dispatch_preflight import PreflightError, inspect_workflow


class ManualDispatchPreflightTests(unittest.TestCase):
    def setUp(self):
        self.folder = tempfile.TemporaryDirectory()
        self.addCleanup(self.folder.cleanup)
        self.path = Path(self.folder.name) / "agent7-canonical-actor-bilateral.yml"

    def fixture(self, count, *, unused=False):
        names = [f"choice_{i}" for i in range(count)]
        declarations = "".join(
            f"      {name}:\n        type: boolean\n        default: false\n"
            for name in names
        )
        used_names = names[:-1] if unused else names
        references = "\n".join(
            f"      - run: echo {chr(36)}{{{{ inputs.{name} }}}}"
            for name in used_names
        )
        source = (
            f"name: Test\non:\n  workflow_dispatch:\n    inputs:\n{declarations}"
            f"jobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n{references}\n"
        )
        self.path.write_text(source, encoding="utf-8")

    def test_exactly_25_referenced_inputs_pass(self):
        self.fixture(25)
        self.assertEqual(inspect_workflow(self.path), ({"workflow_dispatch"}, 25))

    def test_26th_input_is_rejected(self):
        self.fixture(26)
        with self.assertRaisesRegex(PreflightError, "26 inputs"):
            inspect_workflow(self.path)

    def test_unused_selector_is_rejected(self):
        self.fixture(3, unused=True)
        with self.assertRaisesRegex(PreflightError, "choice_2"):
            inspect_workflow(self.path)

    def test_undeclared_selector_reference_is_rejected(self):
        self.fixture(1)
        self.path.write_text(
            self.path.read_text(encoding="utf-8").replace(
                "inputs.choice_0", "inputs.nonexistent"
            ),
            encoding="utf-8",
        )
        with self.assertRaisesRegex(PreflightError, "nonexistent"):
            inspect_workflow(self.path)

    def test_yaml_comments_cannot_fake_input_usage(self):
        self.fixture(1, unused=True)
        self.path.write_text(
            self.path.read_text(encoding="utf-8") +
            "# " + chr(36) + "{{ inputs.choice_0 }}\n",
            encoding="utf-8",
        )
        with self.assertRaisesRegex(PreflightError, "choice_0"):
            inspect_workflow(self.path)

    def test_duplicate_yaml_input_is_rejected(self):
        self.fixture(1)
        self.path.write_text(
            self.path.read_text(encoding="utf-8").replace(
                "jobs:\n", "      choice_0:\n        type: boolean\njobs:\n"
            ),
            encoding="utf-8",
        )
        with self.assertRaisesRegex(PreflightError, "duplicate YAML key"):
            inspect_workflow(self.path)

    def test_canonical_must_be_manual_only(self):
        self.fixture(1)
        self.path.write_text(
            self.path.read_text(encoding="utf-8").replace(
                "on:\n", "on:\n  schedule:\n    - cron: '0 0 * * *'\n"
            ),
            encoding="utf-8",
        )
        with self.assertRaisesRegex(PreflightError, "manual-only"):
            inspect_workflow(self.path)

    def test_push_trigger_is_rejected(self):
        self.fixture(1)
        self.path.write_text(
            self.path.read_text(encoding="utf-8").replace(
                "on:\n", "on:\n  push:\n    branches: [main]\n"
            ),
            encoding="utf-8",
        )
        with self.assertRaisesRegex(PreflightError, "per-commit"):
            inspect_workflow(self.path)

    def test_yaml_on_is_a_string(self):
        path = Path(self.folder.name) / "manual-only.yml"
        path.write_text("on: workflow_dispatch\njobs: {}\n", encoding="utf-8")
        self.assertEqual(inspect_workflow(path), ({"workflow_dispatch"}, 0))


if __name__ == "__main__":
    unittest.main()
