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
    color: 'text-purple-600',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
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
    if (onConfirm) {
      onConfirm(siteType.primaryType)
    }
  }

  const handleManualSelect = () => {
    if (onManualSelect) {
      onManualSelect(selectedType)
      setIsManualSelecting(false)
    }
  }

  // High confidence - just show the badge
  if (confidenceLevel === 'high') {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl border bg-background/60" style={{
        borderColor: config.borderColor.replace('border-', ''),
        backgroundColor: config.bgColor.replace('bg-', '')
      }}>
        <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", config.bgColor)}>
          <Icon className={cn("h-5 w-5", config.color)} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold">Site Type:</span>
            <span className={cn("text-sm font-bold", config.color)}>{config.label}</span>
          </div>
          <p className="text-xs text-muted-foreground">{config.description}</p>
        </div>
        <Badge variant="outline" className={cn("shrink-0", confidenceConfig.high.borderColor, confidenceConfig.high.color, confidenceConfig.high.bgColor)}>
          <ConfidenceIcon className="h-3 w-3 mr-1" />
          {siteType.confidence}% confident
        </Badge>
      </div>
    )
  }

  // Medium confidence - show with confirmation option
  if (confidenceLevel === 'medium') {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl border bg-background/60" style={{
        borderColor: confidenceConfig.medium.borderColor.replace('border-', ''),
        backgroundColor: confidenceConfig.medium.bgColor.replace('bg-', '')
      }}>
        <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", config.bgColor)}>
          <Icon className={cn("h-5 w-5", config.color)} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold">Detected Site Type:</span>
            <span className={cn("text-sm font-bold", config.color)}>{config.label}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {config.description} • {siteType.confidence}% confidence
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleConfirm}
          className={cn("shrink-0", confidenceConfig.medium.borderColor, confidenceConfig.medium.color)}
        >
          <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
          Confirm
        </Button>
      </div>
    )
  }

  // Low confidence - require manual selection
  if (isManualSelecting) {
    return (
      <div className="p-4 rounded-xl border bg-background/60 space-y-3" style={{
        borderColor: confidenceConfig.low.borderColor.replace('border-', ''),
        backgroundColor: confidenceConfig.low.bgColor.replace('bg-', '')
      }}>
        <div className="flex items-center gap-2">
          <HelpCircle className={cn("h-4 w-4", confidenceConfig.low.color)} />
          <span className="text-sm font-bold">Please select your site type:</span>
        </div>
        <div className="flex gap-2">
          <Select value={selectedType} onValueChange={(value) => setSelectedType(value as SiteType)}>
            <SelectTrigger className="flex-1">
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
          <Button onClick={handleManualSelect} className="shrink-0">
            <CheckCircle2 className="h-4 w-4 mr-1.5" />
            Confirm
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {siteTypeConfig[selectedType].description}
        </p>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border bg-background/60" style={{
      borderColor: confidenceConfig.low.borderColor.replace('border-', ''),
      backgroundColor: confidenceConfig.low.bgColor.replace('bg-', '')
    }}>
      <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", confidenceConfig.low.bgColor)}>
        <HelpCircle className={cn("h-5 w-5", confidenceConfig.low.color)} />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-bold">Site Type Uncertain</span>
          <Badge variant="outline" className={cn("text-[10px]", confidenceConfig.low.borderColor, confidenceConfig.low.color)}>
            {siteType.confidence}% confidence
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Best guess: {config.label} • Please confirm for accurate recommendations
        </p>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIsManualSelecting(true)}
        className="shrink-0"
      >
        <Sparkles className="h-3.5 w-3.5 mr-1.5" />
        Select Type
      </Button>
    </div>
  )
}
