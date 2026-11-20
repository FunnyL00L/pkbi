/// <reference types="vite/client" />

declare module 'osmtogeojson' {
  import type { FeatureCollection } from 'geojson';
  function osmtogeojson(data: unknown, options?: Record<string, unknown>): FeatureCollection;
  export default osmtogeojson;
}

