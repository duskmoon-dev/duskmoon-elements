# Data Model: Vite Playground Package

**Feature**: 001-vite-playground
**Date**: 2025-12-31

## Overview

The playground is a static site with no persistent data storage. This document describes the conceptual entities and their structure for documentation purposes.

## Entities

### Demo Page

A static HTML page that demonstrates a single custom element.

| Attribute | Type | Description |
|-----------|------|-------------|
| name | string | Element name (e.g., "button", "card") |
| title | string | Page title displayed in browser |
| elementTag | string | Custom element tag (e.g., "el-dm-button") |
| examples | Example[] | List of element usage examples |

### Example

A single demonstration of a custom element with specific properties.

| Attribute | Type | Description |
|-----------|------|-------------|
| title | string | Example title/description |
| code | string | HTML markup showing element usage |
| properties | object | Element properties being demonstrated |

### Navigation

The navigation structure linking all demo pages.

| Attribute | Type | Description |
|-----------|------|-------------|
| items | NavItem[] | Ordered list of navigation links |

### NavItem

A single navigation link.

| Attribute | Type | Description |
|-----------|------|-------------|
| label | string | Display text for the link |
| href | string | URL path to the demo page |
| active | boolean | Whether this is the current page |

## Relationships

```
Navigation
    └── has many → NavItem

Demo Page
    └── has many → Example
```

## Notes

- No database or API required
- All data is embedded in static HTML files
- Navigation is consistent across all pages (shared HTML structure)
- Examples are hardcoded in each demo page's HTML

## State Transitions

N/A - Static content with no state changes.

## Validation Rules

- Each demo page MUST have at least one example
- Each navigation MUST include links to all demo pages
- Page titles MUST match the element being demonstrated
