# VisionCare Pharmacy & Optical (MMH)

Welcome to the VisionCare Pharmacy & Optical project repository! This is a modern, responsive web application built for healthcare, encompassing patient portals, doctor dashboards, pharmacy, and optical store functionalities.

## 🚀 Tech Stack

- **Framework**: [React 18](https://reactjs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Routing**: [React Router](https://reactrouter.com/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) / Radix UI Primitives
- **Icons**: [Lucide React](https://lucide.dev/)

## 📂 Project Structure

The project follows a standard, scalable architecture, separating reusable UI components from routable pages.

```text
src/
├── app/
│   ├── components/       # Reusable feature-level components (e.g., Navigation, Footer)
│   │   └── ui/           # Generic, primitive UI components from Shadcn (Buttons, Dialogs, etc.)
│   ├── pages/            # Routable page components (LandingPage, Dashboards, Store)
│   ├── App.tsx           # Main application root containing providers
│   └── routes.tsx        # React Router configuration
├── styles/
│   ├── index.css         # Global stylesheet importing themes and fonts
│   └── theme.css         # Custom healthcare theme variables (Colors, typography)
├── assets/               # Static assets (images, icons)
└── main.tsx              # React entry point
```

## 🎨 Theming & Styling

This project utilizes a custom theme on top of standard Shadcn UI values.

### Custom Theme Variables

We have established healthcare-specific branding colors. These are defined in `src/styles/theme.css`:

- `--healthcare-blue`: Core primary brand color.
- `--healthcare-teal` & `--healthcare-emerald`: Secondary accents.
- `--healthcare-cyan`: Interactive states and highlights.

**Usage Example in Code:**
```tsx
// Using Tailwind arbitrary values to map to the CSS variables
<div className="bg-[var(--healthcare-blue)] text-white">
  Healthcare Component
</div>
```

If you wish to change the primary brand color, simply modify the variables in `src/styles/theme.css` and the entire application will reflect the updates automatically.

## 🛠️ Development

### Setup

Make sure you have [Node.js](https://nodejs.org/) installed, and then install dependencies (preferably using `pnpm` as the workspace indicates):

```bash
pnpm install
```

### Running Locally

To start the Vite development server:

```bash
pnpm run dev
```

### Building for Production

To create an optimized production build:

```bash
pnpm run build
```

## 📜 Standard Practices

1. **Component Usage**: Always prefer standard UI components from `src/app/components/ui/` over raw HTML elements to ensure accessibility and theme consistency.
2. **Page Organization**: Complex pages in `src/app/pages/` should extract their sub-sections into dedicated files if they become too unwieldy.
3. **Icons**: Use `lucide-react` for any icon needs.