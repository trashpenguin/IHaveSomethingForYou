# 💐 I Have Something For You - Valentine's Flower Animation

A romantic, animated flower webpage built with pure HTML, CSS (SCSS), and JavaScript. This project creates a beautiful, animated flower garden with a night sky background, perfect for sharing a special Valentine's Day message.

## ✨ Features

- **Landing Page** (`index.html`) — Displays the text "I Have Something For You" with a subtle letter-by-letter animation and a button to open the flower display.
- **Flower Animation Page** (`flower.html`) — Animated 3D flowers with blooming petals, swaying stalks, grass, and glowing light particles, all built with pure CSS.
- **Typing Effect** — Messages are revealed letter-by-letter with a smooth typing animation.
- **Responsive Design** — Optimized for mobile and desktop viewing.
- **No External Dependencies** — Pure HTML, CSS, and vanilla JavaScript. No libraries or frameworks required.

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/trashpenguin/sleeping.github.io.git
   ```

2. Open `index.html` in your browser:
   ```bash
   open index.html
   ```
   Or simply double-click the file.

### Development

To modify the SCSS source, compile it to CSS:

```bash
# Using the sass CLI
sass scss/style.scss css/style.css
```

## 📁 Project Structure

```
sleeping.github.io/
├── index.html            # Landing page
├── flower.html           # Flower animation page
├── README.md             # Project documentation
├── css/
│   ├── index.css         # Styles for the landing page
│   ├── style.css         # Compiled CSS for the flower page
│   └── style.css.map     # Source map for debugging SCSS
├── scss/
│   └── style.scss        # SCSS source for the flower animation
├── js/
│   ├── index.js          # Landing page animations
│   └── main.js           # Flower page animations & effects
└── images/
    └── gift.png          # Favicon
```

## 🛠️ Built With

- **HTML5** — Page structure
- **CSS3 / SCSS** — Flower animations, gradients, and responsive layout
- **Vanilla JavaScript** — Typing effect, DOM manipulation, localStorage handling

## 🎨 Customization

### Changing the Message

Edit `js/main.js` to modify the animated text on the flower page (default: `"wuwuvyang ❤️"`):

```javascript
const titles = "Your Message Here ❤️".split('');
```

Edit `js/index.js` to change the landing page text (default: `"I Have Something For You"`):

```javascript
const text = 'Your Text Here'.split('');
```

### Modifying Flower Colors

Flower colors are controlled via CSS variables and gradients in `scss/style.scss`. Look for:

- `background-color: #a7ffee` (petal color)
- `background-color: #6bf0ff` (petal glow)
- `#159faa`, `#39c6d6`, `#079097` (stem and leaf colors)

## 📄 License

This project is open source. Feel free to use, modify, and share.

## 🙏 Acknowledgments

- Inspired by pure CSS art and animation techniques
- Built with ❤️ for sharing special moments