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

// Pricing per 1M tokens (Approximate for Gemini 1.5/2.0 Flash as of early 2025)
// Adjust these based on real current pricing
const PRICING = {
    'gemini-2.5-flash': { input: 0.075, output: 0.30 }, // $ per 1M tokens
    'gemini-2.0-flash': { input: 0.075, output: 0.30 },
    'gemini-1.5-flash': { input: 0.075, output: 0.30 },
    'gemini-1.5-pro': { input: 1.25, output: 5.00 },
    'default': { input: 0.10, output: 0.40 }
};

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
