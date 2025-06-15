# GitHub Exporter Plugin for Figma

A Figma plugin that automatically exports selected frames as PNG images and uploads them to a GitHub repository with metadata management.

## Features

- 🚀 **Direct GitHub Upload** - Export frames directly to your GitHub repository
- 📝 **Automatic Metadata** - Generates and maintains `metadata.json` with asset information
- 🔄 **Smart Updates** - Detects new vs. existing assets and updates accordingly
- 📁 **Category Organization** - Organizes assets by category folders
- ✅ **Branch Support** - Works with any GitHub branch
- 🔍 **Conflict Resolution** - Handles SHA conflicts and duplicate files

## Installation

1. In Figma, go to **Plugins** → **Development** → **Import plugin from manifest**
2. Select the `manifest.json` file from this directory
3. The plugin will appear in your Plugins menu

## Setup

### 1. GitHub Personal Access Token

1. Go to [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Click **Generate new token (classic)**
3. Give it a name like "Figma Exporter"
4. Select scopes: `repo` (Full control of private repositories)
5. Copy the generated token (starts with `ghp_`)

### 2. Plugin Configuration

1. Open the plugin in Figma
2. Enter your GitHub Personal Access Token
3. Enter repository in format: `username/repository-name`
4. Set target branch (usually `main` or `export-from-figma`)
5. Click **Save Settings**

## Usage

### Frame Naming Convention

Frames must be named using the format: `category / asset-name`

**Examples:**
- `logos / amazon-eks` → saves to `logos/amazon-eks.png`
- `icons / user-profile` → saves to `icons/user-profile.png`
- `illustrations / onboarding-step1` → saves to `illustrations/onboarding-step1.png`

### Export Process

1. Select one or more frames in Figma
2. Open the GitHub Exporter plugin
3. Click **Export to GitHub**
4. Monitor progress in the status window

The plugin will:
- Export frames as high-resolution PNG files (8x scale)
- Upload images to the specified GitHub repository
- Update or create `metadata.json` with asset information
- Show detailed progress and any errors

## Metadata Structure

The plugin automatically maintains a `metadata.json` file with this structure:

```json
{
  "name": "Team Graphics Library",
  "version": "1.0.0",
  "updated": "2025-06-15",
  "totalAssets": 42,
  "assets": [
    {
      "id": "logo-amazon-eks",
      "name": "amazon-eks",
      "tags": [],
      "category": "logos",
      "url": "https://raw.githubusercontent.com/username/repo/main/logos/amazon-eks.png",
      "size": "",
      "lastUpdated": "2025-06-15"
    }
  ]
}
```

## Troubleshooting

### Common Issues

**"Error: Please fill in and save settings"**
- Make sure you've entered and saved your GitHub token and repository

**"Error: Please select at least one frame"**
- Select frames in Figma before running the export

**"Skipped frame (invalid name format)"**
- Check that frame names follow the `category / name` format

**"SHA conflict"**
- The plugin automatically resolves these conflicts, wait for retry

### Tips

- Use descriptive, lowercase names with dashes: `user-profile` not `User Profile`
- Keep category names consistent: `logos`, `icons`, `illustrations`
- Export similar frames together to batch upload efficiently
- Check the status window for detailed progress information

## Related

This plugin is designed to work with the [Team Graphics Library](.../README.md) system for managing design assets in GitHub repositories.

## License

MIT License - feel free to modify and distribute.
