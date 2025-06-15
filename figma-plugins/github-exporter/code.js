// --- PLUGIN INITIALIZATION AND MESSAGE HANDLING ---

figma.showUI(__html__, { width: 340, height: 480 });

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'load-settings') {
    const settings = await figma.clientStorage.getAsync('githubExporterSettings');
    figma.ui.postMessage({ type: 'settings-loaded', settings });
  } else if (msg.type === 'save-settings') {
    await figma.clientStorage.setAsync('githubExporterSettings', msg.settings);
    figma.ui.postMessage({ type: 'status-update', text: 'Settings saved.' });
    figma.notify('Settings saved.');
  } else if (msg.type === 'export-to-github') {
    await runExport();
  }
};

// --- MAIN EXPORT LOGIC ---

async function runExport() {
  const settings = await figma.clientStorage.getAsync('githubExporterSettings');
  if (!settings || !settings.token || !settings.repo) {
    figma.ui.postMessage({ type: 'status-update', text: 'Error: Please fill in and save settings.', isError: true });
    return;
  }

  const selectedNodes = figma.currentPage.selection.filter(n => n.type === 'FRAME');
  if (selectedNodes.length === 0) {
    figma.ui.postMessage({ type: 'status-update', text: 'Error: Please select at least one frame.', isError: true });
    return;
  }

  // 1. Load existing metadata.json from GitHub
  figma.ui.postMessage({ type: 'status-update', text: '📥 Loading existing metadata.json...' });
  const existingMetadata = await loadExistingMetadata(settings);
  
  const assetsMetadata = existingMetadata ? [...existingMetadata.assets] : [];
  const imageUploadTasks = [];
  let newAssetsCount = 0;
  let updatedAssetsCount = 0;

  for (const node of selectedNodes) {
    if (!node.name.includes(' / ')) {
      figma.ui.postMessage({ type: 'status-update', text: `Skipped frame "${node.name}" (invalid name format).`, isError: true });
      continue;
    }

    const [category, name] = node.name.split(' / ').map(p => p.trim());
    const id = `logo-${name}`;
    const fileName = `${name}.png`;
    const exportPath = `${category}/${fileName}`;
    const githubRawUrl = `https://raw.githubusercontent.com/${settings.repo}/${settings.branch}/${exportPath}`;

    // Check if this asset already exists in GitHub
    const existingAssetIndex = assetsMetadata.findIndex(asset => asset.id === id);
    const isNewAsset = existingAssetIndex === -1;
    
    // Additionally check if file exists in GitHub
    let fileExistsInGitHub = false;
    try {
      const checkUrl = `https://api.github.com/repos/${settings.repo}/contents/${exportPath}`;
      figma.ui.postMessage({ type: 'status-update', text: `🔍 Checking ${exportPath} in GitHub...` });
      const checkResponse = await fetch(checkUrl, {
        method: 'GET',
        headers: { 'Authorization': `token ${settings.token}` }
      });
      fileExistsInGitHub = checkResponse.ok;
      figma.ui.postMessage({ type: 'status-update', text: `📋 ${exportPath} in GitHub: ${fileExistsInGitHub ? 'EXISTS' : 'NOT FOUND'}` });
    } catch (e) {
      fileExistsInGitHub = false;
      figma.ui.postMessage({ type: 'status-update', text: `⚠️ Error checking ${exportPath}: ${e.message}` });
    }
    
    const isActuallyNew = isNewAsset && !fileExistsInGitHub;
    figma.ui.postMessage({ type: 'status-update', text: `🤔 ${fileName}: new in metadata=${isNewAsset}, new in GitHub=${!fileExistsInGitHub}, total new=${isActuallyNew}` });

    if (isNewAsset) {
      newAssetsCount++;
      figma.ui.postMessage({ type: 'status-update', text: `➕ New asset: ${fileName}${fileExistsInGitHub ? ' (file already exists in GitHub)' : ''}` });
    } else {
      updatedAssetsCount++;
      figma.ui.postMessage({ type: 'status-update', text: `🔄 Updating asset: ${fileName}` });
    }

    // Create/update metadata for this asset
    const assetMetadata = {
      id,
      name,
      tags: [],
      category,
      url: githubRawUrl,
      size: "",
      lastUpdated: new Date().toISOString().split('T')[0] // Add last updated date
    };

    if (isNewAsset) {
      assetsMetadata.push(assetMetadata);
    } else {
      assetsMetadata[existingAssetIndex] = assetMetadata;
    }

    // Prepare PNG export task
    figma.ui.postMessage({ type: 'status-update', text: `📸 Exporting ${fileName}...` });
    const pngBytes = await node.exportAsync({
      format: 'PNG',
      constraint: { type: 'SCALE', value: 8 },
    });
    
    imageUploadTasks.push({
        bytes: pngBytes,
        path: exportPath,
        message: isNewAsset ? `feat: add new asset ${fileName}` : `feat: update asset ${fileName}`,
        isNew: isActuallyNew
    });
  }
  
  // 2. Upload all images sequentially
  figma.ui.postMessage({ type: 'status-update', text: `🚀 Uploading ${imageUploadTasks.length} images...` });
  for(const task of imageUploadTasks) {
      try {
        await uploadToGitHub(task.bytes, task.path, task.message, settings, task.isNew);
      } catch (e) {
        figma.ui.postMessage({ type: 'status-update', text: `Critical error uploading ${task.path}. Stopping process.`, isError: true });
        return;
      }
  }

  // 3. Update and upload metadata.json
  figma.ui.postMessage({ type: 'status-update', text: '📝 Updating metadata.json...' });
  
  try {
    const metadataFile = {
      name: "Team Graphics Library",
      version: "1.0.0",
      updated: new Date().toISOString().split('T')[0],
      totalAssets: assetsMetadata.length,
      assets: assetsMetadata,
    };

    const metadataString = JSON.stringify(metadataFile, null, 2);
    const metadataBytes = new Uint8Array(
      Array.from(metadataString).map(char => char.charCodeAt(0))
    );

    await uploadToGitHub(metadataBytes, 'metadata.json', 
      `docs: update metadata.json (+${newAssetsCount} new, ~${updatedAssetsCount} updated)`, 
      settings);
    
    figma.ui.postMessage({ type: 'status-update', text: `✅ Export completed! New: ${newAssetsCount}, Updated: ${updatedAssetsCount}` });
    figma.notify(`Export completed! +${newAssetsCount} new, ~${updatedAssetsCount} updated`);
    
  } catch (e) {
    figma.ui.postMessage({ type: 'status-update', text: `❌ Error working with metadata.json: ${e.message}`, isError: true });
    console.error('Metadata error:', e);
  }
}

// --- LOADING EXISTING METADATA ---

// Function for base64 decoding - use Buffer or simple alternative
function base64Decode(base64String) {
  try {
    // Remove spaces and line breaks
    const cleanBase64 = base64String.replace(/\s/g, '');
    
    // Try to use Buffer if available
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(cleanBase64, 'base64').toString('utf8');
    }
    
    // If Buffer is not available, try atob
    if (typeof atob !== 'undefined') {
      return atob(cleanBase64);
    }
    
    // As a last resort - simple implementation
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let result = '';
    let i = 0;
    
    while (i < cleanBase64.length) {
      const encoded1 = chars.indexOf(cleanBase64[i++]);
      const encoded2 = chars.indexOf(cleanBase64[i++]);
      const encoded3 = chars.indexOf(cleanBase64[i++]);
      const encoded4 = chars.indexOf(cleanBase64[i++]);
      
      const bitmap = (encoded1 << 18) | (encoded2 << 12) | (encoded3 << 6) | encoded4;
      
      result += String.fromCharCode((bitmap >> 16) & 255);
      if (encoded3 !== 64) result += String.fromCharCode((bitmap >> 8) & 255);
      if (encoded4 !== 64) result += String.fromCharCode(bitmap & 255);
    }
    
    return result;
  } catch (e) {
    throw new Error('Base64 decoding error: ' + e.message);
  }
}

async function loadExistingMetadata(settings) {
  try {
    // FIXED: Explicitly specify loading from main branch
    const apiUrl = `https://api.github.com/repos/${settings.repo}/contents/metadata.json?ref=main`;
    
    figma.ui.postMessage({ type: 'status-update', text: '🔍 Looking for metadata.json in main branch...' });
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Authorization': `token ${settings.token}` }
    });

    if (response.ok) {
      const data = await response.json();
      
      // Check that content exists
      if (!data.content) {
        figma.ui.postMessage({ type: 'status-update', text: '⚠️ metadata.json found, but content is empty' });
        return null;
      }
      
      // Decode base64 content (use our function instead of atob)
      let content;
      try {
        content = base64Decode(data.content);
      } catch (decodeError) {
        figma.ui.postMessage({ type: 'status-update', text: `⚠️ Base64 decoding error: ${decodeError.message}` });
        return null;
      }
      
      // Check that it's valid JSON
      let metadata;
      try {
        metadata = JSON.parse(content);
      } catch (parseError) {
        figma.ui.postMessage({ type: 'status-update', text: `⚠️ Error parsing metadata.json: ${parseError.message}` });
        return null;
      }
      
      // Check that assets array exists
      if (!metadata.assets || !Array.isArray(metadata.assets)) {
        figma.ui.postMessage({ type: 'status-update', text: '⚠️ metadata.json found, but assets array is missing or invalid' });
        // Create new object without spread operator
        const fixedMetadata = {
          name: metadata.name || "Team Graphics Library",
          version: metadata.version || "1.0.0", 
          updated: metadata.updated || new Date().toISOString().split('T')[0],
          totalAssets: 0,
          assets: []
        };
        return fixedMetadata;
      }
      
      const assetsCount = metadata.assets.length;
      figma.ui.postMessage({ type: 'status-update', text: `📋 Found existing metadata.json from main branch with ${assetsCount} assets` });
      return metadata;
      
    } else if (response.status === 404) {
      figma.ui.postMessage({ type: 'status-update', text: '📄 metadata.json not found in main branch, creating new one' });
      return null;
    } else {
      const errorText = await response.text();
      figma.ui.postMessage({ type: 'status-update', text: `⚠️ HTTP error ${response.status} loading metadata.json: ${errorText}` });
      return null;
    }
  } catch (e) {
    figma.ui.postMessage({ type: 'status-update', text: `⚠️ Failed to load metadata.json from main branch: ${e.message}` });
    console.error('Detailed loadExistingMetadata error:', e);
    return null;
  }
}

// --- HELPER FUNCTION FOR GITHUB API ---

async function uploadToGitHub(bytes, path, message, settings) {
    const apiUrl = `https://api.github.com/repos/${settings.repo}/contents/${path}`;
    figma.ui.postMessage({ type: 'status-update', text: `📤 Uploading ${path}...` });

    // Convert Uint8Array to Base64 string
    const base64 = figma.base64Encode(bytes);

    // FIXED: Get SHA from the same branch we're uploading to
    let sha = undefined;
    try {
        const checkUrl = `${apiUrl}?ref=${settings.branch}`;
        const response = await fetch(checkUrl, {
            method: 'GET',
            headers: { 'Authorization': `token ${settings.token}` }
        });
        if (response.ok) {
            const data = await response.json();
            sha = data.sha;
            figma.ui.postMessage({ type: 'status-update', text: `✏️ Updating existing ${path} (SHA: ${sha.substring(0, 8)}...)` });
        } else {
            figma.ui.postMessage({ type: 'status-update', text: `➕ Creating new file ${path}...` });
        }
    } catch (e) { 
        figma.ui.postMessage({ type: 'status-update', text: `➕ Creating new file ${path}...` });
    }
    
    const bodyObject = {
        message: message,
        content: base64,
        branch: settings.branch
    };
    
    // Add sha only if it exists
    if (sha) {
        bodyObject.sha = sha;
    }
    
    const body = JSON.stringify(bodyObject);

    try {
        const uploadResponse = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${settings.token}`,
                'Content-Type': 'application/json'
            },
            body: body
        });

        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            
            // Special handling for SHA conflicts
            if (uploadResponse.status === 409) {
                figma.ui.postMessage({ type: 'status-update', text: `⚠️ SHA conflict for ${path}. Getting current SHA from ${settings.branch}...` });
                
                // FIXED: Get current SHA from the correct branch
                try {
                    const retryCheckUrl = `${apiUrl}?ref=${settings.branch}`;
                    const retryResponse = await fetch(retryCheckUrl, {
                        method: 'GET',
                        headers: { 'Authorization': `token ${settings.token}` }
                    });
                    
                    if (retryResponse.ok) {
                        const retryData = await retryResponse.json();
                        const newSha = retryData.sha;
                        
                        figma.ui.postMessage({ type: 'status-update', text: `🔄 Retrying with current SHA: ${newSha.substring(0, 8)}...` });
                        
                        // Update SHA and try again
                        const retryBodyObject = {
                            message: message,
                            content: base64,
                            branch: settings.branch,
                            sha: newSha
                        };
                        
                        const retryUploadResponse = await fetch(apiUrl, {
                            method: 'PUT',
                            headers: {
                                'Authorization': `token ${settings.token}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(retryBodyObject)
                        });
                        
                        if (retryUploadResponse.ok) {
                            figma.ui.postMessage({ type: 'status-update', text: `✅ Success after retry: ${path}` });
                            return; // Successfully uploaded
                        } else {
                            const retryErrorText = await retryUploadResponse.text();
                            throw new Error(`HTTP ${retryUploadResponse.status} on retry: ${retryErrorText}`);
                        }
                    } else {
                        throw new Error(`Failed to get current SHA: HTTP ${retryResponse.status}`);
                    }
                } catch (retryError) {
                    figma.ui.postMessage({ type: 'status-update', text: `❌ Error on retry: ${retryError.message}`, isError: true });
                    throw retryError;
                }
            }
            
            throw new Error(`HTTP ${uploadResponse.status}: ${errorText}`);
        }
        
        const responseData = await uploadResponse.json();
        figma.ui.postMessage({ type: 'status-update', text: `✅ Success: ${path}` });
        
    } catch (e) {
        figma.ui.postMessage({ type: 'status-update', text: `❌ Upload error ${path}: ${e.message}`, isError: true });
        throw e;
    }
}