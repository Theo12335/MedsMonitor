# Admin & Caregiver Dashboard Redesign — Design Spec

**Date:** 2026-04-24
**Scope:** `src/app/dashboard/admin/page.tsx` and `src/app/dashboard/caregiver/page.tsx`
**Non-goals:** Sub-pages (patients, staff, medications, etc.), the `DashboardLayout` shell, the patient dashboard, CSS design tokens in `globals.css`.

## Problem

The current admin and caregiver dashboards have layout issues that make content feel unpolished:

- Sparklines inside stat cards overflow without sized containers — they "spill" past the card edge on narrow breakpoints.
- Inconsistent card header heights (some cards use `glass-card-header`, others inline headers) produce uneven rows.
- Stat cards pretend to be chart cards (sparkline top-right) but the chart is an afterthought — neither a clean stat nor a proper visualization.
- No real chart panels, so admins have no way to see trends at a glance.
- The caregiver queue and the admin quick-actions sit at the same visual weight, despite being very different tasks.

## Design Principles

- **Role-tailored layouts.** Admin is analytics-first (charts, trends, system-wide metrics). Caregiver is action-first (queue, drawers, big dispense buttons).
- **No magenta/hot-pink.** Keep the healthcare feel. Use the existing palette — blue, cyan, violet, emerald, amber, rose (for alerts only).
- **Fixed-height chart canvases.** Every chart lives in a container with explicit `aspect-ratio` or `height` so SVGs cannot overflow.
- **Uniform panel shell.** A single `Panel` component with a consistent header, padding, and border. All non-hero cards use it.
- **Hero cards for top-level KPIs only.** Gradient hero cards are reserved for 1–2 headline metrics per dashboard. Everything else is a flat `Panel` or compact `StatTile`.
- **Drop the decorative background.** The `.animated-bg` / particles layer currently bleeds under content; we'll keep the layout layer but tone down visual noise so cards read as the primary surface. *(No code change required in this spec — out of scope. Flagged for future work.)*

## Shared Components (new)

All three live in `src/components/dashboard/` as small, focused files.

### `Panel.tsx`
Consistent card shell with a slotted header.

Props:
- `title: string`
- `action?: ReactNode` (badge, link, or small control on the right of the header)
- `className?: string`
- `children: ReactNode`

Renders:
```
<div class="glass-card {className}">
  <div class="glass-card-header"> title {action} </div>
  <div class="p-5"> children </div>
</div>
```

### `HeroCard.tsx`
Gradient hero stat card for headline KPIs.

Props:
- `label: string`
- `value: string | number`
- `unit?: string`
- `trend?: string` (e.g. "Last 7 days")
- `gradient: "blue-cyan" | "violet-indigo" | "teal-emerald" | "blue-violet"`

Renders a fixed-height (`min-h-[120px]`) card with `background: linear-gradient(135deg, …)`, label top, value bottom-left.

### `StatTile.tsx`
Compact stat card (replaces the current stat-card-with-sparkline pattern).

Props:
- `label: string`
- `value: string | number`
- `icon: ReactNode`
- `accent: "blue" | "cyan" | "emerald" | "violet" | "amber" | "rose"`
- `delta?: { value: string; direction: "up" | "down" | "neutral" }` (small pill top-right)

No sparklines. If a metric needs a trend visual, it belongs in a chart panel, not a stat tile.

### `charts/LineChart.tsx`
Sized SVG line chart for time-series.

Props:
- `series: { label: string; data: number[]; color: string; dashed?: boolean }[]`
- `xLabels: string[]`
- `height?: number` (default 200)
- `ariaLabel: string`

Container: `<div class="w-full" style={{ height }}>`. SVG uses `viewBox` + `preserveAspectRatio="none"` on paths but `meet` on the outer SVG so gridlines stay crisp. First series gets an area fill gradient.

### `charts/DonutChart.tsx`
Three-segment donut for status breakdowns.

Props:
- `segments: { label: string; value: number; color: string }[]`
- `centerValue?: string` (e.g. "68%")
- `centerLabel?: string`
- `size?: number` (default 120)

### `charts/BarChart.tsx`
Vertical bars for day-of-week counts.

Props:
- `data: { label: string; value: number }[]`
- `height?: number` (default 140)
- `gradient?: [string, string]` (default cyan → blue)

All three chart components are pure SVG, no third-party dependency. Each renders inside a sized wrapper so nothing overflows.

## Admin Dashboard

`src/app/dashboard/admin/page.tsx`

### Layout (desktop, lg breakpoint)

```
Row 1 — Welcome header (full width, unchanged)

Row 2 — Hero + Stats
┌──────────────────┬──────────────────┬────────┬────────┐
│ HeroCard         │ HeroCard         │ Stat   │ Stat   │
│ Adherence rate   │ On-time rate     │ Tile   │ Tile   │
│ blue→cyan        │ violet→indigo    │Patients│ Alerts │
└──────────────────┴──────────────────┴────────┴────────┘
grid-cols-[1.4fr_1.4fr_1fr_1fr]

Row 3 — Trend chart + donut
┌────────────────────────────────────┬────────────────┐
│ Dispenses vs Missed (7 days)       │ Today's Status │
│ LineChart                          │ DonutChart     │
└────────────────────────────────────┴────────────────┘
grid-cols-3, first panel spans 2

Row 4 — Quick Actions
┌──────────────────────────────────────────────────────┐
│ Quick Actions (4 tiles: patients, staff, meds, rpt)  │
└──────────────────────────────────────────────────────┘

Row 5 — Bar + Activity + System
┌──────────────┬──────────────┬───────────────────────┐
│ Doses by Day │ Recent       │ System Status         │
│ BarChart     │ Activity     │ (4 services)          │
└──────────────┴──────────────┴───────────────────────┘
grid-cols-3
```

### Mobile

- Row 2: stacks to `grid-cols-2` (hero cards full-width, then stat tiles).
- Row 3: donut stacks below line chart.
- Row 4: quick-action tiles → `grid-cols-2`.
- Row 5: stacks vertically.

### Data

- `HeroCard.adherenceRate` — `taken / (taken + missed)` over last 7 days from `medication_logs`, where `missed = status='pending' AND scheduled_time < now() - interval '1 day'`. Expressed as a percentage.
- `HeroCard.onTimeRate` — percentage of taken logs in last 7 days where `|actual_time - scheduled_time| <= 10 minutes`. Replaces the earlier "avg dispense time" — clearer and less ambiguous about what "dispense time" means.
- `StatTile.patients` — existing `patientCount` query, with `delta` = week-over-week change.
- `StatTile.lowStockAlerts` — existing `lowStockCount` query.
- `LineChart` — daily `dispensed` and `missed` counts, last 7 days, grouped from `medication_logs`.
- `DonutChart` — today's `dispensed` / `pending` / `missed` counts (missed = scheduled_time < now AND status = pending).
- `BarChart` — dispensed-count per day for the last 7 calendar days, x-axis labeled with day name (Mon, Tue, …).
- `Recent Activity` — existing query, unchanged.
- `System Status` — existing hardcoded services list, unchanged.

All new queries go in a new `useAdminDashboardData()` hook in `src/lib/supabase/hooks.ts` so the page component stays readable.

### Removed from current admin page

- Sparkline in the Patients stat card (data was faked anyway).
- Circular progress "Today's Progress" card (replaced by donut in row 3).
- The progress-bar pair below the circle (data is in the donut legend now).

## Caregiver Dashboard

`src/app/dashboard/caregiver/page.tsx`

### Layout (desktop)

```
Row 1 — Welcome header with clock-in (unchanged)

Row 2 — Hero + Stats
┌──────────────────┬────────┬────────┬────────┐
│ HeroCard         │ Stat   │ Stat   │ Stat   │
│ Completion today │Pending │Patients│Alerts  │
│ teal→emerald     │        │        │        │
└──────────────────┴────────┴────────┴────────┘
grid-cols-[1.6fr_1fr_1fr_1fr]

Row 3 — Queue (primary action) + focused chart
┌──────────────────────────────────────┬────────────────┐
│ Medication Queue                     │ My Day         │
│ (existing list, unchanged behavior)  │ DonutChart     │
│                                      │ completed/     │
│                                      │ remaining/     │
│                                      │ overdue        │
└──────────────────────────────────────┴────────────────┘
grid-cols-3, queue spans 2

Row 4 — Storage + Activity
┌──────────────────────────────────────┬────────────────┐
│ Storage Unit Status                  │ Recent         │
│ (existing drawer grid, unchanged)    │ Activity       │
└──────────────────────────────────────┴────────────────┘
grid-cols-3, storage spans 2
```

### Why different from admin

Caregiver has **one hero card** (completion) and **one chart** (the donut). Everything else is action-oriented. The medication queue sits in the most prominent position in row 3 because that's the caregiver's actual job. No line chart, no bar chart — trend analysis is not their job.

### Data

- `HeroCard.completion` — `dispensedToday / (dispensedToday + pendingMedications)` as percentage. `value` = percentage, `trend` = `"{dispensed} of {total} doses"`.
- `StatTile.pending` / `patients` / `alerts` — use existing `stats` from `useDashboardStats()`.
- `DonutChart.myDay` — today's completed / remaining / overdue. Overdue = pending with `scheduled_time < now`.

### Removed from current caregiver page

- Circular progress + dual progress bars (replaced by hero card + donut).
- Sparklines (none used currently, but confirming they won't be added).

## Dispense Queue Behavior

**Unchanged.** The `dispenseMedication()` handler, 30-second refetch interval, and priority badging logic stay exactly as-is. This spec is a visual redesign, not a behavior change.

## Loading States

Skeleton rows mirror the new layout (hero card + stat tiles row, then chart row, then bottom row). Existing `skeleton-shimmer` class is reused.

## Error Handling

Existing pattern is preserved: Supabase queries use `Promise.all`, errors are caught silently, stats default to 0. Chart components render an empty state (`"No data yet"` in muted text) when `data.length === 0`, sized to the container so the row height doesn't collapse.

## Testing

Manual only for this project. Verification = dev server runs, both dashboards render without overflow, charts respond to window resize.

## Files Changed

- **New:**
  - `src/components/dashboard/Panel.tsx`
  - `src/components/dashboard/HeroCard.tsx`
  - `src/components/dashboard/StatTile.tsx`
  - `src/components/dashboard/charts/LineChart.tsx`
  - `src/components/dashboard/charts/DonutChart.tsx`
  - `src/components/dashboard/charts/BarChart.tsx`
- **Modified:**
  - `src/app/dashboard/admin/page.tsx` — full rewrite using new components
  - `src/app/dashboard/caregiver/page.tsx` — full rewrite using new components
  - `src/lib/supabase/hooks.ts` — add `useAdminDashboardData()` with the new trend queries
