"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Store,
  MapPin,
  FileText,
  Laptop,
  Briefcase,
  Utensils,
  Hammer,
  GraduationCap,
  Newspaper,
  Globe,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"

export type SiteType = 
  | 'e-commerce'
  | 'local-business'
  | 'blog'
  | 'saas'
  | 'portfolio'
  | 'restaurant'
  | 'contractor'
  | 'professional-services'
  | 'news-media'
  | 'educational'
  | 'general'

interface SiteTypeResult {
  primaryType: SiteType
  secondaryTypes?: SiteType[]
  confidence: number // 0-100
}

interface SiteTypeBadgeProps {
  siteType: SiteTypeResult
  onConfirm?: (confirmedType: SiteType) => void
  onManualSelect?: (selectedType: SiteType) => void
}

const siteTypeConfig: Record<SiteType, {
  label: string
  icon: React.ElementType
  color: string
  bgColor: string
  borderColor: string
  description: string
}> = {
  'e-commerce': {
    label: 'E-Commerce',
    icon: Store,
    color: 'text-[#842ce0]',
    bgColor: 'bg-[#842ce0]/10',
    borderColor: 'border-[#842ce0]/30',
    description: 'Online store selling products'
  },
  'local-business': {
    label: 'Local Business',
    icon: MapPin,
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    description: 'Physical location serving local customers'
  },
  'blog': {
    label: 'Blog',
    icon: FileText,
    color: 'text-green-600',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    description: 'Content-focused publication'
  },
  'saas': {
    label: 'SaaS',
    icon: Laptop,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    description: 'Software as a Service platform'
  },
  'portfolio': {
    label: 'Portfolio',
    icon: Briefcase,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/30',
    description: 'Showcase of work and projects'
  },
  'restaurant': {
    label: 'Restaurant',
    icon: Utensils,
    color: 'text-orange-600',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    description: 'Food service establishment'
  },
  'contractor': {
    label: 'Contractor',
    icon: Hammer,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    description: 'Construction or service contractor'
  },
  'professional-services': {
    label: 'Professional Services',
    icon: Briefcase,
    color: 'text-teal-600',
    bgColor: 'bg-teal-500/10',
    borderColor: 'border-teal-500/30',
    description: 'Legal, accounting, consulting, etc.'
  },
  'news-media': {
    label: 'News/Media',
    icon: Newspaper,
    color: 'text-red-600',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    description: 'News publication or media outlet'
  },
  'educational': {
    label: 'Educational',
    icon: GraduationCap,
    color: 'text-pink-600',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
    description: 'School, university, or learning platform'
  },
  'general': {
    label: 'General',
    icon: Globe,
    color: 'text-gray-600',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/30',
    description: 'General purpose website'
  }
}

export function SiteTypeBadge({ siteType, onConfirm, onManualSelect }: SiteTypeBadgeProps) {
  const [isManualSelecting, setIsManualSelecting] = useState(false)
  const [selectedType, setSelectedType] = useState<SiteType>(siteType.primaryType)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [showWhy, setShowWhy] = useState(false)

  const config = siteTypeConfig[siteType.primaryType]
  const Icon = config.icon

  // Determine confidence level
  const confidenceLevel = 
    siteType.confidence >= 85 ? 'high' :
    siteType.confidence >= 70 ? 'medium' : 'low'

  const confidenceConfig = {
    high: {
      icon: CheckCircle2,
      color: 'text-geo',
      bgColor: 'bg-geo/10',
      borderColor: 'border-geo/30',
      label: 'High Confidence'
    },
    medium: {
      icon: AlertCircle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
      label: 'Medium Confidence'
    },
    low: {
      icon: HelpCircle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      borderColor: 'border-destructive/30',
      label: 'Low Confidence'
    }
  }

  const ConfidenceIcon = confidenceConfig[confidenceLevel].icon

  const handleConfirm = () => {
    setIsConfirmed(true)
    if (onConfirm) {
      onConfirm(siteType.primaryType)
    }
  }

  const handleManualSelect = () => {
    setIsConfirmed(true)
    if (onManualSelect) {
      onManualSelect(selectedType)
    }
    setIsManualSelecting(false)
  }

  // High confidence - just show the badge
  if (confidenceLevel === 'high') {
    return (
      <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg border bg-background/60" style={{
        borderColor: config.borderColor.replace('border-', ''),
        backgroundColor: config.bgColor.replace('bg-', '')
      }}>
        <div className={cn("h-7 w-7 rounded-md flex items-center justify-center", config.bgColor)}>
          <Icon className={cn("h-4 w-4", config.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold">Site Type:</span>
            <span className={cn("text-xs font-bold", config.color)}>{config.label}</span>
          </div>
          <p className="text-[10px] text-muted-foreground truncate">{config.description}</p>
        </div>
        <Badge variant="outline" className={cn("shrink-0 text-[10px] px-1.5 py-0", confidenceConfig.high.borderColor, confidenceConfig.high.color, confidenceConfig.high.bgColor)}>
          <ConfidenceIcon className="h-2.5 w-2.5 mr-0.5" />
          {siteType.confidence}%
        </Badge>
      </div>
    )
  }

  // Medium confidence - show with confirmation option
  if (confidenceLevel === 'medium') {
    return (
      <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg border bg-background/60" style={{
        borderColor: confidenceConfig.medium.borderColor.replace('border-', ''),
        backgroundColor: confidenceConfig.medium.bgColor.replace('bg-', '')
      }}>
        <div className={cn("h-7 w-7 rounded-md flex items-center justify-center", config.bgColor)}>
          <Icon className={cn("h-4 w-4", config.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold">Detected:</span>
            <span className={cn("text-xs font-bold", config.color)}>{config.label}</span>
          </div>
          <p className="text-[10px] text-muted-foreground truncate">
            {config.description} • {siteType.confidence}%
          </p>
        </div>
        {isConfirmed ? (
          <Badge variant="outline" className="shrink-0 text-[10px] px-1.5 py-0 border-geo/30 text-geo bg-geo/10">
            <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
            Confirmed
          </Badge>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={handleConfirm}
            className={cn("shrink-0 h-7 text-xs px-2", confidenceConfig.medium.borderColor, confidenceConfig.medium.color)}
          >
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Confirm
          </Button>
        )}
      </div>
    )
  }

  // Low confidence - require manual selection
  if (isManualSelecting) {
    return (
      <div className="px-2 py-1.5 rounded-lg border bg-background/60 space-y-2" style={{
        borderColor: confidenceConfig.low.borderColor.replace('border-', ''),
        backgroundColor: confidenceConfig.low.bgColor.replace('bg-', '')
      }}>
        <div className="flex items-center gap-1.5">
          <HelpCircle className={cn("h-3.5 w-3.5", confidenceConfig.low.color)} />
          <span className="text-xs font-bold">Select your site type:</span>
        </div>
        <div className="flex gap-2">
          <Select value={selectedType} onValueChange={(value: string) => setSelectedType(value as SiteType)}>
            <SelectTrigger className="flex-1 h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(siteTypeConfig).map(([type, cfg]) => {
                const TypeIcon = cfg.icon
                return (
                  <SelectItem key={type} value={type}>
                    <div className="flex items-center gap-2">
                      <TypeIcon className={cn("h-4 w-4", cfg.color)} />
                      <span>{cfg.label}</span>
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
          <Button onClick={handleManualSelect} size="sm" className="shrink-0 h-7 text-xs px-2">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Confirm
          </Button>
        </div>
      </div>
    )
  }

  // Low confidence - not yet selecting
  if (isConfirmed) {
    return (
      <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg border bg-background/60" style={{
        borderColor: config.borderColor.replace('border-', ''),
        backgroundColor: config.bgColor.replace('bg-', '')
      }}>
        <div className={cn("h-7 w-7 rounded-md flex items-center justify-center", config.bgColor)}>
          <Icon className={cn("h-4 w-4", config.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold">Site Type:</span>
            <span className={cn("text-xs font-bold", config.color)}>{config.label}</span>
          </div>
          <p className="text-[10px] text-muted-foreground truncate">{config.description}</p>
        </div>
        <Badge variant="outline" className="shrink-0 text-[10px] px-1.5 py-0 border-geo/30 text-geo bg-geo/10">
          <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
          Confirmed
        </Badge>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-background/60" style={{
      borderColor: confidenceConfig.low.borderColor.replace('border-', ''),
      backgroundColor: confidenceConfig.low.bgColor.replace('bg-', '')
    }}>
      <div className="flex items-center gap-2 px-2 py-1.5 animate-pulse-subtle">
        <div className={cn("h-7 w-7 rounded-md flex items-center justify-center", confidenceConfig.low.bgColor)}>
          <HelpCircle className={cn("h-4 w-4", confidenceConfig.low.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold">Site Type Uncertain</span>
            <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", confidenceConfig.low.borderColor, confidenceConfig.low.color)}>
              {siteType.confidence}%
            </Badge>
          </div>
          <p className="text-[10px] text-muted-foreground truncate">
            Best guess: {config.label} • Please confirm
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsManualSelecting(true)}
          className="shrink-0 h-7 text-xs px-2"
        >
          <Sparkles className="h-3 w-3 mr-1" />
          Select Type
        </Button>
      </div>
      <div className="px-2 pb-1.5">
        <button
          onClick={() => setShowWhy(!showWhy)}
          className="text-[10px] text-muted-foreground hover:text-foreground transition-colors underline decoration-dashed underline-offset-2"
        >
          Why am I seeing this?
        </button>
        {showWhy && (
          <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
            Citatom scores each site differently based on its type — an e-commerce store is evaluated differently than a blog or a SaaS product. Our AI couldn't confidently determine what kind of site this is, which usually means the page is missing clear signals like structured data, descriptive headings, or focused content. Please select your site type so we can score it accurately.
          </p>
        )}
      </div>
    </div>
  )
}
