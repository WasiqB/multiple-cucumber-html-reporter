'use client';

import {
  Check,
  Clock,
  Code2,
  Copy,
  Download,
  FileCode,
  FileText,
  FolderOpen,
  LayoutTemplate,
  Monitor,
  Palette,
  Plus,
  RotateCcw,
  Sliders,
  Sparkles,
  Terminal,
  Trash2,
  Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/cn';
import {
  buildReporterOptions,
  type ConfigFormat,
  type ConfigFormState,
  DEFAULT_CONFIG_STATE,
  formatConfigFile,
  PRESETS,
} from '@/lib/config-generator';

const FORMAT_CONFIGS: { format: ConfigFormat; label: string; ext: string; badge: string }[] = [
  { format: 'json', label: 'JSON (.json)', ext: '.multiple-cucumber-html-reporter.json', badge: 'Standard' },
  { format: 'yaml', label: 'YAML (.yml)', ext: '.multiple-cucumber-html-reporter.yml', badge: 'Popular' },
  { format: 'js', label: 'JavaScript (.js)', ext: '.multiple-cucumber-html-reporter.js', badge: 'Dynamic' },
  { format: 'ts', label: 'TypeScript (.ts)', ext: '.multiple-cucumber-html-reporter.ts', badge: 'Type-safe' },
  { format: 'rc', label: 'RC File (.rc)', ext: '.multiple-cucumber-html-reporterrc', badge: 'Dotfile' },
];

export default function ConfigBuilderPage() {
  const [state, setState] = useState<ConfigFormState>(DEFAULT_CONFIG_STATE);
  const [selectedFormat, setSelectedFormat] = useState<ConfigFormat>('json');
  const [activeTab, setActiveTab] = useState<string>('main');
  const [copied, setCopied] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  // Generated options
  const reporterOptions = useMemo(() => buildReporterOptions(state), [state]);
  const formatted = useMemo(() => formatConfigFile(reporterOptions, selectedFormat), [reporterOptions, selectedFormat]);

  const optionCount = useMemo(() => Object.keys(reporterOptions).length, [reporterOptions]);

  const handleUpdate = <K extends keyof ConfigFormState>(key: K, value: ConfigFormState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
    setActivePreset(null);
  };

  const handleReset = () => {
    setState(DEFAULT_CONFIG_STATE);
    setActivePreset(null);
  };

  const handleApplyPreset = (presetKey: string) => {
    const preset = PRESETS[presetKey];
    if (!preset) return;
    setState({
      ...DEFAULT_CONFIG_STATE,
      ...preset.state,
    });
    setActivePreset(presetKey);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(formatted.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([formatted.content], { type: formatted.mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = formatted.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const addCustomDataField = () => {
    setState((prev) => ({
      ...prev,
      extraCustomData: [...prev.extraCustomData, { id: Math.random().toString(36).slice(2, 9), key: '', value: '' }],
    }));
  };

  const updateCustomDataField = (id: string, keyOrVal: 'key' | 'value', val: string) => {
    setState((prev) => ({
      ...prev,
      extraCustomData: prev.extraCustomData.map((item) => (item.id === id ? { ...item, [keyOrVal]: val } : item)),
    }));
  };

  const removeCustomDataField = (id: string) => {
    setState((prev) => ({
      ...prev,
      extraCustomData: prev.extraCustomData.filter((item) => item.id !== id),
    }));
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className='min-h-screen bg-linear-to-b from-background via-muted/20 to-background'>
        {/* Header Hero Section */}
        <div className='relative overflow-hidden border-b border-border/40 bg-muted/30 py-8 sm:py-12 md:py-16'>
          <div className='absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent' />
          <div className='container mx-auto px-4 md:px-6 max-w-7xl'>
            <div className='flex flex-col md:flex-row md:items-end md:justify-between gap-6'>
              <div>
                <div className='inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-3 sm:mb-4'>
                  <Sparkles className='size-3.5' />
                  <span>Interactive Configuration Assistant</span>
                </div>
                <h1 className='text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground'>
                  Config <span className='text-emerald-500'>Builder</span>
                </h1>
                <p className='mt-2 sm:mt-3 text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed'>
                  Tailor your reporter settings visually using toggle controls, select your preferred format, and
                  instantly copy or download ready-to-use configuration files for your Cucumber runs.
                </p>
              </div>

              {/* Quick Actions */}
              <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto'>
                <Button
                  variant='outline'
                  size='default'
                  onClick={handleReset}
                  className='border-border/60 hover:bg-muted font-medium gap-1.5 w-full sm:w-auto justify-center'
                  title='Reset all options to default values'
                >
                  <RotateCcw className='size-4 text-muted-foreground' />
                  Reset to Defaults
                </Button>
                <Button
                  variant='default'
                  size='default'
                  onClick={handleDownload}
                  className='bg-emerald-600 hover:bg-emerald-500 text-white font-medium gap-1.5 shadow-md shadow-emerald-600/20 w-full sm:w-auto justify-center'
                >
                  <Download className='size-4' />
                  Download File
                </Button>
              </div>
            </div>

            {/* Presets bar */}
            <div className='mt-8 pt-6 border-t border-border/40 flex flex-wrap items-center gap-3'>
              <span className='text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5'>
                <Zap className='size-3.5 text-amber-500' />
                Quick Presets:
              </span>
              {Object.entries(PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  type='button'
                  onClick={() => handleApplyPreset(key)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                    activePreset === key
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 shadow-xs'
                      : 'bg-card border border-border/60 text-foreground hover:bg-muted hover:border-border'
                  }`}
                >
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Interactive Grid */}
        <div className='container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-7xl'>
          <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'>
            {/* Left Column: Form & Category Tabs (7 cols) */}
            <div className='lg:col-span-7 space-y-6'>
              <div className='rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xs shadow-xs p-4 sm:p-6'>
                <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
                  {/* Category Navigation Pills */}
                  <div className='border-b border-border/40 pb-4 mb-6'>
                    <div className='flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-muted/60'>
                      <button
                        type='button'
                        onClick={() => setActiveTab('main')}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all cursor-pointer select-none',
                          activeTab === 'main'
                            ? 'bg-background text-foreground shadow-xs'
                            : 'text-muted-foreground hover:text-foreground hover:bg-background/40',
                        )}
                      >
                        <FolderOpen className='size-3.5 text-emerald-500' />
                        <span>Paths & Core</span>
                      </button>

                      <button
                        type='button'
                        onClick={() => setActiveTab('behavior')}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all cursor-pointer select-none',
                          activeTab === 'behavior'
                            ? 'bg-background text-foreground shadow-xs'
                            : 'text-muted-foreground hover:text-foreground hover:bg-background/40',
                        )}
                      >
                        <Sliders className='size-3.5 text-emerald-500' />
                        <span>Behavior</span>
                      </button>

                      <button
                        type='button'
                        onClick={() => setActiveTab('durations')}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all cursor-pointer select-none',
                          activeTab === 'durations'
                            ? 'bg-background text-foreground shadow-xs'
                            : 'text-muted-foreground hover:text-foreground hover:bg-background/40',
                        )}
                      >
                        <Clock className='size-3.5 text-emerald-500' />
                        <span>Durations & Charts</span>
                      </button>

                      <button
                        type='button'
                        onClick={() => setActiveTab('branding')}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all cursor-pointer select-none',
                          activeTab === 'branding'
                            ? 'bg-background text-foreground shadow-xs'
                            : 'text-muted-foreground hover:text-foreground hover:bg-background/40',
                        )}
                      >
                        <Palette className='size-3.5 text-emerald-500' />
                        <span>Branding</span>
                      </button>

                      <button
                        type='button'
                        onClick={() => setActiveTab('attachments')}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all cursor-pointer select-none',
                          activeTab === 'attachments'
                            ? 'bg-background text-foreground shadow-xs'
                            : 'text-muted-foreground hover:text-foreground hover:bg-background/40',
                        )}
                      >
                        <LayoutTemplate className='size-3.5 text-emerald-500' />
                        <span>Attachments</span>
                      </button>

                      <button
                        type='button'
                        onClick={() => setActiveTab('metadata')}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all cursor-pointer select-none',
                          activeTab === 'metadata'
                            ? 'bg-background text-foreground shadow-xs'
                            : 'text-muted-foreground hover:text-foreground hover:bg-background/40',
                        )}
                      >
                        <Monitor className='size-3.5 text-emerald-500' />
                        <span>Metadata</span>
                      </button>

                      <button
                        type='button'
                        onClick={() => setActiveTab('customData')}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all cursor-pointer select-none',
                          activeTab === 'customData'
                            ? 'bg-background text-foreground shadow-xs'
                            : 'text-muted-foreground hover:text-foreground hover:bg-background/40',
                        )}
                      >
                        <FileText className='size-3.5 text-emerald-500' />
                        <span>Custom Data</span>
                      </button>
                    </div>
                  </div>

                  {/* TAB 1: Main & Paths */}
                  <TabsContent value='main' className='space-y-6 focus-visible:outline-none'>
                    <div>
                      <h2 className='text-lg font-bold text-foreground flex items-center gap-2'>
                        <FolderOpen className='size-4 text-emerald-500' />
                        Core Report Settings
                      </h2>
                      <p className='text-xs text-muted-foreground mt-1'>
                        Configure source directories and essential generation options.
                      </p>
                    </div>

                    <div className='space-y-4'>
                      <div className='space-y-2'>
                        <div className='flex items-center justify-between'>
                          <Label htmlFor='jsonDir' className='text-sm font-semibold flex items-center gap-1.5'>
                            JSON Reports Directory
                            <span className='text-rose-500 text-xs font-bold'>*</span>
                          </Label>
                          <Badge variant='outline' className='text-[10px] font-mono'>
                            required
                          </Badge>
                        </div>
                        <Input
                          id='jsonDir'
                          value={state.jsonDir}
                          onChange={(e) => handleUpdate('jsonDir', e.target.value)}
                          placeholder='./reports/json'
                          className='font-mono text-sm'
                        />
                        <p className='text-[11px] text-muted-foreground'>
                          Relative or absolute directory containing the generated Cucumber JSON report files.
                        </p>
                      </div>

                      <div className='space-y-2'>
                        <div className='flex items-center justify-between'>
                          <Label htmlFor='reportPath' className='text-sm font-semibold flex items-center gap-1.5'>
                            Output Report Directory
                            <span className='text-rose-500 text-xs font-bold'>*</span>
                          </Label>
                          <Badge variant='outline' className='text-[10px] font-mono'>
                            required
                          </Badge>
                        </div>
                        <Input
                          id='reportPath'
                          value={state.reportPath}
                          onChange={(e) => handleUpdate('reportPath', e.target.value)}
                          placeholder='./reports/html'
                          className='font-mono text-sm'
                        />
                        <p className='text-[11px] text-muted-foreground'>
                          Target directory where the final HTML report and assets will be created.
                        </p>
                      </div>

                      <div className='space-y-2 pt-2'>
                        <Label htmlFor='language' className='text-sm font-semibold'>
                          Report Language
                        </Label>
                        <Select value={state.language} onValueChange={(val: any) => handleUpdate('language', val)}>
                          <SelectTrigger id='language' className='w-full'>
                            <SelectValue placeholder='Select language' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='en'>English (en) - Default</SelectItem>
                            <SelectItem value='es'>Spanish (es)</SelectItem>
                            <SelectItem value='fr'>French (fr)</SelectItem>
                            <SelectItem value='pt'>Portuguese (pt) - Brazilian</SelectItem>
                            <SelectItem value='ar'>Arabic (ar) - RTL Layout</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className='text-[11px] text-muted-foreground'>
                          Language for static labels in both main and emailable reports. Arabic automatically activates
                          RTL.
                        </p>
                      </div>

                      {/* Toggles */}
                      <div className='divide-y divide-border/40 rounded-xl border border-border/60 bg-muted/20 px-4 py-2 mt-4'>
                        <div className='flex items-center justify-between py-3'>
                          <div className='space-y-0.5 pr-4'>
                            <Label htmlFor='emailReport' className='text-sm font-medium cursor-pointer'>
                              Generate Emailable HTML Report
                            </Label>
                            <p className='text-[11px] text-muted-foreground'>
                              Produces a single standalone email-friendly HTML report with overview stats.
                            </p>
                          </div>
                          <Switch
                            id='emailReport'
                            checked={state.emailReport}
                            onCheckedChange={(val) => handleUpdate('emailReport', val)}
                          />
                        </div>

                        <div className='flex items-center justify-between py-3'>
                          <div className='space-y-0.5 pr-4'>
                            <Label htmlFor='staticFilePath' className='text-sm font-medium cursor-pointer'>
                              Static Feature File Names
                            </Label>
                            <p className='text-[11px] text-muted-foreground'>
                              Gives each feature an unchanging static filename instead of generated hash IDs.
                            </p>
                          </div>
                          <Switch
                            id='staticFilePath'
                            checked={state.staticFilePath}
                            onCheckedChange={(val) => handleUpdate('staticFilePath', val)}
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* TAB 2: Behavior & Logging */}
                  <TabsContent value='behavior' className='space-y-6 focus-visible:outline-none'>
                    <div>
                      <h2 className='text-lg font-bold text-foreground flex items-center gap-2'>
                        <Sliders className='size-4 text-emerald-500' />
                        Reporter Runtime Behavior
                      </h2>
                      <p className='text-xs text-muted-foreground mt-1'>
                        Control report launching, asset handling, and terminal logging output.
                      </p>
                    </div>

                    <div className='space-y-4'>
                      <div className='space-y-2'>
                        <Label htmlFor='logging' className='text-sm font-semibold'>
                          Reporter Log Level
                        </Label>
                        <Select value={state.logging} onValueChange={(val: any) => handleUpdate('logging', val)}>
                          <SelectTrigger id='logging' className='w-full font-mono text-sm'>
                            <SelectValue placeholder='Select log level' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='silent'>silent (Default - completely quiet)</SelectItem>
                            <SelectItem value='info'>info (Recommended for CI pipelines)</SelectItem>
                            <SelectItem value='warn'>warn (Warnings only)</SelectItem>
                            <SelectItem value='error'>error (Fatal errors only)</SelectItem>
                            <SelectItem value='debug'>debug (Verbose diagnostic output)</SelectItem>
                            <SelectItem value='trace'>trace (Deep trace logs)</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className='text-[11px] text-muted-foreground'>
                          Log level printed during report building. Keep silent for clean terminal runs.
                        </p>
                      </div>

                      {/* Toggles */}
                      <div className='divide-y divide-border/40 rounded-xl border border-border/60 bg-muted/20 px-4 py-2 mt-4'>
                        <div className='flex items-center justify-between py-3'>
                          <div className='space-y-0.5 pr-4'>
                            <Label htmlFor='openReportInBrowser' className='text-sm font-medium cursor-pointer'>
                              Open in Default Browser
                            </Label>
                            <p className='text-[11px] text-muted-foreground'>
                              Automatically launches the generated HTML report in your OS browser when generation
                              completes.
                            </p>
                          </div>
                          <Switch
                            id='openReportInBrowser'
                            checked={state.openReportInBrowser}
                            onCheckedChange={(val) => handleUpdate('openReportInBrowser', val)}
                          />
                        </div>

                        <div className='flex items-center justify-between py-3'>
                          <div className='space-y-0.5 pr-4'>
                            <Label htmlFor='externalizeMedia' className='text-sm font-medium cursor-pointer'>
                              Externalize Media Attachments (Lazy-load)
                            </Label>
                            <p className='text-[11px] text-muted-foreground'>
                              Writes screenshot/video attachments to separate disk assets instead of inlining huge
                              Base64 strings.
                            </p>
                          </div>
                          <Switch
                            id='externalizeMedia'
                            checked={state.externalizeMedia}
                            onCheckedChange={(val) => handleUpdate('externalizeMedia', val)}
                          />
                        </div>

                        <div className='flex items-center justify-between py-3'>
                          <div className='space-y-0.5 pr-4'>
                            <Label htmlFor='saveCollectedJSON' className='text-sm font-medium cursor-pointer'>
                              Save Merged & Enriched JSON
                            </Label>
                            <p className='text-[11px] text-muted-foreground'>
                              Outputs the aggregated and enriched JSON test data into the report directory.
                            </p>
                          </div>
                          <Switch
                            id='saveCollectedJSON'
                            checked={state.saveCollectedJSON}
                            onCheckedChange={(val) => handleUpdate('saveCollectedJSON', val)}
                          />
                        </div>

                        <div className='flex items-center justify-between py-3'>
                          <div className='space-y-0.5 pr-4'>
                            <Label htmlFor='useCDN' className='text-sm font-medium cursor-pointer'>
                              Load Third-Party Assets from CDN
                            </Label>
                            <p className='text-[11px] text-muted-foreground'>
                              Loads common CSS/JS assets via CDN instead of bundling local static files (great for CI).
                            </p>
                          </div>
                          <Switch
                            id='useCDN'
                            checked={state.useCDN}
                            onCheckedChange={(val) => handleUpdate('useCDN', val)}
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* TAB 3: Durations & Charts */}
                  <TabsContent value='durations' className='space-y-6 focus-visible:outline-none'>
                    <div>
                      <h2 className='text-lg font-bold text-foreground flex items-center gap-2'>
                        <Clock className='size-4 text-emerald-500' />
                        Duration & Visual Metrics
                      </h2>
                      <p className='text-xs text-muted-foreground mt-1'>
                        Fine-tune time calculations, format precision, and doughnut charts.
                      </p>
                    </div>

                    <div className='divide-y divide-border/40 rounded-xl border border-border/60 bg-muted/20 px-4 py-2'>
                      <div className='flex items-center justify-between py-3'>
                        <div className='space-y-0.5 pr-4'>
                          <Label htmlFor='displayDuration' className='text-sm font-medium cursor-pointer'>
                            Display Durations
                          </Label>
                          <p className='text-[11px] text-muted-foreground'>
                            Shows duration values across features, scenarios, and step lists.
                          </p>
                        </div>
                        <Switch
                          id='displayDuration'
                          checked={state.displayDuration}
                          onCheckedChange={(val) => handleUpdate('displayDuration', val)}
                        />
                      </div>

                      {state.displayDuration && (
                        <>
                          <div className='flex items-center justify-between py-3 pl-4 border-l-2 border-emerald-500/40'>
                            <div className='space-y-0.5 pr-4'>
                              <Label htmlFor='humanReadableDuration' className='text-sm font-medium cursor-pointer'>
                                Human-Readable Durations
                              </Label>
                              <p className='text-[11px] text-muted-foreground'>
                                Formats times compactly (e.g., &quot;3h 40m 23s&quot;, &quot;45ms&quot;) instead of
                                fixed &quot;hh:mm:ss.SSS&quot;.
                              </p>
                            </div>
                            <Switch
                              id='humanReadableDuration'
                              checked={state.humanReadableDuration}
                              onCheckedChange={(val) => handleUpdate('humanReadableDuration', val)}
                            />
                          </div>

                          <div className='flex items-center justify-between py-3 pl-4 border-l-2 border-emerald-500/40'>
                            <div className='space-y-0.5 pr-4'>
                              <Label htmlFor='durationInMS' className='text-sm font-medium cursor-pointer'>
                                Durations in Milliseconds
                              </Label>
                              <p className='text-[11px] text-muted-foreground'>
                                Enable if your test runner (e.g., CucumberJS 2/3) outputs milliseconds instead of
                                nanoseconds.
                              </p>
                            </div>
                            <Switch
                              id='durationInMS'
                              checked={state.durationInMS}
                              onCheckedChange={(val) => handleUpdate('durationInMS', val)}
                            />
                          </div>

                          <div className='py-3 pl-4 border-l-2 border-emerald-500/40 space-y-2'>
                            <Label htmlFor='durationAggregation' className='text-sm font-medium'>
                              Feature Duration Aggregation
                            </Label>
                            <Select
                              value={state.durationAggregation}
                              onValueChange={(val: any) => handleUpdate('durationAggregation', val)}
                            >
                              <SelectTrigger id='durationAggregation' className='w-full'>
                                <SelectValue placeholder='Select aggregation' />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value='sum'>Sum of all scenario durations (Default)</SelectItem>
                                <SelectItem value='wallClock'>Wall-clock time (latest end - earliest start)</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className='text-[11px] text-muted-foreground'>
                              Wall-clock reflects real concurrent duration when running scenarios in parallel.
                            </p>
                          </div>
                        </>
                      )}

                      <div className='flex items-center justify-between py-3'>
                        <div className='space-y-0.5 pr-4'>
                          <Label htmlFor='displayReportTime' className='text-sm font-medium cursor-pointer'>
                            Display Report Timestamp
                          </Label>
                          <p className='text-[11px] text-muted-foreground'>
                            Shows the exact execution/generation time in the report header.
                          </p>
                        </div>
                        <Switch
                          id='displayReportTime'
                          checked={state.displayReportTime}
                          onCheckedChange={(val) => handleUpdate('displayReportTime', val)}
                        />
                      </div>

                      <div className='flex items-center justify-between py-3'>
                        <div className='space-y-0.5 pr-4'>
                          <Label htmlFor='displayChartPercentages' className='text-sm font-medium cursor-pointer'>
                            Display Doughnut Chart Percentages
                          </Label>
                          <p className='text-[11px] text-muted-foreground'>
                            Renders percentage labels on chart slices and inside tooltip breakdowns.
                          </p>
                        </div>
                        <Switch
                          id='displayChartPercentages'
                          checked={state.displayChartPercentages}
                          onCheckedChange={(val) => handleUpdate('displayChartPercentages', val)}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* TAB 4: Branding & Styling */}
                  <TabsContent value='branding' className='space-y-6 focus-visible:outline-none'>
                    <div>
                      <h2 className='text-lg font-bold text-foreground flex items-center gap-2'>
                        <Palette className='size-4 text-emerald-500' />
                        Branding & Custom Styling
                      </h2>
                      <p className='text-xs text-muted-foreground mt-1'>
                        Brand your report with custom logos, titles, footers, and styles.
                      </p>
                    </div>

                    <div className='space-y-4'>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                          <Label htmlFor='reportName' className='text-sm font-semibold'>
                            Report Heading Name
                          </Label>
                          <Input
                            id='reportName'
                            value={state.reportName}
                            onChange={(e) => handleUpdate('reportName', e.target.value)}
                            placeholder='e.g. Core App Test Suite'
                          />
                          <p className='text-[11px] text-muted-foreground'>
                            Primary heading text displayed at the top of the report.
                          </p>
                        </div>

                        <div className='space-y-2'>
                          <Label htmlFor='pageTitle' className='text-sm font-semibold'>
                            HTML Browser Page Title
                          </Label>
                          <Input
                            id='pageTitle'
                            value={state.pageTitle}
                            onChange={(e) => handleUpdate('pageTitle', e.target.value)}
                            placeholder='e.g. QA Automation Report'
                          />
                          <p className='text-[11px] text-muted-foreground'>
                            Text displayed inside the browser tab title tag.
                          </p>
                        </div>
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='brandLogo' className='text-sm font-semibold'>
                          Brand Logo Path
                        </Label>
                        <Input
                          id='brandLogo'
                          value={state.brandLogo}
                          onChange={(e) => handleUpdate('brandLogo', e.target.value)}
                          placeholder='./assets/company-logo.png'
                          className='font-mono text-sm'
                        />
                        <p className='text-[11px] text-muted-foreground'>
                          Relative or absolute path to your company/project logo image file.
                        </p>
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='pageFooter' className='text-sm font-semibold'>
                          Custom Page Footer (HTML string)
                        </Label>
                        <Textarea
                          id='pageFooter'
                          value={state.pageFooter}
                          onChange={(e) => handleUpdate('pageFooter', e.target.value)}
                          placeholder='<div className="text-sm font-medium">Internal QA Run - Confidential</div>'
                          rows={2}
                          className='font-mono text-xs'
                        />
                        <p className='text-[11px] text-muted-foreground'>
                          Raw HTML snippet inserted into the footer with Tailwind CSS support.
                        </p>
                      </div>

                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                          <Label htmlFor='customStyle' className='text-sm font-semibold'>
                            Custom CSS Path
                          </Label>
                          <Input
                            id='customStyle'
                            value={state.customStyle}
                            onChange={(e) => handleUpdate('customStyle', e.target.value)}
                            placeholder='./styles/custom-report.css'
                            className='font-mono text-sm'
                          />
                          <p className='text-[11px] text-muted-foreground'>
                            CSS file appended to the default report styling.
                          </p>
                        </div>

                        <div className='space-y-2'>
                          <Label htmlFor='customScript' className='text-sm font-semibold'>
                            Custom JS Script Path
                          </Label>
                          <Input
                            id='customScript'
                            value={state.customScript}
                            onChange={(e) => handleUpdate('customScript', e.target.value)}
                            placeholder='./scripts/report-analytics.js'
                            className='font-mono text-sm'
                          />
                          <p className='text-[11px] text-muted-foreground'>
                            JavaScript file loaded via script tag on every report page.
                          </p>
                        </div>
                      </div>

                      <div className='flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 px-4 py-3'>
                        <div className='space-y-0.5 pr-4'>
                          <Label htmlFor='plainDescription' className='text-sm font-medium cursor-pointer'>
                            Plain HTML Scenario Descriptions
                          </Label>
                          <p className='text-[11px] text-muted-foreground'>
                            Renders scenario description text without escaping formatting tags.
                          </p>
                        </div>
                        <Switch
                          id='plainDescription'
                          checked={state.plainDescription}
                          onCheckedChange={(val) => handleUpdate('plainDescription', val)}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* TAB 5: Attachments */}
                  <TabsContent value='attachments' className='space-y-6 focus-visible:outline-none'>
                    <div>
                      <h2 className='text-lg font-bold text-foreground flex items-center gap-2'>
                        <LayoutTemplate className='size-4 text-emerald-500' />
                        Attachment Presentation
                      </h2>
                      <p className='text-xs text-muted-foreground mt-1'>
                        Choose between classic inline step views or rich interactive modal dialogues.
                      </p>
                    </div>

                    <div className='space-y-4'>
                      <div className='space-y-2'>
                        <Label htmlFor='attachmentLayout' className='text-sm font-semibold'>
                          Attachment Display Mode
                        </Label>
                        <Select
                          value={state.attachmentLayout}
                          onValueChange={(val: any) => handleUpdate('attachmentLayout', val)}
                        >
                          <SelectTrigger id='attachmentLayout' className='w-full'>
                            <SelectValue placeholder='Select layout' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='modal'>Modal Popup (Modern, clean, floating window)</SelectItem>
                            <SelectItem value='inline'>Inline (Classic pre-v4 style accordion links)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {state.attachmentLayout === 'modal' && (
                        <div className='divide-y divide-border/40 rounded-xl border border-border/60 bg-muted/20 px-4 py-2 mt-4'>
                          <div className='flex items-center justify-between py-3'>
                            <div className='space-y-0.5 pr-4'>
                              <Label htmlFor='modalBackdrop' className='text-sm font-medium cursor-pointer'>
                                Modal Dark Backdrop
                              </Label>
                              <p className='text-[11px] text-muted-foreground'>
                                Dim background overlay that closes the modal on click-outside.
                              </p>
                            </div>
                            <Switch
                              id='modalBackdrop'
                              checked={state.modalBackdrop}
                              onCheckedChange={(val) => handleUpdate('modalBackdrop', val)}
                            />
                          </div>

                          <div className='flex items-center justify-between py-3'>
                            <div className='space-y-0.5 pr-4'>
                              <Label htmlFor='modalDraggable' className='text-sm font-medium cursor-pointer'>
                                Draggable Window
                              </Label>
                              <p className='text-[11px] text-muted-foreground'>
                                Allow dragging the attachment popup around the screen.
                              </p>
                            </div>
                            <Switch
                              id='modalDraggable'
                              checked={state.modalDraggable}
                              onCheckedChange={(val) => handleUpdate('modalDraggable', val)}
                            />
                          </div>

                          <div className='flex items-center justify-between py-3'>
                            <div className='space-y-0.5 pr-4'>
                              <Label htmlFor='modalResizable' className='text-sm font-medium cursor-pointer'>
                                Resizable Window
                              </Label>
                              <p className='text-[11px] text-muted-foreground'>
                                Allow dragging edges or corners to resize screenshot previews.
                              </p>
                            </div>
                            <Switch
                              id='modalResizable'
                              checked={state.modalResizable}
                              onCheckedChange={(val) => handleUpdate('modalResizable', val)}
                            />
                          </div>

                          <div className='flex items-center justify-between py-3'>
                            <div className='space-y-0.5 pr-4'>
                              <Label htmlFor='modalShowContext' className='text-sm font-medium cursor-pointer'>
                                Show Step Text as Caption
                              </Label>
                              <p className='text-[11px] text-muted-foreground'>
                                Displays the associated step or scenario caption directly inside modal header.
                              </p>
                            </div>
                            <Switch
                              id='modalShowContext'
                              checked={state.modalShowContext}
                              onCheckedChange={(val) => handleUpdate('modalShowContext', val)}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* TAB 6: Metadata */}
                  <TabsContent value='metadata' className='space-y-6 focus-visible:outline-none'>
                    <div>
                      <h2 className='text-lg font-bold text-foreground flex items-center gap-2'>
                        <Monitor className='size-4 text-emerald-500' />
                        Execution Metadata
                      </h2>
                      <p className='text-xs text-muted-foreground mt-1'>
                        Specify browser, OS platform, and device details for the test execution.
                      </p>
                    </div>

                    <div className='space-y-4'>
                      <div className='space-y-2'>
                        <Label htmlFor='metadataMode' className='text-sm font-semibold'>
                          Metadata Source
                        </Label>
                        <Select
                          value={state.metadataMode}
                          onValueChange={(val: any) => handleUpdate('metadataMode', val)}
                        >
                          <SelectTrigger id='metadataMode' className='w-full'>
                            <SelectValue placeholder='Select metadata mode' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='none'>None (or detected automatically)</SelectItem>
                            <SelectItem value='inline'>Inline Metadata Object</SelectItem>
                            <SelectItem value='file'>External Metadata JSON File</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {state.metadataMode === 'file' && (
                        <div className='space-y-2 p-4 rounded-xl border border-border/60 bg-muted/20'>
                          <Label htmlFor='metadataFilePath' className='text-sm font-semibold'>
                            Metadata JSON File Path
                          </Label>
                          <Input
                            id='metadataFilePath'
                            value={state.metadataFilePath}
                            onChange={(e) => handleUpdate('metadataFilePath', e.target.value)}
                            placeholder='./metadata/run-info.json'
                            className='font-mono text-sm'
                          />
                          <p className='text-[11px] text-muted-foreground'>
                            The metadata in this file takes precedence over inline metadata.
                          </p>
                        </div>
                      )}

                      {state.metadataMode === 'inline' && (
                        <div className='space-y-4 p-4 rounded-xl border border-border/60 bg-muted/20'>
                          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                            <div className='space-y-1.5'>
                              <Label htmlFor='browserName' className='text-xs font-semibold'>
                                Browser Name
                              </Label>
                              <Input
                                id='browserName'
                                value={state.browserName}
                                onChange={(e) => handleUpdate('browserName', e.target.value)}
                                placeholder='chrome / firefox / safari'
                              />
                            </div>
                            <div className='space-y-1.5'>
                              <Label htmlFor='browserVersion' className='text-xs font-semibold'>
                                Browser Version
                              </Label>
                              <Input
                                id='browserVersion'
                                value={state.browserVersion}
                                onChange={(e) => handleUpdate('browserVersion', e.target.value)}
                                placeholder='128.0'
                              />
                            </div>
                          </div>

                          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                            <div className='space-y-1.5'>
                              <Label htmlFor='platformName' className='text-xs font-semibold'>
                                Platform / OS Name
                              </Label>
                              <Input
                                id='platformName'
                                value={state.platformName}
                                onChange={(e) => handleUpdate('platformName', e.target.value)}
                                placeholder='osx / windows / ubuntu / ios'
                              />
                            </div>
                            <div className='space-y-1.5'>
                              <Label htmlFor='platformVersion' className='text-xs font-semibold'>
                                Platform Version
                              </Label>
                              <Input
                                id='platformVersion'
                                value={state.platformVersion}
                                onChange={(e) => handleUpdate('platformVersion', e.target.value)}
                                placeholder='Sonoma 14.5'
                              />
                            </div>
                          </div>

                          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                            <div className='space-y-1.5'>
                              <Label htmlFor='deviceName' className='text-xs font-semibold'>
                                Device Name
                              </Label>
                              <Input
                                id='deviceName'
                                value={state.deviceName}
                                onChange={(e) => handleUpdate('deviceName', e.target.value)}
                                placeholder='MacBook Pro / iPhone 15'
                              />
                            </div>
                            <div className='space-y-1.5'>
                              <Label htmlFor='executionPlatform' className='text-xs font-semibold'>
                                Cloud / Execution Platform
                              </Label>
                              <Select
                                value={state.executionPlatform || 'local'}
                                onValueChange={(val: any) =>
                                  handleUpdate('executionPlatform', val === 'local' ? '' : val)
                                }
                              >
                                <SelectTrigger id='executionPlatform' className='w-full'>
                                  <SelectValue placeholder='Select platform' />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value='local'>Local Machine</SelectItem>
                                  <SelectItem value='browserstack'>BrowserStack</SelectItem>
                                  <SelectItem value='testmu'>TestMu AI</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* TAB 7: Custom Data */}
                  <TabsContent value='customData' className='space-y-6 focus-visible:outline-none'>
                    <div>
                      <h2 className='text-lg font-bold text-foreground flex items-center gap-2'>
                        <FileText className='size-4 text-emerald-500' />
                        Custom Run Data
                      </h2>
                      <p className='text-xs text-muted-foreground mt-1'>
                        Inject project name, release cycle, environment info, or custom key-value pairs into the run
                        card.
                      </p>
                    </div>

                    <div className='space-y-4'>
                      <div className='flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 px-4 py-3'>
                        <div className='space-y-0.5 pr-4'>
                          <Label htmlFor='enableCustomData' className='text-sm font-medium cursor-pointer'>
                            Enable Custom Run Data Card
                          </Label>
                          <p className='text-[11px] text-muted-foreground'>
                            Renders a dedicated Run Information summary card on the report overview.
                          </p>
                        </div>
                        <Switch
                          id='enableCustomData'
                          checked={state.enableCustomData}
                          onCheckedChange={(val) => handleUpdate('enableCustomData', val)}
                        />
                      </div>

                      {state.enableCustomData && (
                        <div className='space-y-4 p-4 rounded-xl border border-border/60 bg-muted/20'>
                          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                            <div className='space-y-1.5'>
                              <Label htmlFor='projectName' className='text-xs font-semibold'>
                                Project Name
                              </Label>
                              <Input
                                id='projectName'
                                value={state.projectName}
                                onChange={(e) => handleUpdate('projectName', e.target.value)}
                                placeholder='My Application E2E'
                              />
                            </div>
                            <div className='space-y-1.5'>
                              <Label htmlFor='release' className='text-xs font-semibold'>
                                Release / Version
                              </Label>
                              <Input
                                id='release'
                                value={state.release}
                                onChange={(e) => handleUpdate('release', e.target.value)}
                                placeholder='v2.4.0'
                              />
                            </div>
                          </div>

                          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                            <div className='space-y-1.5'>
                              <Label htmlFor='environment' className='text-xs font-semibold'>
                                Environment
                              </Label>
                              <Input
                                id='environment'
                                value={state.environment}
                                onChange={(e) => handleUpdate('environment', e.target.value)}
                                placeholder='Staging / QA'
                              />
                            </div>
                            <div className='space-y-1.5'>
                              <Label htmlFor='testCycle' className='text-xs font-semibold'>
                                Test Cycle
                              </Label>
                              <Input
                                id='testCycle'
                                value={state.testCycle}
                                onChange={(e) => handleUpdate('testCycle', e.target.value)}
                                placeholder='Nightly Regression'
                              />
                            </div>
                          </div>

                          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                            <div className='space-y-1.5'>
                              <Label htmlFor='buildNumber' className='text-xs font-semibold'>
                                CI Build Number
                              </Label>
                              <Input
                                id='buildNumber'
                                value={state.buildNumber}
                                onChange={(e) => handleUpdate('buildNumber', e.target.value)}
                                placeholder='CI-#1452'
                              />
                            </div>
                            <div className='space-y-1.5'>
                              <Label htmlFor='ciPipeline' className='text-xs font-semibold'>
                                CI Pipeline
                              </Label>
                              <Input
                                id='ciPipeline'
                                value={state.ciPipeline}
                                onChange={(e) => handleUpdate('ciPipeline', e.target.value)}
                                placeholder='GitHub Actions'
                              />
                            </div>
                          </div>

                          {/* Dynamic Extra Custom Fields */}
                          <div className='pt-3 border-t border-border/40 space-y-3'>
                            <div className='flex items-center justify-between'>
                              <span className='text-xs font-bold text-foreground'>Additional Key-Value Pairs</span>
                              <Button
                                type='button'
                                variant='outline'
                                size='xs'
                                onClick={addCustomDataField}
                                className='gap-1 text-xs'
                              >
                                <Plus className='size-3' />
                                Add Field
                              </Button>
                            </div>

                            {state.extraCustomData.map((item, idx) => (
                              <div key={item.id} className='flex items-center gap-2'>
                                <Input
                                  aria-label={`Field ${idx + 1} Key`}
                                  placeholder='Key (e.g. Cluster)'
                                  value={item.key}
                                  onChange={(e) => updateCustomDataField(item.id, 'key', e.target.value)}
                                  className='text-xs h-8'
                                />
                                <Input
                                  aria-label={`Field ${idx + 1} Value`}
                                  placeholder='Value (e.g. us-east-1)'
                                  value={item.value}
                                  onChange={(e) => updateCustomDataField(item.id, 'value', e.target.value)}
                                  className='text-xs h-8'
                                />
                                <Button
                                  type='button'
                                  variant='ghost'
                                  size='icon-xs'
                                  onClick={() => removeCustomDataField(item.id)}
                                  className='text-rose-500 hover:text-rose-600 hover:bg-rose-500/10'
                                  title='Remove field'
                                >
                                  <Trash2 className='size-3.5' />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Right Column: Real-Time Preview & Format Selector (5 cols) */}
            <div className='lg:col-span-5 space-y-4 lg:sticky lg:top-24'>
              <div className='rounded-2xl border border-border/60 bg-card shadow-lg overflow-hidden'>
                {/* Format selection header */}
                <div className='p-4 border-b border-border/40 bg-muted/40 space-y-3'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <Code2 className='size-4 text-emerald-500' />
                      <span className='text-sm font-bold text-foreground'>Generated Config</span>
                    </div>
                    <Badge variant='secondary' className='text-[10px] font-mono'>
                      {optionCount} {optionCount === 1 ? 'option' : 'options'}
                    </Badge>
                  </div>

                  {/* Format Pills */}
                  <div className='grid grid-cols-3 sm:grid-cols-5 gap-1.5 pt-1'>
                    {FORMAT_CONFIGS.map((item) => (
                      <button
                        key={item.format}
                        type='button'
                        onClick={() => setSelectedFormat(item.format)}
                        className={`px-2 py-1.5 rounded-lg text-xs font-medium text-center transition-all cursor-pointer ${
                          selectedFormat === item.format
                            ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                            : 'bg-muted/80 text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        {item.format.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* File info bar */}
                <div className='px-4 py-2 bg-muted/20 border-b border-border/40 flex items-center justify-between text-xs text-muted-foreground'>
                  <div className='flex items-center gap-1.5 font-mono text-[11px] truncate'>
                    <FileCode className='size-3.5 text-emerald-500 shrink-0' />
                    <span className='truncate'>{formatted.fileName}</span>
                  </div>
                  <span className='shrink-0 text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400'>
                    Ready
                  </span>
                </div>

                {/* Code display block */}
                <div className='relative group'>
                  <pre className='p-4 text-xs font-mono bg-slate-950 text-slate-100 dark:bg-black/80 dark:text-slate-100 overflow-x-auto max-h-115 leading-relaxed selection:bg-emerald-500/30'>
                    <code>{formatted.content}</code>
                  </pre>
                </div>

                {/* Footer Copy / Download Actions */}
                <div className='p-3 sm:p-4 bg-muted/30 border-t border-border/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-2.5'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleCopy}
                    className='w-full sm:flex-1 gap-1.5 font-medium justify-center'
                  >
                    {copied ? (
                      <>
                        <Check className='size-3.5 text-emerald-500' />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className='size-3.5' />
                        <span>Copy Content</span>
                      </>
                    )}
                  </Button>
                  <Button
                    variant='default'
                    size='sm'
                    onClick={handleDownload}
                    className='w-full sm:flex-1 gap-1.5 font-medium bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs justify-center'
                  >
                    <Download className='size-3.5' />
                    <span>Download</span>
                  </Button>
                </div>
              </div>

              {/* Instructions Callout Card */}
              <div className='rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs space-y-2'>
                <div className='flex items-center gap-2 font-semibold text-emerald-600 dark:text-emerald-400'>
                  <Terminal className='size-4' />
                  <span>How to use this config file</span>
                </div>
                <p className='text-muted-foreground leading-relaxed'>
                  Place <code className='font-mono font-bold text-foreground'>{formatted.fileName}</code> in your
                  repository root directory. The CLI will automatically discover and load it when you execute:
                </p>
                <div className='bg-background/80 dark:bg-black/60 rounded-lg p-2 font-mono text-[11px] border border-border/40 flex items-center justify-between'>
                  <code>npx mchr</code>
                  <span className='text-[10px] text-muted-foreground'>single-command report</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
