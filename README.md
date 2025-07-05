# 🎨 Team Graphics Library

A curated collection of logos, icons, and graphics for our team projects. All assets are automatically exported from Figma in both PNG and SVG formats, optimized for web and app usage.

## 📁 Repository Structure

```
📦 team-graphics-library
├── 📊 diagrams/                        # Charts, flowcharts, and data visualizations
├── 🐝 ebees/                           # All versions of eBee mascot
├── ⤴️ figma-plugins/github-exporter/   # Figma plugin source files
├── ❤️ icons/                           # UI icons and symbols
├── 🎨 illustrations/                   # Custom illustrations and artwork
├── 🍏 logos/                           # Brand logos and marks
├── 📌 stickers/                        # Fun stickers and decorative elements
├── 📄 templates/                       # Design templates and layouts
└── 📋 metadata.json                    # Asset database with URLs and metadata
```

## 🚀 Quick Access

### For Developers
```javascript
// Fetch all assets
const response = await fetch('https://raw.githubusercontent.com/vadim-ux/team-graphics-library-official/main/metadata.json');
const library = await response.json();

// Filter assets with SVG versions
const svgAssets = library.assets.filter(asset => asset.hasSvg);
```

### For Designers
- **Figma Source**: [Assets Store](https://www.figma.com/design/NNbW3imWZzRACyk94N6DZa/Assets-store?node-id=0-1&t=bbIVH6ODTVgoN69X-1) (Internal)
- **Export Tool**: Custom Figma Plugin with PNG + SVG support
- **Auto-sync**: ✅ Enabled

## 🔧 Usage Examples

### Direct Image URLs
```
# PNG versions (all assets)
https://raw.githubusercontent.com/vadim-ux/team-graphics-library-official/main/logos/docker.png
https://raw.githubusercontent.com/vadim-ux/team-graphics-library-official/main/icons/search.png

# SVG versions (select assets)
https://raw.githubusercontent.com/vadim-ux/team-graphics-library-official/main/logos/docker.svg
https://raw.githubusercontent.com/vadim-ux/team-graphics-library-official/main/icons/search.svg
```

### Metadata API
```json
{
  "name": "Team Graphics Library",
  "version": "1.0.0",
  "totalAssets": 450,
  "categories": ["diagrams", "ebees", "icons", "illustrations", "logos", "stickers", "templates"],
  "assets": [
    {
      "id": "logos-docker",
      "name": "docker",
      "category": "logos",
      "url": "https://raw.githubusercontent.com/.../logos/docker.png",
      "hasSvg": true,
      "svgUrl": "https://raw.githubusercontent.com/.../logos/docker.svg",
      "size": "1024x1024",
      "lastUpdated": "2025-06-13"
    }
  ]
}
```

## 📱 Integrations

- **[Raycast PNG Extension](https://github.com/vadim-ux/team-graphics-raycast-extension)** - Search and access PNG assets
- **[Raycast SVG Extension](https://github.com/vadim-ux/team-svg-raycast-extension)** - Search and copy SVG code instantly
- **Figma Plugin** - Auto-export from design files in both formats
- **Web Apps** - Direct API access via metadata.json

## 🎯 Asset Guidelines

### Naming Convention
```
Category / Asset Name
├── diagrams / user-flow
├── ebees / happy-version
├── icons / search
├── illustrations / hero-image
├── logos / company-name
├── stickers / rocket
└── templates / email-header
```

### Export Specifications

#### PNG Format
- **Resolution**: 1024x1024px (max dimension)
- **Format**: PNG with transparency
- **Optimization**: Web-ready
- **Use cases**: Presentations, social media, raster graphics tools

#### SVG Format
- **Format**: Scalable Vector Graphics
- **Optimization**: Clean, minimal code
- **Use cases**: Web development, vector editing, high-resolution displays
- **Availability**: Select assets (marked with `"hasSvg": true`)

## 🔄 Workflow

### For PNG Assets (All Graphics)
1. **Design** → Create/update assets in Figma
2. **Export PNG** → Use "Export PNG to GitHub" in Figma plugin
3. **Deploy** → PNG assets automatically available via URLs
4. **Access** → Use Raycast PNG extension or direct API calls

### For SVG Assets (Vector Graphics)
1. **Design** → Ensure vector-based artwork in Figma
2. **Export PNG** → First export PNG version (required)
3. **Export SVG** → Use "Export SVG to GitHub" in Figma plugin  
4. **Deploy** → SVG assets available alongside PNG versions
5. **Access** → Use Raycast SVG extension for instant code copying

## 📊 Stats

- **Total Assets**: Auto-updated via metadata.json
- **PNG Assets**: All graphics (100% coverage)
- **SVG Assets**: Select vector graphics (growing library)
- **Categories**: 7 organized categories
- **Last Updated**: Auto-updated via export tool
- **Maintained by**: Design Team

## 🤝 Contributing

### Adding New Assets
1. Add/update assets in the main Figma file using proper naming: `category / asset-name`
2. Use the export plugin "Export PNG to GitHub" to create the base asset
3. Optionally use "Export SVG to GitHub" for vector versions
4. Assets will be automatically available in the repository

### Valid Categories
- `diagrams` - Charts, flowcharts, data visualizations
- `ebees` - eBee mascot variations  
- `icons` - UI icons and symbols
- `illustrations` - Custom artwork and illustrations
- `logos` - Brand logos and marks
- `stickers` - Decorative elements and fun graphics
- `templates` - Design templates and layouts

## 🛠️ Technical Details

### File Structure
```
category/
├── asset-name.png    # PNG version (always present)
└── asset-name.svg    # SVG version (optional)
```

### API Endpoints
- **All Assets**: `metadata.json`
- **PNG Access**: `{category}/{asset-name}.png`
- **SVG Access**: `{category}/{asset-name}.svg` (if `hasSvg: true`)

---

**Made with ❤️ by the Design Team** | *Powered by Figma + GitHub + Raycast*