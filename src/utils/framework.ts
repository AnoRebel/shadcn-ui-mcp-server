/**
 * Framework selection utility for shadcn/ui MCP server
 *
 * This module handles switching between Vue, React and Svelte implementations
 * based on environment variables or command line arguments.
 *
 * Usage:
 * - Set FRAMEWORK environment variable to 'vue', 'react' or 'svelte'
 * - Or use --framework command line argument
 * - Defaults to 'react' if not specified
 */

import { logInfo, logWarning } from "./logger.js"

// Framework types
export type Framework = "vue" | "react" | "svelte"

// Default framework
const DEFAULT_FRAMEWORK: Framework = "vue"

/**
 * Get the current framework from environment or command line arguments
 * @returns The selected framework ('vue' or 'react' or 'svelte')
 */
export function getFramework(): Framework {
  // Check command line arguments first
  const args = process.argv.slice(2)
  const frameworkIndex = args.findIndex(arg => arg === "--framework" || arg === "-f")

  if (frameworkIndex !== -1 && args[frameworkIndex + 1]) {
    const framework = args[frameworkIndex + 1].toLowerCase() as Framework
    if (framework === "react" || framework === "svelte" || framework === "vue") {
      logInfo(`Framework set to '${framework}' via command line argument`)
      return framework
    } else {
      logWarning(`Invalid framework '${framework}' specified. Using default '${DEFAULT_FRAMEWORK}'`)
    }
  }

  // Check environment variable
  const envFramework = process.env.FRAMEWORK?.toLowerCase() as Framework
  if (envFramework === "react" || envFramework === "svelte" || envFramework === "vue") {
    logInfo(`Framework set to '${envFramework}' via environment variable`)
    return envFramework
  }

  // Return default
  logInfo(`Using default framework: '${DEFAULT_FRAMEWORK}'`)
  return DEFAULT_FRAMEWORK
}

/**
 * Get the axios implementation based on the current framework
 * @returns The appropriate axios implementation
 */
export async function getAxiosImplementation() {
  const framework = getFramework()

  if (framework === "vue") {
    // Dynamic import for Svelte implementation
    return import("./axios-vue.js").then(module => module.axios)
  } else if (framework === "svelte") {
    // Dynamic import for Svelte implementation
    return import("./axios-svelte.js").then(module => module.axios)
  } else {
    // Dynamic import for React implementation (default)
    return import("./axios.js").then(module => module.axios)
  }
}

/**
 * Get framework-specific information for help text
 * @returns Framework information object
 */
export function getFrameworkInfo() {
  const framework = getFramework()
  const getRepo = () => {
    if (framework === "vue") {
      return {
        repo: "unovue/shadcn-vue",
        extension: ".vue",
        description: "Vue components from shadcn-vue v4",
      }
    } else if (framework === "svelte") {
      return {
        repo: "huntabyte/shadcn-svelte",
        extension: ".svelte",
        description: "Svelte components from shadcn-svelte",
      }
    } else {
      return {
        repo: "shadcn-ui/ui",
        extension: ".tsx",
        description: "React components from shadcn/ui v4",
      }
    }
  }

  return {
    current: framework,
    repository: getRepo().repo,
    fileExtension: getRepo().extension,
    description: getRepo().description,
  }
}

/**
 * Validate framework selection and provide helpful feedback
 */
export function validateFrameworkSelection() {
  const framework = getFramework()
  const info = getFrameworkInfo()

  logInfo(`MCP Server configured for ${framework.toUpperCase()} framework`)
  logInfo(`Repository: ${info.repository}`)
  logInfo(`File extension: ${info.fileExtension}`)
  logInfo(`Description: ${info.description}`)

  // Provide helpful information about switching frameworks
  if (framework === "vue") {
    logInfo("To switch to Vue: set FRAMEWORK=vue or use --framework vue")
  } else if (framework === "svelte") {
    logInfo("To switch to Svelte: set FRAMEWORK=svelte or use --framework svelte")
  } else {
    logInfo("To switch to React: set FRAMEWORK=react or use --framework react")
  }
}
