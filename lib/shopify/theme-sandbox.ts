/**
 * Ghost Sandbox Theme Management
 * 
 * Utilities for creating sandbox themes and injecting AI-generated code fixes
 * Uses Shopify Admin API 2024-01
 */

import type { CodeFix, DeploymentResult, SandboxTheme } from "@/lib/types"

export interface ShopifyThemeConfig {
  shop: string
  accessToken: string
}

export interface ShopifyTheme {
  id: number
  name: string
  role: "main" | "unpublished" | "demo"
  created_at: string
  updated_at: string
  previewable: boolean
  processing: boolean
  admin_graphql_api_id: string
}

export interface ShopifyAsset {
  key: string
  value?: string
  public_url?: string
  content_type?: string
  created_at: string
  updated_at: string
  checksum?: string
}

const SHOPIFY_API_VERSION = "2024-01"

/**
 * Get all themes from the store
 */
export async function getThemes(config: ShopifyThemeConfig): Promise<ShopifyTheme[]> {
  const { shop, accessToken } = config
  
  const response = await fetch(
    `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/themes.json`,
    {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to fetch themes: ${error}`)
  }

  const data = await response.json()
  return data.themes || []
}

/**
 * Get the currently active (main) theme
 */
export async function getActiveTheme(config: ShopifyThemeConfig): Promise<ShopifyTheme | null> {
  const themes = await getThemes(config)
  return themes.find(theme => theme.role === "main") || null
}

/**
 * Duplicate a theme to create a sandbox
 * 
 * @param config - Shopify client configuration
 * @param sourceThemeId - ID of the theme to duplicate
 * @param name - Name for the new sandbox theme
 */
export async function duplicateTheme(
  config: ShopifyThemeConfig,
  sourceThemeId: number,
  name?: string
): Promise<ShopifyTheme> {
  const { shop, accessToken } = config
  
  const sandboxName = name || `Ghost CRO - Optimized [${new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })}]`

  const response = await fetch(
    `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/themes.json`,
    {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        theme: {
          name: sandboxName,
          role: "unpublished",
          src: `shopify://themes/${sourceThemeId}`,
        },
      }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    
    // Check for permission errors
    if (response.status === 403 || error.includes("permission") || error.includes("scope")) {
      throw new ThemeSandboxError(
        "Permission denied. Please ensure your Shopify app has the 'write_themes' scope enabled.",
        "PERMISSION_DENIED"
      )
    }
    
    // Check for rate limiting
    if (response.status === 429) {
      throw new ThemeSandboxError(
        "Rate limited by Shopify. Please wait a moment and try again.",
        "RATE_LIMITED"
      )
    }
    
    throw new ThemeSandboxError(`Failed to create sandbox theme: ${error}`, "API_ERROR")
  }

  const data = await response.json()
  return data.theme
}

/**
 * Get a specific asset from a theme
 */
export async function getThemeAsset(
  config: ShopifyThemeConfig,
  themeId: number,
  assetKey: string
): Promise<ShopifyAsset | null> {
  const { shop, accessToken } = config
  
  const response = await fetch(
    `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/themes/${themeId}/assets.json?asset[key]=${encodeURIComponent(assetKey)}`,
    {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    }
  )

  if (!response.ok) {
    if (response.status === 404) {
      return null
    }
    const error = await response.text()
    throw new Error(`Failed to fetch asset: ${error}`)
  }

  const data = await response.json()
  return data.asset
}

/**
 * Update or create an asset in a theme
 */
export async function updateThemeAsset(
  config: ShopifyThemeConfig,
  themeId: number,
  assetKey: string,
  value: string
): Promise<ShopifyAsset> {
  const { shop, accessToken } = config
  
  const response = await fetch(
    `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/themes/${themeId}/assets.json`,
    {
      method: "PUT",
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        asset: {
          key: assetKey,
          value: value,
        },
      }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    
    if (response.status === 403) {
      throw new ThemeSandboxError(
        "Permission denied when updating theme asset. Please check your app's 'write_themes' scope.",
        "PERMISSION_DENIED"
      )
    }
    
    throw new ThemeSandboxError(`Failed to update asset: ${error}`, "API_ERROR")
  }

  const data = await response.json()
  return data.asset
}

/**
 * Get the preview URL for a theme
 */
export function getThemePreviewUrl(shop: string, themeId: number): string {
  // Remove .myshopify.com if present for the preview URL
  const storeDomain = shop.replace(".myshopify.com", "")
  return `https://${storeDomain}.myshopify.com/?preview_theme_id=${themeId}`
}

/**
 * Inject a code fix into a theme asset
 * 
 * Intelligently merges the new code with existing content
 */
export async function injectCodeFix(
  config: ShopifyThemeConfig,
  themeId: number,
  codeFix: CodeFix
): Promise<{ success: boolean; assetKey: string; error?: string }> {
  try {
    const assetKey = codeFix.targetFile
    
    // Get the current asset content
    const existingAsset = await getThemeAsset(config, themeId, assetKey)
    let currentContent = existingAsset?.value || ""
    
    // Determine where to inject the code
    let updatedContent: string = ""
    
    if (codeFix.type === "css") {
      // For CSS, append to the end of the file or create a new ghost-fixes.css
      const cssAssetKey = "assets/ghost-fixes.css"
      const existingCss = await getThemeAsset(config, themeId, cssAssetKey)
      
      const ghostHeader = `/* Ghost CRO Fix: ${codeFix.targetLocation} */\n`
      const newCss = existingCss?.value 
        ? `${existingCss.value}\n\n${ghostHeader}${codeFix.optimizedCode}`
        : `/* Ghost CRO Optimizations */\n\n${ghostHeader}${codeFix.optimizedCode}`
      
      await updateThemeAsset(config, themeId, cssAssetKey, newCss)
      
      // Also ensure the CSS is included in theme.liquid
      const themeLiquid = await getThemeAsset(config, themeId, "layout/theme.liquid")
      if (themeLiquid?.value && !themeLiquid.value.includes("ghost-fixes.css")) {
        const cssInclude = `{{ 'ghost-fixes.css' | asset_url | stylesheet_tag }}`
        const updatedThemeLiquid = themeLiquid.value.replace(
          "</head>",
          `  ${cssInclude}\n</head>`
        )
        await updateThemeAsset(config, themeId, "layout/theme.liquid", updatedThemeLiquid)
      }
      
      return { success: true, assetKey: cssAssetKey }
    }
    
    if (codeFix.type === "liquid" || codeFix.type === "html") {
      // For Liquid/HTML, we need to find the right injection point
      // This is a simplified approach - in production you'd want more sophisticated merging
      
      const ghostMarker = `{%- comment -%} Ghost CRO Fix: ${codeFix.targetLocation} {%- endcomment -%}`
      
      // Check if this fix has already been applied
      if (currentContent.includes(ghostMarker)) {
        return { 
          success: true, 
          assetKey,
          error: "Fix already applied to this theme"
        }
      }
      
      // Try to find a good injection point based on the target location
      const targetLocation = codeFix.targetLocation.toLowerCase()
      
      if (targetLocation.includes("below add-to-cart") || targetLocation.includes("after add-to-cart")) {
        // Look for add to cart button and inject after
        const patterns = [
          /(<button[^>]*type=["']submit["'][^>]*>[\s\S]*?<\/button>)/i,
          /(product-form__submit)/i,
          /({%[-\s]*form\s+['"]product['"][^%]*%}[\s\S]*?{%[-\s]*endform[-\s]*%})/i,
        ]
        
        for (const pattern of patterns) {
          if (pattern.test(currentContent)) {
            updatedContent = currentContent.replace(
              pattern,
              `$1\n\n${ghostMarker}\n${codeFix.optimizedCode}`
            )
            break
          }
        }
      } else if (targetLocation.includes("below description") || targetLocation.includes("after description")) {
        // Look for product description and inject after
        const patterns = [
          /(product\.description[^}]*}})/i,
          /(class=["'][^"']*description[^"']*["'][\s\S]*?<\/div>)/i,
        ]
        
        for (const pattern of patterns) {
          if (pattern.test(currentContent)) {
            updatedContent = currentContent.replace(
              pattern,
              `$1\n\n${ghostMarker}\n${codeFix.optimizedCode}`
            )
            break
          }
        }
      }
      
      // If no specific location found, append before closing main content
      if (updatedContent === "") {
        // Try to find end of main content area
        const endPatterns = [
          /(<\/main>)/i,
          /({%[-\s]*endblock[-\s]*%})/i,
          /(<\/article>)/i,
          /(<\/section>)\s*$/i,
        ]
        
        for (const pattern of endPatterns) {
          if (pattern.test(currentContent)) {
            updatedContent = currentContent.replace(
              pattern,
              `\n${ghostMarker}\n${codeFix.optimizedCode}\n$1`
            )
            break
          }
        }
      }
      
      // Last resort: append to end of file
      if (updatedContent === "") {
        updatedContent = `${currentContent}\n\n${ghostMarker}\n${codeFix.optimizedCode}`
      }
      
      await updateThemeAsset(config, themeId, assetKey, updatedContent)
      return { success: true, assetKey }
    }
    
    // For JavaScript
    if (codeFix.type === "javascript") {
      const jsAssetKey = "assets/ghost-fixes.js"
      const existingJs = await getThemeAsset(config, themeId, jsAssetKey)
      
      const jsHeader = `// Ghost CRO Fix: ${codeFix.targetLocation}\n`
      const newJs = existingJs?.value 
        ? `${existingJs.value}\n\n${jsHeader}${codeFix.optimizedCode}`
        : `// Ghost CRO Optimizations\n\n${jsHeader}${codeFix.optimizedCode}`
      
      await updateThemeAsset(config, themeId, jsAssetKey, newJs)
      
      // Ensure JS is included in theme.liquid
      const themeLiquid = await getThemeAsset(config, themeId, "layout/theme.liquid")
      if (themeLiquid?.value && !themeLiquid.value.includes("ghost-fixes.js")) {
        const jsInclude = `<script src="{{ 'ghost-fixes.js' | asset_url }}" defer></script>`
        const updatedThemeLiquid = themeLiquid.value.replace(
          "</body>",
          `  ${jsInclude}\n</body>`
        )
        await updateThemeAsset(config, themeId, "layout/theme.liquid", updatedThemeLiquid)
      }
      
      return { success: true, assetKey: jsAssetKey }
    }
    
    return { success: false, assetKey: "", error: `Unsupported code type: ${codeFix.type}` }
    
  } catch (error) {
    return { 
      success: false, 
      assetKey: codeFix.targetFile,
      error: error instanceof Error ? error.message : "Unknown error"
    }
  }
}

/**
 * Deploy multiple fixes to a sandbox theme
 */
export async function deployFixesToSandbox(
  config: ShopifyThemeConfig,
  fixes: Array<{ id: string; codeFix: CodeFix }>,
  options: { createNewSandbox?: boolean; existingSandboxId?: number } = {}
): Promise<DeploymentResult> {
  try {
    let sandboxThemeId: number
    let sandboxThemeName: string
    
    if (options.existingSandboxId) {
      // Use existing sandbox
      sandboxThemeId = options.existingSandboxId
      const themes = await getThemes(config)
      const sandbox = themes.find(t => t.id === options.existingSandboxId)
      sandboxThemeName = sandbox?.name || "Ghost CRO Sandbox"
    } else {
      // Create new sandbox from active theme
      const activeTheme = await getActiveTheme(config)
      if (!activeTheme) {
        throw new ThemeSandboxError("No active theme found", "THEME_NOT_FOUND")
      }
      
      const sandbox = await duplicateTheme(config, activeTheme.id)
      sandboxThemeId = sandbox.id
      sandboxThemeName = sandbox.name
      
      // Wait for theme to finish processing
      await waitForThemeReady(config, sandboxThemeId)
    }
    
    // Inject each fix
    const assetsUpdated: string[] = []
    const errors: string[] = []
    
    for (const fix of fixes) {
      const result = await injectCodeFix(config, sandboxThemeId, fix.codeFix)
      if (result.success) {
        assetsUpdated.push(result.assetKey)
      } else if (result.error) {
        errors.push(`Fix ${fix.id}: ${result.error}`)
      }
    }
    
    if (errors.length > 0 && assetsUpdated.length === 0) {
      return {
        success: false,
        error: errors.join("; "),
        errorCode: "API_ERROR",
      }
    }
    
    return {
      success: true,
      themeId: sandboxThemeId,
      themeName: sandboxThemeName,
      previewUrl: getThemePreviewUrl(config.shop, sandboxThemeId),
      assetsUpdated,
    }
    
  } catch (error) {
    if (error instanceof ThemeSandboxError) {
      return {
        success: false,
        error: error.message,
        errorCode: error.code,
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      errorCode: "API_ERROR",
    }
  }
}

/**
 * Wait for a theme to finish processing after duplication
 */
async function waitForThemeReady(
  config: ShopifyThemeConfig,
  themeId: number,
  maxAttempts: number = 30,
  delayMs: number = 2000
): Promise<void> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const themes = await getThemes(config)
    const theme = themes.find(t => t.id === themeId)
    
    if (theme && !theme.processing) {
      return
    }
    
    await new Promise(resolve => setTimeout(resolve, delayMs))
  }
  
  throw new ThemeSandboxError(
    "Theme duplication timed out. Please try again.",
    "API_ERROR"
  )
}

/**
 * Find existing Ghost sandbox themes
 */
export async function findGhostSandboxes(config: ShopifyThemeConfig): Promise<ShopifyTheme[]> {
  const themes = await getThemes(config)
  return themes.filter(theme => 
    theme.name.toLowerCase().includes("ghost cro") && 
    theme.role === "unpublished"
  )
}

/**
 * Delete a sandbox theme
 */
export async function deleteSandboxTheme(
  config: ShopifyThemeConfig,
  themeId: number
): Promise<boolean> {
  const { shop, accessToken } = config
  
  const response = await fetch(
    `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/themes/${themeId}.json`,
    {
      method: "DELETE",
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    }
  )

  return response.ok
}

/**
 * Publish a theme to make it live
 * 
 * @param config - Shopify client configuration
 * @param themeId - ID of the theme to publish
 */
export async function publishTheme(
  config: ShopifyThemeConfig,
  themeId: number
): Promise<{ success: boolean; error?: string }> {
  const { shop, accessToken } = config
  
  const response = await fetch(
    `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/themes/${themeId}.json`,
    {
      method: "PUT",
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        theme: {
          id: themeId,
          role: "main",
        },
      }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    
    if (response.status === 403) {
      throw new ThemeSandboxError(
        "Permission denied when publishing theme. Please check your app's 'write_themes' scope.",
        "PERMISSION_DENIED"
      )
    }
    
    throw new ThemeSandboxError(`Failed to publish theme: ${error}`, "API_ERROR")
  }

  return { success: true }
}

/**
 * Custom error class for theme sandbox operations
 */
export class ThemeSandboxError extends Error {
  code: "PERMISSION_DENIED" | "THEME_NOT_FOUND" | "API_ERROR" | "RATE_LIMITED"
  
  constructor(
    message: string, 
    code: "PERMISSION_DENIED" | "THEME_NOT_FOUND" | "API_ERROR" | "RATE_LIMITED"
  ) {
    super(message)
    this.name = "ThemeSandboxError"
    this.code = code
  }
}

