# UI Design Rules

## 1. Visual Style

Use the Soft UI Evolution design direction.

The UI should feel:

- Soft
- Clean
- Modern
- Lightweight
- Professional
- Calm
- Accessible

Avoid making the UI look like a generic Bootstrap dashboard.

## 2. Primary Color

The project primary color is:

```css
#3BE6A6
```

Use it for:

- Primary buttons
- Active navigation indicator
- Focus rings
- Success status
- Important highlights

## 3. Color Tokens

```css
:root {
  --color-primary: #3BE6A6;
  --color-bg: #F7FAF9;
  --color-surface: #FFFFFF;
  --color-text-primary: #1F2933;
  --color-text-secondary: #64748B;
  --color-border: #E5E7EB;
  --color-error: #EF4444;
  --color-warning: #F59E0B;
  --color-success: #3BE6A6;

  --radius-sm: 8px;
  --radius-md: 10px;
  --radius-lg: 12px;
  --radius-xl: 16px;

  --shadow-soft: 0 2px 12px rgba(0, 0, 0, 0.06);
  --transition-fast: 200ms ease-out;
  --transition-base: 300ms ease-out;
}
```

## 4. Typography

Use system font stack or Inter.

Rules:

- Hero/Heading: 700 weight
- Section title: 600-700 weight
- Body: 16px, line-height 1.6
- Caption/Label: 14px, 500 weight
- Avoid tiny text below 12px

## 5. Layout

- Max container width: 1280px
- Side padding: 24px desktop, 16px mobile
- Use CSS Grid as primary layout
- Collapse columns below 768px
- No horizontal overflow

## 6. Components

### Buttons

Primary button:

- Background: #3BE6A6
- Text: #10231C or dark charcoal
- Border radius: 10px
- Font weight: 600
- Hover: slight lift and stronger shadow
- Active: slight press effect
- Cursor pointer required

Secondary button:

- Background: white
- Border: 1px solid #E5E7EB
- Text: #1F2933
- Hover: light green-tinted background

### Cards

- Background: white
- Border: 1px solid #E5E7EB
- Border radius: 8px where possible, or 12px only when matching existing components
- Shadow: 0 2px 12px rgba(0,0,0,0.06)
- Padding: 20px to 24px

### Inputs

Each input must have:

- Label
- Placeholder
- Helper text when useful
- Error message when invalid
- Focus ring

Focus style:

```css
outline: 2px solid #3BE6A6;
outline-offset: 2px;
```

### Tables

Tables should include:

- Sticky or visible header
- Search input
- Filters
- Pagination
- Empty state
- Skeleton loading
- Responsive horizontal wrapper on mobile

### Status Badges

Use badges for scrape jobs:

- pending: gray
- running: green/blue tinted
- success: #3BE6A6
- failed: red

## 7. Skeleton Loading

Use shimmer skeletons, not circular spinners.

Apply skeletons to:

- Dashboard cards
- Review table
- Product list
- Scrape job status

## 8. Motion

Animation rules:

- Duration: 200-300ms for interactions
- Entry animation: fade + translateY
- Animate only transform and opacity
- Avoid excessive animation

Recommended:

- Card hover: translateY(-2px)
- Button hover: subtle lift
- Page transition: fade only

## 9. Icons

Use Lucide React or Heroicons style.

Rules:

- No emoji icons
- Keep icon stroke width consistent
- Icons should be functional, not decorative only

## 10. UI Pages

Required pages:

```txt
/
/dashboard
/scrape
/products
/reviews
/export
```

Branding:

- Use Metrif Scraper logo assets from `frontend/public/brand/`.
- Use the compact top navigation implemented in `AppShell`.
- Landing page is a short product entry page, not a marketing-heavy site.

## 11. Anti-Patterns

Do not use:

- Emojis as UI icons
- Pure black #000000
- Oversaturated colors
- Heavy shadows
- Random gradients everywhere
- Lorem ipsum text
- Spinner-only loading states
- Crowded layout
- Unclear CTA buttons
