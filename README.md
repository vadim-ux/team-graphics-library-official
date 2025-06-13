# 🎨 Team Graphics Library

A curated collection of logos, icons, and graphics for our team projects. All assets are automatically exported from Figma and optimized for web and app usage.

## 📁 Repository Structure

```
📦 team-graphics-library
├── 🏷️ logos/           # Brand logos and company identities
├── 🔗 icons/           # UI icons and symbols  
├── 🎭 illustrations/   # Custom illustrations
├── 📄 templates/       # Design templates
└── 📋 metadata.json    # Asset database with URLs and metadata
```

## 🚀 Quick Access

### For Developers
```javascript
// Fetch all assets
const response = await fetch('https://raw.githubusercontent.com/vadim-ux/team-graphics-library-official/main/metadata.json');
const library = await response.json();
```

### For Designers
- **Figma Source**: [Assets Store](https://www.figma.com/design/NNbW3imWZzRACyk94N6DZa/Assets-store?node-id=0-1&t=bbIVH6ODTVgoN69X-1) (Internal)
- **Export Tool**: Custom Figma Plugin
- **Auto-sync**: ✅ Enabled

## 🔧 Usage Examples

### Direct Image URLs
```
https://raw.githubusercontent.com/vadim-ux/team-graphics-library-official/main/logos/docker.png
https://raw.githubusercontent.com/vadim-ux/team-graphics-library-official/main/icons/arrow-right.png
```

### Metadata API
```json
{
  "name": "Team Graphics Library",
  "version": "1.0.0",
  "totalAssets": 450,
  "assets": [
    {
      "id": "logo-docker",
      "name": "docker",
      "category": "logos",
      "url": "https://raw.githubusercontent.com/.../logos/docker.png",
      "lastUpdated": "2025-06-13"
    }
  ]
}
```

## 📱 Integrations

- **[Raycast Extension](https://raycast.com)** - Search and copy assets instantly
- **Figma Plugin** - Auto-export from design files
- **Web Apps** - Direct API access via metadata.json

## 🎯 Asset Guidelines

### Naming Convention
```
Category / Asset Name
├── logos / company-name
├── icons / icon-description  
└── templates / template-type
```

### Export Specifications
- **Format**: PNG
- **Scale**: 8x (high-resolution)
- **Optimization**: Web-ready
- **Background**: Transparent

## 🔄 Workflow

1. **Design** → Update assets in Figma
2. **Export** → Use Figma plugin to sync to GitHub
3. **Deploy** → Assets automatically available via URLs
4. **Access** → Use Raycast or direct API calls

## 📊 Stats

- **Total Assets**: Auto-updated via metadata.json
- **Categories**: Logos, Icons, Illustrations, Templates  
- **Last Updated**: Auto-updated via export tool
- **Maintained by**: Design Team

## 🤝 Contributing

1. Add/update assets in the main Figma file
2. Use the export plugin to sync changes
3. Assets will be automatically available in the repository

---

**Made with ❤️ by the Design Team** | *Powered by Figma + GitHub*
