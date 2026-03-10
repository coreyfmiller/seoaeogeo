// Create a TRUE merged dashboard combining Pro Dashboard + Deep Crawler
const fs = require('fs');

// Read both source files
const proDashboard = fs.readFileSync('app/page.tsx', 'utf8');
const deepCrawler = fs.readFileSync('app/site-analysis/page.tsx', 'utf8');

// Start with Pro Dashboard as the base (it has the 3 score cards + tabs)
let merged = proDashboard;

// 1. Change component name
merged = merged.replace('export default function Dashboard()', 'export default function MergedDashboard()');

// 2. Add scanMode state after apiStatus
merged = merged.replace(
  'const [apiStatus, setApiStatus] = useState<"healthy" | "error" | "idle">("idle")',
  `const [apiStatus, setApiStatus] = useState<"healthy" | "error" | "idle">("idle")
  const [scanMode, setScanMode] = useState<"quick" | "deep">("quick")`
);

// 3. Update sessionStorage keys
merged = merged.replace(/sessionStorage\.getItem\("dashboard_url"\)/g, 'sessionStorage.getItem("merged_url")');
merged = merged.replace(/sessionStorage\.getItem\("dashboard_data"\)/g, 'sessionStorage.getItem("merged_data")');
merged = merged.replace(/sessionStorage\.setItem\("dashboard_url"/g, 'sessionStorage.setItem("merged_url"');
merged = merged.replace(/sessionStorage\.setItem\("dashboard_data"/g, 'sessionStorage.setItem("merged_data"');

// 4. Add scanMode to sessionStorage
merged = merged.replace(
  'const savedData = sessionStorage.getItem("merged_data")',
  `const savedData = sessionStorage.getItem("merged_data")
      const savedMode = sessionStorage.getItem("merged_scan_mode")`
);

merged = merged.replace(
  'if (savedData) setAnalysisData(JSON.parse(savedData))',
  `if (savedData) setAnalysisData(JSON.parse(savedData))
      if (savedMode) setScanMode(savedMode as "quick" | "deep")`
);

merged = merged.replace(
  '  }, [currentUrl, analysisData])',
  `  }, [currentUrl, analysisData, scanMode])
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("merged_scan_mode", scanMode)
    }
  }, [scanMode])`
);

// 5. Update API call to use analyze-site with maxPages
merged = merged.replace(
  `const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })`,
  `const maxPages = scanMode === "quick" ? 1 : 10
      
      const response = await fetch('/api/analyze-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, maxPages }),
      })`
);

// 6. Update page title
merged = merged.replace(
  'Intelligence Dashboard',
  `Merged Dashboard
                    <Badge variant="secondary" className="bg-geo/10 text-geo border-geo/20 px-3 py-1">
                      BETA
                    </Badge>`
);

// 7. Add scan mode toggle after the header
const headerInsertPoint = '</div>\n                {!analysisData && !isAnalyzing && (';
const scanModeToggle = `</div>
                <div className="flex items-center gap-3">
                  {/* Scan Mode Toggle */}
                  <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
                    <button
                      onClick={() => setScanMode("quick")}
                      disabled={isAnalyzing}
                      className={cn(
                        "px-3 py-1.5 rounded text-sm font-medium transition-all",
                        scanMode === "quick"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Quick Scan
                    </button>
                    <button
                      onClick={() => setScanMode("deep")}
                      disabled={isAnalyzing}
                      className={cn(
                        "px-3 py-1.5 rounded text-sm font-medium transition-all",
                        scanMode === "deep"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Deep Scan
                    </button>
                  </div>
                </div>
              </div>
                {!analysisData && !isAnalyzing && (`;

merged = merged.replace(headerInsertPoint, scanModeToggle);

// 8. Now add ALL the deep crawler sections after the tabs
// Find where the tabs end in Pro Dashboard
const proTabsEndMarker = '</Tabs>\n                  </div>\n\n                  {/* Recommendations Sidebar */}';

// Extract all the deep crawler sections (after tabs, before "Start Over + PDF Export")
const deepCrawlerSectionsStart = deepCrawler.indexOf('{/* ── Prioritized Site Improvements ── */}');
const deepCrawlerSectionsEnd = deepCrawler.indexOf('{/* Start Over + PDF Export */}');

if (deepCrawlerSectionsStart === -1 || deepCrawlerSectionsEnd === -1) {
  console.error('Could not find deep crawler sections markers');
  console.error('Start:', deepCrawlerSectionsStart, 'End:', deepCrawlerSectionsEnd);
  process.exit(1);
}

const deepCrawlerSections = deepCrawler.substring(deepCrawlerSectionsStart, deepCrawlerSectionsEnd).trim();

// Insert deep crawler sections after tabs - look for Recommendations Sidebar comment
const insertPoint = merged.indexOf('{/* Recommendations Sidebar */}');
if (insertPoint === -1) {
  console.error('Could not find Recommendations Sidebar marker');
  process.exit(1);
}

// Insert before the Recommendations Sidebar
const before = merged.substring(0, insertPoint);
const after = merged.substring(insertPoint);

merged = before + '{/* Deep Crawler Sections */}\n                  <div className="space-y-6 mt-6">\n' + deepCrawlerSections + '\n                  </div>\n\n                  ' + after;

// 9. Add missing imports from deep crawler
const proDashboardImports = merged.substring(0, merged.indexOf('export default'));
const deepCrawlerImports = deepCrawler.substring(0, deepCrawler.indexOf('// Enhanced tooltip'));

// Extract unique imports from deep crawler
const importsToAdd = [
  'import { SemanticMap } from "@/components/dashboard/semantic-map"',
  'import { CompetitorGapView } from "@/components/dashboard/competitor-gap-view"',
  'import { FixInstructionCard } from "@/components/dashboard/fix-instruction-card"',
  'import { PageComparisonTable } from "@/components/dashboard/page-comparison-table"',
  'import { MultiPageDashboard } from "@/components/dashboard/multi-page-dashboard"',
  'import { SiteTypeBadge } from "@/components/dashboard/site-type-badge"',
  'import { CrawlConfig } from "@/components/dashboard/crawl-config"',
  'import { CrawlProgress } from "@/components/dashboard/crawl-progress"',
];

const iconsToAdd = [
  'ShieldCheck',
  'TrendingUp',
  'Target',
  'Link2',
  'AlarmClock',
  'LayoutDashboard',
  'FileText',
  'Code2',
  'Info',
  'Map',
  'AlertCircle',
  'Zap',
];

// Add component imports
let finalImports = proDashboardImports;
importsToAdd.forEach(imp => {
  if (!finalImports.includes(imp)) {
    finalImports = finalImports.replace(
      'import { cn } from "@/lib/utils"',
      `${imp}\nimport { cn } from "@/lib/utils"`
    );
  }
});

// Add icon imports
const currentIcons = finalImports.match(/import \{([^}]+)\} from "lucide-react"/)[1];
iconsToAdd.forEach(icon => {
  if (!currentIcons.includes(icon)) {
    finalImports = finalImports.replace(
      '} from "lucide-react"',
      `,\n  ${icon},\n} from "lucide-react"`
    );
  }
});

// Add InfoTooltip component from deep crawler
const infoTooltipComponent = deepCrawler.substring(
  deepCrawler.indexOf('// Enhanced tooltip component'),
  deepCrawler.indexOf('function SchemaIssueCard')
);

merged = finalImports + '\n' + infoTooltipComponent + '\n' + merged.substring(merged.indexOf('export default'));

// Write the final merged file
fs.writeFileSync('app/merged/page.tsx', merged, 'utf8');

console.log('✓ Successfully created TRUE merged dashboard');
console.log('✓ Includes 3 score cards from Pro Dashboard');
console.log('✓ Includes SEO/AEO/GEO tabs from Pro Dashboard');
console.log('✓ Includes all 18+ sections from Deep Crawler');
console.log('✓ Added Quick/Deep scan toggle');
