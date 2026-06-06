# UI/UX Blueprint — VJIT IT Academic Hub AI

---

## Design Philosophy

| Principle | Implementation |
|---|---|
| **Apple-level simplicity** | One primary action per screen, no cognitive overload |
| **Notion-level productivity** | Keyboard-friendly, dense information, fast navigation |
| **Linear-level performance** | Page transitions < 250ms, skeleton loaders, optimistic UI |
| **Academic aesthetics** | Clean whites, purposeful color, data-forward typography |
| **Mobile-first** | All layouts work on 320px minimum width |
| **Accessible** | WCAG 2.1 AA: contrast ratios, keyboard nav, ARIA labels |

---

## Color System

### Light Mode
```
Background:     #FFFFFF (surface), #F8FAFC (muted)
Text primary:   #111827
Text secondary: #6B7280
Border:         #E5E7EB
Brand primary:  #6366F1 (Indigo)
Brand hover:    #4F46E5
Accent:         #F59E0B (Amber)
Success:        #10B981 (Emerald)
Error:          #EF4444 (Red)
Warning:        #F59E0B (Amber)
```

### Dark Mode
```
Background:     #09090B (surface), #18181B (muted)
Text primary:   #F9FAFB
Text secondary: #9CA3AF
Border:         #27272A
Brand primary:  #818CF8 (lighter for dark bg)
```

---

## Typography Scale

```
Font: Inter (Google Fonts)
Code: JetBrains Mono

Display:    48–72px / 700 weight / -0.04em tracking
H1:         36–48px / 700 weight / -0.03em
H2:         28–36px / 600 weight / -0.02em
H3:         22–28px / 600 weight / -0.01em
Body:       16px / 400 weight / 1.6 line-height
Small:      14px / 400 weight
XSmall:     12px / 500 weight (labels, badges)
```

---

## Component Design Tokens

### Buttons
```
Primary:   bg-brand-500 text-white  hover:bg-brand-600
Secondary: bg-gray-100  text-gray-700 hover:bg-gray-200
Ghost:     transparent  text-gray-600 hover:bg-gray-100
Danger:    bg-red-500   text-white  hover:bg-red-600

Sizes: sm(px-3 py-1.5 text-xs) | md(px-4 py-2 text-sm) | lg(px-6 py-3 text-base)
Border radius: 8px (rounded-lg)
Transition: 200ms all
```

### Cards
```
Default:  bg-white dark:bg-zinc-900 rounded-xl border shadow-card
Glass:    backdrop-blur-xl bg-white/70 rounded-xl border border-white/20
Padding:  24px (p-6)
```

### Form Inputs
```
Height:       40px
Border:       1px border-gray-200 rounded-lg
Focus:        ring-2 ring-brand-500
Background:   white dark:zinc-900
Placeholder:  gray-400
Error state:  border-red-500 + error text below
```

---

## Panel Layouts

### Student Panel Sidebar Navigation
```
┌──────────────────────────┐
│ [Logo] VJIT IT Hub       │  ← 64px header
│         Student Portal   │
├──────────────────────────┤
│                          │
│ ◉ Dashboard              │  ← Active: brand-50 bg
│   Assignments            │
│   Observations           │
│   Notebook               │
│   Academic Vault         │  ← 40px per item
│   Portfolio              │
│   Certificates           │
│   Timetable              │
│   Calendar               │
│                          │
├──────────────────────────┤
│ [Avatar] Rahul Kumar     │  ← User profile
│ 21BD1A05G1               │
│ [🌙] [→ Logout]          │
└──────────────────────────┘
Width: 256px
Collapsible: 64px icon-only mode
```

### Student Dashboard Layout
```
┌────────────────────────────────────────────────────────┐
│ Good Morning, Rahul 👋                                 │
│ Here's your academic overview for today.               │
├─────────────┬─────────────┬─────────────┬─────────────┤
│  ⏳ Pending │  ✓ Submitted│  ★ Graded  │  ⚠ Overdue  │
│     3       │     12      │     8      │      1      │
│ Assignments │ Assignments │ Assignments│ Assignments │
├─────────────────────────────────┬──────────────────────┤
│ Recent Assignments              │ My Subjects          │
│                                 │                      │
│ ◉ Data Structures Lab  [Pending]│ ■ CS401 DSA          │
│   Due Jun 10, 2026              │ ■ CS402 DBMS         │
│                                 │ ■ CS403 OS           │
│ ◉ DBMS Assignment 2  [Graded]  │ ■ CS404 CN           │
│   Due Jun 5, 2026               │ ■ CS405 DAA          │
│                                 │                      │
│ View all →                      │                      │
└─────────────────────────────────┴──────────────────────┘
```

### Faculty Evaluation Workspace
```
┌─────────────────────────────────────────────────────────────┐
│ Evaluation: Data Structures Assignment 1               ×   │
├──────────────────────┬──────────────────────────────────────┤
│  Student Submission  │  Evaluation Panel                    │
│  ────────────────    │  ─────────────────────               │
│                      │  Student: Rahul Kumar (21BD1A05G1)  │
│  [PDF Viewer]        │  Topic: Binary Trees                 │
│                      │  Submitted: Jun 5, 2026             │
│  ↕ Scroll PDF        │                                      │
│                      │  AI Analysis:                        │
│                      │  Originality: ████████░░ 82%        │
│                      │  Understanding: ███████░░░ 75%      │
│                      │  AI Probability: █░░░░░░░░░ 8%      │
│                      │                                      │
│                      │  Rubric Scoring:                     │
│                      │  Content Accuracy  [ 8 / 10 ]       │
│                      │  Explanation       [ 7 / 10 ]       │
│                      │  Code Quality      [ 9 / 10 ]       │
│                      │                                      │
│                      │  Total: [ 24 / 30 ]                 │
│                      │                                      │
│                      │  Feedback: ___________________       │
│                      │                                      │
│                      │  [Save Evaluation] [Reject]          │
└──────────────────────┴──────────────────────────────────────┘
```

### HOD Department Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│  IT Department — Academic Overview               June 2026  │
├──────────┬──────────┬──────────┬──────────┬────────────────┤
│ 1,240    │  32      │  89%     │  95%     │  4.2 / 5.0    │
│ Students │ Faculty  │Sub Rate  │Attendance│  Avg GPA       │
├──────────┴──────────┴──────────┴──────────┴────────────────┤
│  Submission Rates by Subject        │ Faculty Activity      │
│  ─────────────────────────          │ ───────────────────── │
│  [Bar Chart]                        │ Dr. Kumar     Active  │
│   DSA  ████████████ 94%            │ Mr. Reddy     Active  │
│   DBMS ██████████░░ 82%            │ Ms. Priya     3d ago  │
│   OS   ████████░░░░ 71%            │                       │
│   CN   ██████████░░ 85%            │ View All →            │
├─────────────────────────────────────┴───────────────────────┤
│  Recent Notices                  │ Quick Actions             │
│  ─────────────────              │ ─────────────────         │
│  • Semester End Exam Schedule   │ [Publish Notice]          │
│  • Lab Record Submission Ext.   │ [Download Report]         │
│  • Guest Lecture Announced      │ [View Full Analytics]     │
└─────────────────────────────────┴───────────────────────────┘
```

---

## Animation Guidelines

| Element | Animation | Duration | Easing |
|---|---|---|---|
| Page transition | Fade + slide up 8px | 250ms | easeOut |
| Modal open | Scale 0.95→1 + fade | 200ms | spring |
| Dropdown | Scale + fade | 150ms | easeOut |
| Sidebar collapse | Width transition | 300ms | easeInOut |
| Progress bars | Width 0→value | 1000ms | easeOut |
| Stats count-up | Number interpolation | 1500ms | easeOut |
| Hover states | All: 200ms transitions | - | - |
| Skeleton shimmer | Infinite pulse | 1500ms | linear |

---

## Responsive Breakpoints

```
xs:  < 480px   (Phone — vertical)
sm:  480–768px  (Phone — landscape, small tablet)
md:  768–1024px (Tablet)
lg:  1024–1280px (Laptop)
xl:  1280–1536px (Desktop)
2xl: > 1536px   (Wide screen)
```

Key responsive behaviors:
- Sidebar collapses to drawer on < 1024px
- Dashboard stats: 2-col on mobile, 4-col on desktop
- Tables: horizontal scroll on mobile
- Evaluation workspace: stacked on mobile, split on desktop

---

## Dark Mode Strategy

- OS preference respected by default
- User can toggle manually (persisted in localStorage)
- Implementation: `class="dark"` on `<html>` via Tailwind
- All components use `dark:` variants
- Charts: dark-mode color palettes
- Images: no dark mode needed (CDN assets)

---

## Accessibility Requirements

- Color contrast ratio: ≥ 4.5:1 (AA)
- All interactive elements keyboard focusable
- Focus ring visible on all buttons/inputs
- Screen reader labels on icon-only buttons
- Error messages announced via ARIA live regions
- Form labels always visible (not placeholder-only)
- Skip-to-main navigation link
