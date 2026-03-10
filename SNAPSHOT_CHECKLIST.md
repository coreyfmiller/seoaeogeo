# Test Snapshot System - Usage Checklist

## Initial Setup ✓

- [ ] Run `npm install` to install dependencies (including `tsx`)
- [ ] Verify `test-data/` directory is in `.gitignore`
- [ ] Read `SNAPSHOT_SYSTEM_SUMMARY.md` for overview

## Before Making Code Changes

- [ ] Capture baseline snapshot of test domain
- [ ] Run `npm run test:variance` to verify current consistency
- [ ] Note current scores for comparison

## Testing Deterministic Scoring

- [ ] Run same URL twice with "Save test snapshot" enabled
- [ ] Run `npm run test:variance`
- [ ] Verify Schema Quality scores are identical
- [ ] Verify Brand Consistency scores are identical
- [ ] Confirm AI responses differ (expected)

## Testing Prompt Changes

- [ ] Capture baseline snapshot before changes
- [ ] Modify prompt in `lib/gemini-sitewide.ts`
- [ ] Run `npm run replay 1` to test on saved data
- [ ] Compare old vs new scores
- [ ] Check if changes had intended effect
- [ ] Review token usage changes

## Testing Validation Logic Changes

- [ ] Capture baseline snapshot before changes
- [ ] Modify validation in `lib/schema-validator.ts`
- [ ] Run `npm run replay 1` to test on saved data
- [ ] Verify scores changed as expected
- [ ] Check for unintended side effects

## Debugging Score Variance

- [ ] Load historical snapshot when score was good
- [ ] Run fresh scan with snapshot enabled
- [ ] Run `npm run test:variance`
- [ ] Compare crawl data between snapshots
- [ ] Identify what changed (site content vs code)
- [ ] Document root cause

## Before Deployment

- [ ] Run variance test on production-like data
- [ ] Verify deterministic scores are consistent
- [ ] Check token usage is within budget
- [ ] Confirm no regressions in scoring
- [ ] Document any expected score changes

## Maintenance

- [ ] Review `test-data/` directory size monthly
- [ ] Delete old snapshots (keep last 5-10 per domain)
- [ ] Update documentation if workflow changes
- [ ] Share findings with team

## Troubleshooting

### Snapshots Not Saving
- [ ] Check "Save test snapshot" checkbox is enabled
- [ ] Verify `test-data/` directory exists
- [ ] Check console for errors
- [ ] Verify disk space available

### Scores Don't Match
- [ ] Confirm using same snapshot data
- [ ] Check if validation logic was modified
- [ ] Verify no environment differences
- [ ] Review recent code changes

### Replay Script Fails
- [ ] Verify snapshot file exists
- [ ] Check file is valid JSON
- [ ] Ensure dependencies installed
- [ ] Run `npm install` if needed

### Variance Analysis Shows Issues
- [ ] Check if site content actually changed
- [ ] Review recent code commits
- [ ] Verify crawler extracted same data
- [ ] Compare raw crawl data between snapshots

## Quick Commands Reference

```bash
# Install dependencies
npm install

# Capture snapshot
# (Use UI checkbox on /site-analysis page)

# Analyze variance
npm run test:variance

# Replay snapshot
npm run replay              # List snapshots
npm run replay 1            # Replay first
npm run replay filename.json # Replay specific

# View snapshots
ls test-data/

# Delete old snapshots
rm test-data/2026-03-01*
```

## Expected Outcomes

### ✅ Success Indicators
- Deterministic scores match across runs (0% variance)
- AI insights vary slightly but reasonably
- Token usage is consistent (±5%)
- Replay produces same deterministic scores
- No unexpected score changes after code updates

### ⚠️ Warning Signs
- Deterministic scores vary >5 points
- Token usage spikes significantly
- Replay produces different scores
- Crawl data differs on identical sites
- Validation logic produces inconsistent results

### ❌ Critical Issues
- Deterministic scores vary >20 points
- Replay fails completely
- Snapshots corrupt or unreadable
- Validation logic broken
- Scores change without code/content changes

## Best Practices

1. **Capture Regularly**: Save snapshots before major changes
2. **Test Thoroughly**: Run variance tests after any scoring logic changes
3. **Document Changes**: Note why scores changed in commit messages
4. **Clean Up**: Delete old snapshots to save disk space
5. **Share Results**: Communicate findings with team
6. **Version Control**: Keep validation logic changes in separate commits
7. **Monitor Tokens**: Track API usage to avoid surprises
8. **Verify Determinism**: Regularly confirm scores are consistent

## Integration with CI/CD

Consider adding to your pipeline:

```yaml
# Example GitHub Actions workflow
- name: Test Scoring Consistency
  run: |
    npm run replay baseline-snapshot.json
    # Fail if scores changed unexpectedly
```

## Questions?

- See `TEST_SNAPSHOTS.md` for full documentation
- See `TESTING_EXAMPLE.md` for detailed examples
- See `SNAPSHOT_FLOW.md` for system architecture
