# API Cost Tracking

## Actual Cost Data

### March 10, 2026 (Yesterday)
- **Actual Cost**: $1.68
- **Total Queries**: 74
- **Average Cost Per Query**: $0.0227

### Pricing Correction
The initial pricing estimates were significantly underestimating actual costs:
- **Calculated Cost** (old pricing): $0.0554
- **Actual Cost**: $1.68
- **Multiplier**: 30.33x

This means the real Gemini API costs are approximately **30x higher** than initially estimated.

## Updated Pricing Model

### Gemini 2.5 Flash (per 1M tokens)
- **Input**: $2.275
- **Output**: $9.10

### Cost Estimates by Query Type

Based on average token usage and corrected pricing:

| Query Type | Avg Input Tokens | Avg Output Tokens | Estimated Cost |
|------------|------------------|-------------------|----------------|
| Single Page Audit | 3,500 | 1,400 | $0.0206 |
| Sitewide Pro Audit (5 pages) | 8,000 | 3,000 | $0.0455 |
| Sitewide Pro Audit (20 pages) | 28,000 | 3,000 | $0.0910 |
| Competitive Battle | 4,500 | 1,500 | $0.0239 |
| Live Interrogation | 750 | 475 | $0.0060 |

## Daily Burn History

| Date | Actual Cost | Queries | Avg/Query |
|------|-------------|---------|-----------|
| 2026-03-10 | $1.68 | 74 | $0.0227 |

## Notes

- Free Scan uses 5-page crawl: ~$0.046 per scan
- Pro Audit uses single page: ~$0.021 per scan
- Deep Crawler (20 pages): ~$0.091 per scan
- Competitive Intel: ~$0.024 per comparison

## Future Monitoring

Track actual costs daily and update this document to refine estimates.
