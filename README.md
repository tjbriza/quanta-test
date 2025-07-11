# AI PC Build Advisor

An intelligent PC build recommendation system that suggests optimal PC components based on your budget and existing hardware, specifically tailored for the Philippine market.

## Features

- 💰 Budget-based PC build recommendations in Philippine Pesos (PHP)
- 🔧 Existing component compatibility checking
- 🤖 AI-powered component selection using Hugging Face
- 📱 Responsive design with modern UI
- 🎯 Philippine market pricing and availability focus

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4
- **Icons**: Lucide React
- **AI**: Hugging Face API
- **HTTP Client**: Axios

## Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file and add your Hugging Face token:
   ```
   VITE_HF_QUANTA_TOKEN=your_hugging_face_token_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment on Netlify

### Environment Variables

In your Netlify dashboard, go to Site Settings > Environment Variables and add:

- **Variable Name**: `VITE_HF_QUANTA_TOKEN`
- **Variable Value**: Your Hugging Face API token

### Deploy Steps

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add the environment variable `VITE_HF_QUANTA_TOKEN`
5. Deploy!

### Getting a Hugging Face Token

1. Go to [Hugging Face Settings](https://huggingface.co/settings/tokens)
2. Create a new token with read permissions
3. Copy the token and add it to your environment variables

## Project Structure

```
src/
├── components/
│   ├── PCBuildAdvisor.jsx      # Main component
│   ├── BudgetInput.jsx         # Budget input field
│   ├── ComponentSelector.jsx   # Component selection
│   ├── BuildRecommendation.jsx # Results display
│   └── index.js               # Component exports
├── utils/
│   └── fallbackBuild.js       # Fallback build logic
├── App.jsx                     # App entry point
├── main.jsx                    # React root
└── index.css                   # Tailwind CSS
```

## Usage

1. Enter your budget in Philippine Pesos
2. Check any components you already own
3. Specify the models of existing components
4. Click "Generate AI PC Build Recommendation"
5. Review the suggested build with pricing and explanations

## License

MIT License+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
