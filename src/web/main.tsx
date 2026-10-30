import { StrictMode } from 'react'

import { createRouter, RouterProvider } from '@tanstack/react-router'

import { routeTree } from '@demo-project/web/routeTree.gen'

import { createRoot } from 'react-dom/client'

import './styles.css'

const router = createRouter({
  defaultPreload: 'intent',
  routeTree,
  scrollRestoration: true,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const root = document.getElementById('root')

if (root) {
  createRoot(root).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  )
}
