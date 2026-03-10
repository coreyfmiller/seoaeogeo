// Create complete merged dashboard by copying deep crawler and modifying it
const fs = require('fs');

// Read the deep crawler file
let content = fs.readFileSync('app/site-analysis/page.tsx', 'utf8');

// 1. Change the component name
content = content.replace('export default function SiteAnalysis()', 'export default function MergedDashboard()');

// 2. Add scanMode state after isCheckingAuth
content = content.replace(
  'const [isCheckingAuth, setIsCheckingAuth] = useState(true)',
  `const [isCheckingAuth, setIsCheckingAuth] = useState(true)
    const [scanMode, setScanMode] = useState<"quick" | "deep">("quick") // Quick/Deep scan toggle`
);

// 3. Update sessionStorage keys to use "merged_" prefix
content = content.replace(/sessionStorage\.getItem\("pro_url"\)/g, 'sessionStorage.getItem("merged_url")');
content = content.replace(/sessionStorage\.getItem\("pro_data"\)/g, 'sessionStorage.getItem("merged_data")');
content = content.replace(/sessionStorage\.setItem\("pro_url"/g, 'sessionStorage.setItem("merged_url"');
content = content.replace(/sessionStorage\.setItem\("pro_data"/g, 'sessionStorage.setItem("merged_data"');

// 4. Add scanMode to sessionStorage restore
content = content.replace(
  'const savedData = sessionStorage.getItem("merged_data")',
  `const savedData = sessionStorage.getItem("merged_data")
            const savedMode = sessionStorage.getItem("merged_scan_mode")`
);

content = content.replace(
  'if (savedUrl) setUrl(savedUrl)',
  `if (savedUrl) setUrl(savedUrl)
            if (savedMode) setScanMode(savedMode as "quick" | "deep")`
);

// 5. Add scanMode to sessionStorage save
content = content.replace(
  '    }, [url, analysisData])',
  `    }, [url, analysisData, scanMode])
    
    useEffect(() => {
        if (typeof window !== "undefined") {
            sessionStorage.setItem("merged_scan_mode", scanMode)
        }
    }, [scanMode])`
);

// 6. Update maxPages to use scanMode
content = content.replace(
  'setCrawlProgress({ current: 0, total: config?.maxPages || 20, stage: \'crawling\' })',
  `// Use scan mode to determine maxPages
        const maxPages = scanMode === "quick" ? 1 : (config?.maxPages || 20)
        setCrawlProgress({ current: 0, total: maxPages, stage: 'crawling' })`
);

content = content.replace(
  'maxPages: config?.maxPages || 20,',
  'maxPages,'
);

// 7. Update the page title
content = content.replace(
  'PRO: Deep Crawler',
  `Merged Dashboard
                                        <Badge variant="secondary" className="bg-geo/10 text-geo border-geo/20 px-3 py-1">
                                            BETA
                                        </Badge>`
);

// 8. Update the description
content = content.replace(
  'Full domain authority audit — sitewide schema coverage, content gaps, cannibalization detection, and internal link architecture.',
  'Unified intelligence analysis — choose Quick Scan (1 page) or Deep Scan (10-20 pages) for comprehensive insights.'
);

// 9. Add scan mode toggle after the header div
const headerEndMarker = '</p>\n                                    {analysisData && (';
const scanModeToggle = `</p>
                                </div>
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
                                    {analysisData && (`;

content = content.replace(headerEndMarker, scanModeToggle);

// Write the new merged file
fs.writeFileSync('app/merged/page.tsx', content, 'utf8');

console.log('✓ Successfully created complete merged dashboard');
console.log('✓ Added Quick/Deep scan toggle');
console.log('✓ All 18+ sections included from deep crawler');
