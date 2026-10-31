import tempfile
import unittest
from pathlib import Path

from scripts.workflow_dispatch_preflight import scan, validate_workflow


class WorkflowSchemaTests(unittest.TestCase):
    def test_valid_manual_and_bracket_context(self):
        source = """on:
  workflow_dispatch:
    inputs:
      study: {type: string}
      count: {type: number}
jobs:
  x:
    if: \${{ inputs.study == 'a' && github.event.inputs['count'] != '' }}
"""
        self.assertEqual(validate_workflow(source), [])

    def test_26_inputs_rejected(self):
        inputs = "\n".join(f"      n{i}: {{type: boolean}}" for i in range(26))
        self.assertIn("workflow_dispatch has 26 inputs; limit is 25",
                      validate_workflow("on:\n  workflow_dispatch:\n    inputs:\n" + inputs))

    def test_bad_yaml_push_and_duplicates(self):
        self.assertTrue(any("invalid YAML" in e for e in validate_workflow("on: [workflow_dispatch\n")))
        self.assertTrue(any("push trigger" in e for e in validate_workflow("on: [workflow_dispatch, push]\n")))
        self.assertTrue(any("duplicate key" in e for e in
                            validate_workflow("on:\n  workflow_dispatch:\n    inputs:\n      a: {}\n      a: {}\n")))

    def test_undeclared_expression_input(self):
        source = "on:\n  workflow_dispatch:\n    inputs:\n      study: {}\njobs:\n  a:\n    if: \${{ inputs.stduy == 'x' }}\n"
        self.assertEqual(validate_workflow(source), ["undeclared expression input: stduy"])

    def test_bare_if_implicit_expression_input_checks(self):
        invalid = "on:\n  workflow_dispatch:\n    inputs:\n      rank: {}\njobs:\n  a:\n    if: inputs.rnak == '4'\n"
        self.assertEqual(validate_workflow(invalid),
                         ["undeclared expression input: rnak"])
        valid = invalid.replace("rnak", "rank")
        self.assertEqual(validate_workflow(valid), [])

    def test_workflow_call_input_allowed(self):
        source = "on:\n  workflow_call:\n    inputs:\n      rank: {}\njobs:\n  a:\n    if: \${{ inputs.rank != '' }}\n"
        self.assertEqual(validate_workflow(source), [])

    def test_scan_empty_and_bad(self):
        with tempfile.TemporaryDirectory() as temp:
            folder = Path(temp)
            self.assertTrue(scan(folder))
            (folder / "good.yml").write_text("on: workflow_dispatch\n", encoding="utf-8")
            (folder / "bad.yaml").write_text("on: [push]\n", encoding="utf-8")
            self.assertEqual(list(scan(folder)), [str(folder / "bad.yaml")])


if __name__ == "__main__":
    unittest.main()
