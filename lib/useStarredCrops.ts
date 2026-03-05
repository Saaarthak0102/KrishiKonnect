'use client'

/**
 * Re-export the starred crops context hook.
 * This hook now uses the global StarredCropsContext for shared state across the app.
 * All components using this hook will see instant updates when any component toggles a star.
 */
export { useStarredCropsContext as useStarredCrops } from '@/context/StarredCropsContext'
