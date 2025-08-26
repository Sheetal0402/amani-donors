import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'login',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'donor-trip',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'donor-promises',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'admin/how-to',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'donor-trip/:id',
    renderMode: RenderMode.Server // Use server rendering for dynamic routes
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
