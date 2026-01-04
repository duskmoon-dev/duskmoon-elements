# API Contracts: Vite Playground Package

**Feature**: 001-vite-playground
**Date**: 2025-12-31

## Overview

This feature does not expose any API endpoints. The playground is a static site that:

- Serves HTML pages directly from the file system (dev) or static hosting (production)
- Uses standard HTTP file serving (GET requests for HTML, JS, CSS files)
- Has no backend server or API layer

## Static File Routes

| Path | Description |
|------|-------------|
| `/` or `/index.html` | Landing page with links to all demos |
| `/button.html` | Button element demo page |
| `/card.html` | Card element demo page |
| `/input.html` | Input element demo page |
| `/markdown.html` | Markdown element demo page |

## Notes

- All routes are served by Vite dev server during development
- Production build outputs static files for deployment to any static hosting service
- No authentication, authorization, or dynamic data handling required
