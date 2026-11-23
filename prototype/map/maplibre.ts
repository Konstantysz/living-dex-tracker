// PROTOTYPE (throwaway). Engine A: MapLibre GL. Game units are mapped linearly onto a small square of
// Web Mercator space (no distortion), so 0..5000 game units = 5% of the world.
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';

// Vite does not find the worker by itself ("Worker failed to load"): point MapLibre at it.
// (Cost of MapLibre in a Vite app, record in ADR 0004.)
maplibregl.setWorkerUrl(workerUrl);
import { W, HIT_R, type Area, type Factory } from './data';

const S = 0.05;
const toLL = (x: number, y: number): [number, number] => {
  const l = new maplibregl.MercatorCoordinate(0.5 + (x / W) * S, 0.5 + (y / W) * S, 0).toLngLat();
  return [l.lng, l.lat];
};
const zoomOf = (scale: number) => Math.log2((scale * W) / (S * 512));
const scaleOf = (z: number) => (2 ** z * S * 512) / W;

const selOpacity = (sel: string | null, hi: number, lo: number) =>
  ['case', ['==', ['get', 'id'], sel ?? ''], hi, lo] as never;

export const create: Factory = async (c) => {
  const fit = (Math.min(c.el.clientWidth, c.el.clientHeight) / W) * 0.9;
  const init = c.init ?? { x: W / 2, y: W / 2, scale: fit * 1.05 };
  const map = new maplibregl.Map({
    container: c.el,
    style: {
      version: 8,
      glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
      sources: {},
      layers: [{ id: 'bg', type: 'background', paint: { 'background-color': '#0b1e2d' } }],
    },
    center: toLL(init.x, init.y),
    zoom: zoomOf(init.scale),
    minZoom: zoomOf(fit),
    maxZoom: zoomOf(1.2),
    attributionControl: false,
    dragRotate: false,
    pitchWithRotate: false,
    canvasContextAttributes: { antialias: true },
  });
  map.touchZoomRotate.disableRotation();
  map.on('error', (e) => c.log(`maplibre: ${e.error?.message ?? e}`));
  await new Promise<void>((ok) => map.once('load', () => ok()));

  const url = URL.createObjectURL(await new Promise<Blob>((ok) => c.base.toBlob((b) => ok(b!))));
  map.addSource('base', {
    type: 'image',
    url,
    coordinates: [toLL(0, 0), toLL(W, 0), toLL(W, W), toLL(0, W)],
  });
  map.addLayer({
    id: 'base',
    type: 'raster',
    source: 'base',
    paint: { 'raster-resampling': 'linear' },
  });

  const poly = (a: Area) => {
    const ring: [number, number][] = [];
    for (let j = 0; j < a.pts.length; j += 2) ring.push(toLL(a.pts[j], a.pts[j + 1]));
    ring.push(ring[0]);
    return {
      type: 'Feature' as const,
      properties: { id: a.id, z: a.z, color: a.color },
      geometry: { type: 'Polygon' as const, coordinates: [ring] },
    };
  };
  map.addSource('areas', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: c.areas.map(poly) },
  });
  map.addSource('labels', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: c.areas.map((a) => ({
        type: 'Feature',
        properties: { id: a.id, z: a.z },
        geometry: { type: 'Point', coordinates: toLL(a.cx, a.cy) },
      })),
    },
  });
  map.addSource('markers', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: c.markers.map(([x, y]) => ({
        type: 'Feature',
        properties: {},
        geometry: { type: 'Point', coordinates: toLL(x, y) },
      })),
    },
  });
  map.addLayer({
    id: 'areas-fill',
    type: 'fill',
    source: 'areas',
    layout: { 'fill-sort-key': ['get', 'z'] },
    paint: { 'fill-color': ['get', 'color'], 'fill-opacity': selOpacity(null, 0.75, 0.35) },
  });
  map.addLayer({
    id: 'areas-line',
    type: 'line',
    source: 'areas',
    layout: { 'line-sort-key': ['get', 'z'] },
    paint: { 'line-color': '#fff', 'line-width': 1.2 },
  });
  map.addLayer({
    id: 'markers',
    type: 'circle',
    source: 'markers',
    paint: { 'circle-radius': 4, 'circle-color': '#ffd54a' },
  });
  map.addLayer({
    id: 'labels',
    type: 'symbol',
    source: 'labels',
    layout: {
      'text-field': ['get', 'id'],
      'text-font': ['Open Sans Regular'],
      'text-size': 12,
      'symbol-sort-key': ['*', -1, ['get', 'z']],
    },
    paint: { 'text-color': '#fff', 'text-halo-color': 'rgba(0,0,0,.7)', 'text-halo-width': 1.5 },
  });

  map.on('click', (e) => {
    const t = performance.now();
    const { x, y } = e.point;
    const f = map.queryRenderedFeatures(
      [
        [x - HIT_R, y - HIT_R],
        [x + HIT_R, y + HIT_R],
      ],
      { layers: ['areas-fill'] },
    );
    const best = f.reduce<(typeof f)[number] | null>(
      (m, g) => (!m || Number(g.properties.z) > Number(m.properties.z) ? g : m),
      null,
    );
    c.onPick(best ? String(best.properties.id) : null, performance.now() - t);
  });

  const getView = () => {
    const m = maplibregl.MercatorCoordinate.fromLngLat(map.getCenter());
    return { x: ((m.x - 0.5) / S) * W, y: ((m.y - 0.5) / S) * W, scale: scaleOf(map.getZoom()) };
  };
  return {
    setView: (v) => map.jumpTo({ center: toLL(v.x, v.y), zoom: zoomOf(v.scale) }),
    getView,
    setSelected: (id) => {
      map.setPaintProperty('areas-fill', 'fill-opacity', selOpacity(id, 0.75, 0.35));
      map.setPaintProperty('areas-line', 'line-width', [
        'case',
        ['==', ['get', 'id'], id ?? ''],
        3,
        1.2,
      ] as never);
    },
    destroy: () => map.remove(),
  };
};
