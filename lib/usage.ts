import fs from 'fs';
import path from 'path';

const USAGE_FILE = path.join(process.cwd(), 'usage_log.json');

export interface UsageRecord {
    timestamp: string;
    model: string;
    type: string;
    inputTokens: number;
    outputTokens: number;
    cost: number;
    url?: string;
}

// Pricing per 1M tokens (ACTUAL RATES based on real usage data)
// Updated March 11, 2026 - Real cost was $1.68 for 74 queries on March 10
// Calculated cost was $0.0554, actual multiplier: 30.33x
// Average cost per query: $0.0227 (based on 74 queries costing $1.68)
const PRICING = {
    'gemini-2.5-flash': { input: 2.275, output: 9.10 }, // $ per 1M tokens (adjusted 30.33x)
    'gemini-2.0-flash': { input: 2.275, output: 9.10 },
    'gemini-1.5-flash': { input: 2.275, output: 9.10 },
    'gemini-1.5-pro': { input: 37.91, output: 151.65 },
    'default': { input: 3.03, output: 12.13 }
};

// Historical average cost per query (for estimation)
export const AVERAGE_COST_PER_QUERY = 0.0227; // $0.0227 per query based on real data

export async function logUsage(record: Omit<UsageRecord, 'timestamp' | 'cost'>) {
    try {
        const pricing = PRICING[record.model as keyof typeof PRICING] || PRICING.default;
        const inputCost = (record.inputTokens / 1_000_000) * pricing.input;
        const outputCost = (record.outputTokens / 1_000_000) * pricing.output;
        const totalCost = inputCost + outputCost;

        const newRecord: UsageRecord = {
            ...record,
            timestamp: new Date().toISOString(),
            cost: totalCost
        };

        let logs: UsageRecord[] = [];
        if (fs.existsSync(USAGE_FILE)) {
            const data = fs.readFileSync(USAGE_FILE, 'utf-8');
            logs = JSON.parse(data);
        }

        logs.push(newRecord);
        fs.writeFileSync(USAGE_FILE, JSON.stringify(logs, null, 2));

        console.log(`[Usage Log] ${record.type} | Cost: $${totalCost.toFixed(5)} | Tokens: ${record.inputTokens}i/${record.outputTokens}o`);
        return totalCost;
    } catch (error) {
        console.error('Failed to log usage:', error);
        return 0;
    }
}

export function getUsageStats() {
    if (!fs.existsSync(USAGE_FILE)) return { totalCost: 0, dailyUsage: {} };

    const data = fs.readFileSync(USAGE_FILE, 'utf-8');
    const logs: UsageRecord[] = JSON.parse(data);

    const stats = logs.reduce((acc, curr) => {
        const date = curr.timestamp.split('T')[0];
        acc.totalCost += curr.cost;
        if (!acc.dailyUsage[date]) {
            acc.dailyUsage[date] = { cost: 0, queries: 0, tokens: 0 };
        }
        acc.dailyUsage[date].cost += curr.cost;
        acc.dailyUsage[date].queries += 1;
        acc.dailyUsage[date].tokens += (curr.inputTokens + curr.outputTokens);
        return acc;
    }, { totalCost: 0, dailyUsage: {} as Record<string, { cost: number, queries: number, tokens: number }> });

    return stats;
}
