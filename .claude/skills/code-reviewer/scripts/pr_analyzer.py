#!/usr/bin/env python3
"""
PR Analyzer
Analyzes git diff (staged or between branches) for code review:
- Changed files summary with add/delete counts
- Risk assessment per file (size of change, sensitive files)
- Detects common PR issues (large PRs, mixed concerns, missing tests)
"""

import os
import sys
import re
import json
import argparse
import subprocess
from pathlib import Path
from typing import Dict, List
from datetime import datetime


RISK_HIGH = "HIGH"
RISK_MEDIUM = "MEDIUM"
RISK_LOW = "LOW"

# Files that warrant extra scrutiny
SENSITIVE_PATTERNS = [
    r"\.env", r"firebase", r"secret", r"credential", r"auth",
    r"package\.json$", r"package-lock\.json$", r"tsconfig",
    r"vite\.config", r"webpack\.config",
]

# Large PR threshold
LARGE_PR_LINES = 500
LARGE_PR_FILES = 15


class ChangedFile:
    def __init__(self, path: str, additions: int, deletions: int):
        self.path = path
        self.additions = additions
        self.deletions = deletions
        self.total = additions + deletions
        self.risk = RISK_LOW
        self.risk_reasons: List[str] = []

    def assess_risk(self):
        # Large change
        if self.total > 200:
            self.risk = RISK_HIGH
            self.risk_reasons.append(f"Large change ({self.total} lines)")
        elif self.total > 80:
            self.risk = max(self.risk, RISK_MEDIUM)
            self.risk_reasons.append(f"Moderate change ({self.total} lines)")

        # Sensitive file
        for pattern in SENSITIVE_PATTERNS:
            if re.search(pattern, self.path, re.IGNORECASE):
                self.risk = RISK_HIGH
                self.risk_reasons.append(f"Sensitive file pattern: {pattern}")
                break

        # Config / build files
        if any(self.path.endswith(ext) for ext in [".json", ".toml", ".yaml", ".yml"]):
            if self.risk == RISK_LOW:
                self.risk = RISK_MEDIUM
                self.risk_reasons.append("Configuration file changed")

    def to_dict(self):
        return {
            "path": self.path,
            "additions": self.additions,
            "deletions": self.deletions,
            "total": self.total,
            "risk": self.risk,
            "risk_reasons": self.risk_reasons,
        }


class PrAnalyzer:
    def __init__(self, target_path: str, base_branch: str = "main", verbose: bool = False):
        self.target_path = Path(target_path)
        self.base_branch = base_branch
        self.verbose = verbose
        self.changed_files: List[ChangedFile] = []
        self.issues: List[str] = []

    def run(self) -> Dict:
        print(f"🚀 PR Analyzer")
        print(f"📁 Repo: {self.target_path}")
        print(f"🔀 Base: {self.base_branch}")

        if not (self.target_path / ".git").exists() and not self.target_path.is_dir():
            print(f"❌ Not a git repository: {self.target_path}")
            sys.exit(1)

        self._collect_changes()
        self._assess_risks()
        self._check_pr_issues()
        return self._build_results()

    def _run_git(self, *args) -> str:
        try:
            result = subprocess.run(
                ["git"] + list(args),
                cwd=self.target_path,
                capture_output=True, text=True, timeout=30
            )
            return result.stdout.strip()
        except Exception as e:
            if self.verbose:
                print(f"  Git error: {e}")
            return ""

    def _collect_changes(self):
        # Try diff against base branch first, fall back to staged changes
        diff_output = self._run_git("diff", "--numstat", f"{self.base_branch}...HEAD")
        if not diff_output:
            diff_output = self._run_git("diff", "--numstat", "--cached")
        if not diff_output:
            diff_output = self._run_git("diff", "--numstat")
        if not diff_output:
            print("  No changes detected.")
            return

        for line in diff_output.splitlines():
            parts = line.split("\t")
            if len(parts) >= 3:
                add_str, del_str, path = parts[0], parts[1], parts[2]
                additions = int(add_str) if add_str != "-" else 0
                deletions = int(del_str) if del_str != "-" else 0
                self.changed_files.append(ChangedFile(path, additions, deletions))

    def _assess_risks(self):
        for cf in self.changed_files:
            cf.assess_risk()

    def _check_pr_issues(self):
        total_lines = sum(cf.total for cf in self.changed_files)
        total_files = len(self.changed_files)

        if total_lines > LARGE_PR_LINES:
            self.issues.append(f"Large PR: {total_lines} lines changed (threshold: {LARGE_PR_LINES}). Consider splitting.")
        if total_files > LARGE_PR_FILES:
            self.issues.append(f"Many files changed: {total_files} (threshold: {LARGE_PR_FILES}). Consider splitting.")

        # Mixed concerns: src + config + docs in same PR
        categories = set()
        for cf in self.changed_files:
            if cf.path.startswith("src/"):
                categories.add("source")
            elif any(cf.path.endswith(e) for e in [".json", ".toml", ".yaml", ".yml", ".config.ts"]):
                categories.add("config")
            elif cf.path.endswith(".md") or cf.path.startswith("docs/"):
                categories.add("docs")
            elif cf.path.endswith((".css", ".scss")):
                categories.add("styles")
        if len(categories) >= 3:
            self.issues.append(f"Mixed concerns: PR touches {', '.join(sorted(categories))}. Consider separating.")

        # Check if test files are included when source changes
        has_source = any(cf.path.startswith("src/") and cf.path.endswith((".ts", ".tsx")) for cf in self.changed_files)
        has_tests = any("test" in cf.path.lower() or "spec" in cf.path.lower() for cf in self.changed_files)
        if has_source and not has_tests:
            self.issues.append("Source code changed but no test files modified. Consider adding tests.")

    def _build_results(self) -> Dict:
        total_add = sum(cf.additions for cf in self.changed_files)
        total_del = sum(cf.deletions for cf in self.changed_files)
        high_risk = [cf for cf in self.changed_files if cf.risk == RISK_HIGH]

        results = {
            "timestamp": datetime.now().isoformat(),
            "repo": str(self.target_path),
            "base_branch": self.base_branch,
            "summary": {
                "files_changed": len(self.changed_files),
                "additions": total_add,
                "deletions": total_del,
                "high_risk_files": len(high_risk),
            },
            "issues": self.issues,
            "files": [cf.to_dict() for cf in self.changed_files],
        }

        # Print report
        print(f"\n{'='*60}")
        print(f"  PR ANALYSIS REPORT")
        print(f"{'='*60}")
        print(f"  Files changed: {len(self.changed_files)}")
        print(f"  Lines:         +{total_add} / -{total_del}")
        print(f"  High risk:     {len(high_risk)} file(s)")
        print(f"{'='*60}\n")

        if self.issues:
            print("── ISSUES ──")
            for issue in self.issues:
                print(f"  ⚠️  {issue}")
            print()

        if high_risk:
            print("── HIGH RISK FILES ──")
            for cf in high_risk:
                reasons = ", ".join(cf.risk_reasons)
                print(f"  🔴 {cf.path} (+{cf.additions}/-{cf.deletions}) — {reasons}")
            print()

        print("── ALL CHANGED FILES ──")
        for cf in sorted(self.changed_files, key=lambda x: -x.total):
            icon = {"HIGH": "🔴", "MEDIUM": "🟡", "LOW": "🟢"}[cf.risk]
            print(f"  {icon} {cf.path:50s} +{cf.additions:>4d} -{cf.deletions:>4d}")

        print()
        return results


def main():
    parser = argparse.ArgumentParser(description="PR Analyzer — analyze git changes for code review")
    parser.add_argument("target", help="Git repository path")
    parser.add_argument("--base", "-b", default="main", help="Base branch for comparison (default: main)")
    parser.add_argument("--verbose", "-v", action="store_true")
    parser.add_argument("--json", action="store_true", help="Output as JSON")
    parser.add_argument("--output", "-o", help="Write JSON to file")
    args = parser.parse_args()

    analyzer = PrAnalyzer(args.target, base_branch=args.base, verbose=args.verbose)
    results = analyzer.run()

    if args.json or args.output:
        output = json.dumps(results, indent=2)
        if args.output:
            with open(args.output, "w") as f:
                f.write(output)
            print(f"Results written to {args.output}")
        elif args.json:
            print(output)


if __name__ == "__main__":
    main()
