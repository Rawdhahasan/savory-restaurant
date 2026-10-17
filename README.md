# Savory — Modern Kitchen & Bar

A premium, fully responsive restaurant website built with plain **HTML, CSS and JavaScript**. There is no framework and no build step.

## Technologies

| Area        | Tools                                                                  |
| ----------- | ---------------------------------------------------------------------- |
| Markup      | HTML5 (semantic elements, ARIA for accessibility)                       |
| Styling     | CSS3: custom properties, Grid, Flexbox, `clamp()`, keyframe animations |
| Behaviour   | Vanilla JavaScript (ES2022): IntersectionObserver, `Intl` API           |
| Quality     | html-validate, Stylelint, ESLint                                       |
| Assets      | Google Fonts, Unsplash photography, OpenStreetMap embed                |

## Features

- **Hero section** with a full-screen photo, a slow zoom effect and clear calls to action
- **Interactive menu** with category tabs (All, Starters, Mains, Pizza & Pasta, Desserts, Drinks) that you can use with a mouse, touch or the arrow keys. The dishes come from one data file.
- **Opening hours** with a live "Open now / Closed" status, calculated in the restaurant's time zone, and today's row highlighted
- **Photo gallery** in a masonry-style grid with a lightbox (keyboard, click and swipe navigation)
- **Reservation form** with:
  - inline validation
  - a date picker limited to the 90-day booking window
  - time slots generated from the opening hours (closed days and past times are excluded)
  - loading and success states
- **Contact & location** section with an embedded OpenStreetMap map (no API key needed)
- **Responsive** layouts for mobile, tablet and desktop, with a fullscreen mobile menu
- **Animations**:
  - scroll-reveal effects
  - hover effects on cards, images and buttons
  - a sticky header that changes style as you scroll
  - all of these respect the visitor's `prefers-reduced-motion` setting
- **Accessibility**:
  - semantic HTML and a skip link
  - ARIA tabs and dialog patterns
  - visible focus styles and labelled form errors

## Project structure

```
savory-restaurant/
├── index.html          # Page markup
├── css/styles.css      # All styles (design tokens at the top)
├── js/menu-data.js     # Menu items (edit this to change dishes and prices)
├── js/main.js          # Site interactions
├── assets/favicon.svg
└── package.json        # Dev tooling (linters, local server)
```

## Running locally

```bash
npm start             # serves the site at http://localhost:8080
```

Or just open `index.html` in a browser.

## Code quality checks

```bash
npm install           # first time only
npm run lint          # html-validate + stylelint + eslint
```

## Customising

| What                 | Where                                                        |
| -------------------- | ------------------------------------------------------------ |
| Colours, fonts, spacing | `:root` variables at the top of `css/styles.css`          |
| Menu dishes & prices | `js/menu-data.js`                                            |
| Opening hours        | `HOURS` in `js/main.js` **and** the hours table in `index.html` |
| Time zone            | `TIME_ZONE` in `js/main.js`                                  |

### Connecting the reservation form

The form is front-end only. On submit it shows a simulated confirmation. To receive real bookings, replace the `setTimeout` in `initReservationForm()` (`js/main.js`) with a request to a form service such as [Formspree](https://formspree.io) or your own backend. There is an example in the code comment.

## Credits

- Photography from [Unsplash](https://unsplash.com)
- Fonts: Cormorant Garamond & Manrope via Google Fonts
- Map © OpenStreetMap contributors

Savory is a fictional restaurant created as a portfolio project.
