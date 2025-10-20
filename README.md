# Fuel Cell Catalyst Database & Performance Prediction Platform

A comprehensive web platform for fuel cell catalyst research, featuring a database system and AI-powered performance prediction tools.

## Features

- **Interactive Homepage**: Clean, professional design with search functionality and feature highlights
- **Performance Prediction Tool**: AI-powered catalyst performance prediction with:
  - Multiple catalyst type support (Pt-based, alloys, non-PGM, single-atom)
  - Adjustable parameters (metal content, support material, surface area, particle size)
  - Operating condition controls (temperature, humidity)
  - Real-time visualization with Chart.js
  - Simulated performance metrics (mass activity, specific activity, ECSA, stability)
- **Database Page**: Placeholder for future catalyst database implementation
- **Documentation**: User guide and platform information
- **About Page**: Platform mission and features overview
- **Responsive Design**: Mobile-friendly layout using Tailwind CSS

## Technology Stack

- **HTML5**: Semantic markup
- **Tailwind CSS**: Utility-first CSS framework (via CDN)
- **JavaScript**: Vanilla JS for interactivity
- **Chart.js**: Data visualization library
- **No backend**: Static site ready for GitHub Pages deployment

## File Structure

```
sitp-web/
├── index.html              # Homepage
├── prediction.html         # Prediction tool (main feature)
├── database.html          # Database page (placeholder)
├── documentation.html     # Documentation
├── about.html            # About page
├── css/
│   └── main.css          # Custom styles
├── js/
│   ├── main.js           # Common functionality
│   └── prediction.js     # Prediction tool logic
└── README.md             # This file
```

## Getting Started

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/sitp-web.git
cd sitp-web
```

2. Open `index.html` in your browser or use a local server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve
```

3. Navigate to `http://localhost:8000` in your browser

### GitHub Pages Deployment

1. Push your code to GitHub
2. Go to repository Settings → Pages
3. Select the branch (usually `main`) and root directory
4. Save and wait for deployment
5. Your site will be available at `https://yourusername.github.io/sitp-web/`

## Usage

### Prediction Tool

1. Navigate to the **Prediction Tool** page
2. Select catalyst type from dropdown
3. Adjust metal content using the slider
4. Choose support material
5. (Optional) Enter surface area and particle size
6. Set operating conditions
7. Click **Predict Performance** to see results

The tool will display:
- Mass Activity (A/mg_Pt)
- Specific Activity (mA/cm²)
- ECSA (m²/g)
- Stability (% after 5000 cycles)
- Polarization curve visualization

## Customization

### Colors

The platform uses a blue color scheme defined in Tailwind config:
- Primary: `#1a73e8` (blue)
- Dark: `#2d3748` (gray)

To change colors, modify the `tailwind.config` in each HTML file.

### Prediction Algorithm

The prediction logic is in `js/prediction.js`. Current implementation uses simulated calculations based on input parameters. To integrate real ML models:

1. Replace the `generatePredictions()` function
2. Add API calls to your backend
3. Update result display logic as needed

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Notes

- This is a demonstration platform with simulated predictions
- Database page is a placeholder for future development
- Login/signup buttons are non-functional placeholders
- All predictions are generated client-side for demonstration

## Future Enhancements

- [ ] Backend API integration
- [ ] Real catalyst database with search/filter
- [ ] User authentication system
- [ ] Data export functionality
- [ ] Advanced visualization options
- [ ] Machine learning model integration

## License

This project is open source and available under the MIT License.

## Contact

For questions or collaboration opportunities, please open an issue on GitHub.
