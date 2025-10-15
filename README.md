# Recipe Finder 🍳

A modern, responsive recipe discovery application built with Next.js 15, TypeScript, and Tailwind CSS. Search, filter, and explore delicious recipes from around the world with advanced ingredient-based recommendations.

## ✨ Features

- **🔍 Advanced Search**: Search by recipe name, cuisine, or ingredients
- **🥘 Ingredient-Based Recommendations**: Find recipes you can make with ingredients you have
- **🌍 Global Cuisine Collection**: 200+ recipes from multiple cuisines
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **🎨 Beautiful UI**: Modern design with shadcn/ui components
- **⚡ Fast Performance**: Static site generation for optimal loading
- **🖼️ High-Quality Images**: Professional food photography for every recipe

## 🚀 Live Demo

[https://your-username.github.io/recipe-finder](https://your-username.github.io/recipe-finder)

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Deployment**: GitHub Pages

## 📦 Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/recipe-finder.git
   cd recipe-finder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🌐 GitHub Pages Deployment

### Automatic Deployment (Recommended)

1. **Fork this repository**
   
2. **Update the base path** (if your repo name is different)
   - Edit `next.config.ts`
   - Change `/recipe-finder` to your repository name

3. **Enable GitHub Pages**
   - Go to your repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages` and `/ (root)`

4. **Push to main branch**
   - The GitHub Actions workflow will automatically deploy your site

### Manual Deployment

1. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update package.json**
   ```json
   {
     "homepage": "https://your-username.github.io/recipe-finder",
     "scripts": {
       "deploy": "npm run build && gh-pages -d out -b main"
     }
   }
   ```

3. **Build and deploy**
   ```bash
   npm run deploy
   ```

## 📁 Project Structure

```
recipe-finder/
├── public/                 # Static assets (images, icons)
│   └── images/            # Recipe images
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API routes
│   │   ├── globals.css   # Global styles
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Home page
│   ├── components/       # React components
│   │   └── ui/          # shadcn/ui components
│   └── lib/             # Utilities and data
│       ├── api.ts       # API client
│       └── recipes-data.ts # Recipe data
├── .github/
│   └── workflows/       # GitHub Actions
├── next.config.ts        # Next.js configuration
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## 🎯 Usage

### Recipe Search
- **Basic Search**: Enter recipe names or ingredients
- **Cuisine Filter**: Filter by specific cuisines (Italian, Mexican, Indian, etc.)
- **Ingredient Search**: Add ingredients you have and get personalized recommendations

### Recipe Details
- Click **"View Full Recipe"** to see:
  - Complete ingredients list
  - Step-by-step instructions
  - Cooking time and servings
  - Difficulty level

### Ingredient Recommendations
1. Switch to **"Ingredient Search"** mode
2. Add ingredients you have available
3. Click **"Get Recommendations"**
4. See recipes ranked by match percentage

## 🔧 Configuration

### Custom Base Path

If deploying to a different path, update `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  basePath: process.env.NODE_ENV === 'production' ? '/your-repo-name' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/your-repo-name' : '',
  // ... other config
};
```

### Adding New Recipes

Edit `src/lib/recipes-data.ts`:

```typescript
{
  id: unique_number,
  name: "Recipe Name",
  cuisine: "Cuisine Type",
  ingredients: ["ingredient1", "ingredient2"],
  instructions: "Step 1: Do this. Step 2: Do that.",
  image: "image-filename.jpg",
  prep_time: minutes,
  cook_time: minutes,
  servings: number,
  difficulty: "Easy|Medium|Hard"
}
```

## 🎨 Customization

### Colors and Theme

The app uses Tailwind CSS with CSS variables. Modify colors in `src/app/globals.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  /* ... other colors */
}
```

### UI Components

All UI components are from shadcn/ui. Customize them in the `src/components/ui/` directory.

## 🚀 Performance

- **Static Site Generation**: Pre-built at build time for optimal performance
- **Image Optimization**: Next.js Image component with lazy loading
- **Code Splitting**: Automatic code splitting for faster initial load
- **SEO Friendly**: Meta tags and structured data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Lucide](https://lucide.dev/) - Icon library
- [Unsplash](https://unsplash.com/) - Recipe images

## 📞 Support

If you have any questions or need help, please:

1. Check the [Issues](https://github.com/your-username/recipe-finder/issues) page
2. Create a new issue with detailed information
3. Join our [Discussions](https://github.com/your-username/recipe-finder/discussions)

---

⭐ If you like this project, please give it a star on GitHub!