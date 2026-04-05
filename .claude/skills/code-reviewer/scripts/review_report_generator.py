#!/usr/bin/env python3
"""
Review Report Generator
Combines code quality check + PR analysis into a unified Markdown report.
Can also run standalone to generate a report from JSON inputs.
"""

import os
import sys
import json
import argparse
import subprocess
from pathlib import Path
from typing import Dict, Optional
from datetime import datetime


def run_checker(target: str, verbose: bool = False) -> Dict:
    """Run code_quality_checker and capture results."""
    script = Path(__file__).parent / "code_quality_checker.py"
    cmd = [sys.executable, str(script), target, "--json"]
    if verbose:
        cmd.append("--verbose")
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120, encoding="utf-8", errors="replace", env={**os.environ, "PYTHONIOENCODING": "utf-8"})
        output = result.stdout
        # Extract JSON object from output (may have non-JSON lines before it)
        brace_start = output.find("{")
        if brace_start >= 0:
            return json.loads(output[brace_start:])
        return {}
    except Exception:
        return {}


def run_pr_analyzer(target: str, base: str = "main", verbose: bool = False) -> Dict:
    """Run pr_analyzer and capture results."""
    script = Path(__file__).parent / "pr_analyzer.py"
    cmd = [sys.executable, str(script), target, "--base", base, "--json"]
    if verbose:
        cmd.append("--verbose")
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120, encoding="utf-8", errors="replace", env={**os.environ, "PYTHONIOENCODING": "utf-8"})
        return json.loads(result.stdout)
    except Exception:
        return {}


def generate_markdown(quality: Dict, pr: Dict, target: str) -> str:
    """Generate a Markdown review report."""
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    lines = [
        f"# Code Review Report",
        f"",
        f"**Generated:** {now}  ",
        f"**Target:** `{target}`",
        f"",
    ]

    # ── PR Summary ──
    if pr and pr.get("summary"):
        s = pr["summary"]
        lines.extend([
            f"## PR Summary",
            f"",
            f"| Metric | Value |",
            f"|--------|-------|",
            f"| Files Changed | {s.get('files_changed', 0)} |",
            f"| Additions | +{s.get('additions', 0)} |",
            f"| Deletions | -{s.get('deletions', 0)} |",
            f"| High Risk Files | {s.get('high_risk_files', 0)} |",
            f"",
        ])
        if pr.get("issues"):
            lines.append("### PR Issues")
            lines.append("")
            for issue in pr["issues"]:
                lines.append(f"- ⚠️ {issue}")
            lines.append("")

        if pr.get("files"):
            high_risk = [f for f in pr["files"] if f["risk"] == "HIGH"]
            if high_risk:
                lines.append("### High Risk Files")
                lines.append("")
                for f in high_risk:
                    reasons = ", ".join(f.get("risk_reasons", []))
                    lines.append(f"- 🔴 `{f['path']}` (+{f['additions']}/-{f['deletions']}) — {reasons}")
                lines.append("")

    # ── Quality Summary ──
    if quality and quality.get("summary"):
        s = quality["summary"]
        lines.extend([
            f"## Code Quality Summary",
            f"",
            f"| Severity | Count |",
            f"|----------|-------|",
            f"| 🔴 HIGH | {s.get('high', 0)} |",
            f"| 🟡 MEDIUM | {s.get('medium', 0)} |",
            f"| 🔵 LOW | {s.get('low', 0)} |",
            f"| **Total** | **{s.get('total', 0)}** |",
            f"",
        ])

        if quality.get("stats"):
            st = quality["stats"]
            lines.append(f"*Scanned {st.get('files_scanned', 0)} files, {st.get('total_lines', 0)} lines.*")
            lines.append("")

        findings = quality.get("findings", [])
        if findings:
            # Group by severity
            for sev, icon in [("HIGH", "🔴"), ("MEDIUM", "🟡"), ("LOW", "🔵")]:
                sev_findings = [f for f in findings if f["severity"] == sev]
                if not sev_findings:
                    continue
                lines.append(f"### {icon} {sev} Issues")
                lines.append("")
                lines.append(f"| File | Line | Category | Message |")
                lines.append(f"|------|------|----------|---------|")
                for f in sev_findings:
                    loc = f"{f['file']}:{f['line']}" if f.get('line') else f['file']
                    msg = f['message'].replace("|", "\\|")
                    lines.append(f"| `{loc}` | {f.get('line', '')} | {f['category']} | {msg} |")
                lines.append("")

    # ── Recommendations ──
    lines.extend([
        "## Recommendations",
        "",
    ])

    total_high = 0
    total_medium = 0
    if quality and quality.get("summary"):
        total_high += quality["summary"].get("high", 0)
        total_medium += quality["summary"].get("medium", 0)
    if pr and pr.get("summary"):
        total_high += pr["summary"].get("high_risk_files", 0)

    if total_high > 0:
        lines.append(f"1. **Fix {total_high} HIGH severity issues before merging.**")
    if total_medium > 0:
        lines.append(f"2. Review and address {total_medium} MEDIUM issues.")
    if total_high == 0 and total_medium == 0:
        lines.append("✅ No critical issues found. Code looks good for merge.")

    lines.extend(["", "---", f"*Generated by code-reviewer skill*"])
    return "\n".join(lines)


class ReviewReportGenerator:
    def __init__(self, target_path: str, base_branch: str = "main",
                 verbose: bool = False, skip_pr: bool = False, skip_quality: bool = False):
        self.target_path = target_path
        self.base_branch = base_branch
        self.verbose = verbose
        self.skip_pr = skip_pr
        self.skip_quality = skip_quality

    def run(self) -> str:
        print(f"🚀 Review Report Generator")
        print(f"📁 Target: {self.target_path}\n")

        quality = {}
        pr = {}

        if not self.skip_quality:
            print("── Running Code Quality Check ──")
            quality = run_checker(self.target_path, self.verbose)

        if not self.skip_pr:
            print("── Running PR Analysis ──")
            pr = run_pr_analyzer(self.target_path, self.base_branch, self.verbose)

        report = generate_markdown(quality, pr, self.target_path)
        return report


def main():
    parser = argparse.ArgumentParser(description="Review Report Generator — unified Markdown report")
    parser.add_argument("target", help="File or directory to review")
    parser.add_argument("--base", "-b", default="main", help="Base branch (default: main)")
    parser.add_argument("--verbose", "-v", action="store_true")
    parser.add_argument("--output", "-o", help="Write report to file (default: stdout)")
    parser.add_argument("--skip-pr", action="store_true", help="Skip PR analysis")
    parser.add_argument("--skip-quality", action="store_true", help="Skip code quality check")
    args = parser.parse_args()

    gen = ReviewReportGenerator(
        args.target,
        base_branch=args.base,
        verbose=args.verbose,
        skip_pr=args.skip_pr,
        skip_quality=args.skip_quality,
    )
    report = gen.run()

    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            f.write(report)
        print(f"\n📄 Report written to {args.output}")
    else:
        print(report)


if __name__ == "__main__":
    main()
