// SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-Dopamine-Commercial
// Copyright (c) 2026 Abid109. Licensed under the GNU AGPL-3.0 (see LICENSE) or, by separate written
// agreement, a commercial license (see COMMERCIAL-LICENSE.md). All other rights reserved.
/* Dopamine - map styles for the Run tab
 * Builds MapLibre GL style documents (vector maps) from one set of layer rules plus a colour palette per look.
 * The data comes from the OpenMapTiles schema (served by OpenFreeMap); hill shading uses open elevation tiles.
 * "classic" is the original raster OpenStreetMap map (also used when WebGL is missing or Smooth mode is on).
 *
 *   MapStyles.list            [{ id, name, note, vector }]
 *   MapStyles.build(id)       MapLibre style object for a vector look
 *   MapStyles.attribution(id) text for the map credit line
 *   MapStyles.previewSvg(id)  small inline picture used in Settings
 *   MapStyles.setSources(o)   change where the data comes from (tests, or a self-hosted copy)
 */
(function (g) {
  'use strict';

  // Where the map data comes from. To use another provider or a self-hosted copy, change these (or call setSources).
  var SRC = {
    omtUrl: 'https://tiles.openfreemap.org/planet',                                   // TileJSON of the vector tiles
    omtTiles: null,                                                                    // or a plain {z}/{x}/{y} list instead of the TileJSON
    glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',             // label fonts
    demTiles: 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png' // elevation (Terrarium encoding)
  };
  var FONT = { r: ['Noto Sans Regular'], b: ['Noto Sans Bold'], i: ['Noto Sans Italic'] };

  // ---------- palettes ----------
  // bg land | wood/grass/farm/sand/wetland/park/urban/ind landcover | water, waterEdge | bld, bldLine
  // roads: [fill, casing] for motorway, primary, secondary (secondary+tertiary), minor | path | lbl text/halo/water
  var PAL = {
    light: {
      name: 'Standard', note: 'Light and familiar',
      bg: '#f2efe9', wood: '#d3e5c1', grass: '#e1edd2', farm: '#ecf0da', sand: '#f2e9c9', wetland: '#d9eadf', park: '#cde7b9', urban: '#ebe6de', ind: '#e6e0e6', water: '#aad3df', waterEdge: null,
      bld: '#dcd3cb', bldLine: '#cdc3b9',
      rd: { mot: ['#fcd68a', '#e0a93f'], pri: ['#fde9b0', '#e3c27a'], sec: ['#ffffff', '#cdc7bd'], min: ['#ffffff', '#d6d0c6'] }, path: ['#b9a99a', 1],
      lbl: { text: '#4a4a4a', halo: '#ffffff', water: '#5d8da4', place: '#333333' },
      hill: { shadow: 'rgba(120,110,95,0.30)', high: 'rgba(255,255,255,0.45)', accent: 'rgba(120,110,95,0.10)', exag: 0.45 }
    },
    dark: {
      name: 'Dark', note: 'Easy on the eyes at night',
      bg: '#1b1d22', wood: '#1f2a24', grass: '#20262a', farm: '#1e2125', sand: '#24242a', wetland: '#1d2a2e', park: '#1f2c26', urban: '#202328', ind: '#1e1f24', water: '#0d0f13', waterEdge: null,
      bld: '#272a31', bldLine: '#30343c',
      rd: { mot: ['#5f6472', '#14151a'], pri: ['#535865', '#14151a'], sec: ['#40444e', '#17181d'], min: ['#32353d', '#1b1d22'] }, path: ['#555a66', 1],
      lbl: { text: '#9aa0ac', halo: '#15161a', water: '#4a5260', place: '#c3c8d2' },
      hill: { shadow: 'rgba(0,0,0,0.45)', high: 'rgba(255,255,255,0.06)', accent: 'rgba(0,0,0,0.2)', exag: 0.5 }
    },
    navy: {
      name: 'Navy & amber', note: 'Navy water, amber roads',
      bg: '#f7f7f9', wood: '#e2e7f0', grass: '#eef0f6', farm: '#f2f3f8', sand: '#f5f2ea', wetland: '#e4e9f3', park: '#e7ebf2', urban: '#f7f7f9', ind: '#eceef4', water: '#2c3a5e', waterEdge: null,
      bld: '#273253', bldLine: null,
      rd: { mot: ['#e8962a', '#f7f7f9'], pri: ['#ee9f33', '#f7f7f9'], sec: ['#f1b04a', '#f7f7f9'], min: ['#f4c06c', '#f7f7f9'] }, path: ['#c9a063', 1],
      lbl: { text: '#2c3a5e', halo: '#f7f7f9', water: '#b9c4e0', place: '#1f2a4a' }
    },
    brick: {
      name: 'Brick & sand', note: 'Sand land, red buildings',
      bg: '#e5d9b9', wood: '#c6cd9b', grass: '#d8d5a7', farm: '#ded8ae', sand: '#ecdfb3', wetland: '#c5d1b6', park: '#cfd1a6', urban: '#e5d9b9', ind: '#dccfae', water: '#4d84a2', waterEdge: null,
      bld: '#b04a2f', bldLine: '#8e3a24',
      rd: { mot: ['#ffffff', '#bfae82'], pri: ['#ffffff', '#c3b387'], sec: ['#f8f3e6', '#cdbf99'], min: ['#f8f3e6', '#d3c59f'] }, path: ['#a98f68', 1],
      lbl: { text: '#7a3a28', halo: '#e5d9b9', water: '#d6e6ee', place: '#6a2d1c' },
      hill: { shadow: 'rgba(120,90,50,0.28)', high: 'rgba(255,248,230,0.35)', accent: 'rgba(120,90,50,0.10)', exag: 0.4 }
    },
    blue: {
      name: 'Blue night', note: 'Deep blue with light roads',
      bg: '#0b3470', wood: '#0d3a7a', grass: '#0c3875', farm: '#0c3672', sand: '#0e3c78', wetland: '#0d3b7d', park: '#0e3d80', urban: '#0b3470', ind: '#0a3269', water: '#031230', waterEdge: null,
      bld: null, bldLine: null,
      rd: { mot: ['#d6e5fb', null], pri: ['#c1d7f6', null], sec: ['#9bbbe8', null], min: ['#6f9ad6', null] }, path: ['#5f88c6', 1],
      lbl: { text: '#a8c6ef', halo: '#0b3470', water: '#5f86bf', place: '#d4e4fb' }
    },
    violet: {
      name: 'Violet', note: 'Purple with white roads',
      bg: '#4b3a9e', wood: '#4f3ea4', grass: '#4d3ca1', farm: '#4c3b9f', sand: '#503fa4', wetland: '#5342a9', park: '#523fa8', urban: '#4b3a9e', ind: '#47379a', water: '#7e63c9', waterEdge: null,
      bld: null, bldLine: null,
      rd: { mot: ['#ffffff', null], pri: ['#f6f1ff', null], sec: ['#e7defa', null], min: ['#d4c8f3', null] }, path: ['#b9a8ec', 1],
      lbl: { text: '#e9e1ff', halo: '#4b3a9e', water: '#d6c9f7', place: '#ffffff' }
    },
    mono: {
      name: 'Black & white', note: 'Pure roads, no clutter',
      bg: '#050505', wood: '#080808', grass: '#070707', farm: '#060606', sand: '#070707', wetland: '#080808', park: '#0b0b0b', urban: '#050505', ind: '#050505', water: '#000000', waterEdge: null,
      bld: null, bldLine: null,
      rd: { mot: ['#ffffff', null], pri: ['#f1f1f1', null], sec: ['#d4d4d4', null], min: ['#a9a9a9', null] }, path: ['#777777', 1],
      lbl: { text: '#a0a0a0', halo: '#050505', water: '#555555', place: '#e6e6e6' }
    },
    midnight: {
      name: 'Midnight terrain', note: 'Dark ridges, glowing streets',
      bg: '#050f22', wood: '#06142b', grass: '#061229', farm: '#061229', sand: '#071731', wetland: '#082044', park: '#07173a', urban: '#0a2346', ind: '#08203f', water: '#08306a', waterEdge: '#7dbef5',
      bld: '#0d2c58', bldLine: null,
      rd: { mot: ['#ff9a5c', null], pri: ['#f08a4f', null], sec: ['#d9a07a', null], min: ['rgba(125,185,255,0.55)', null] }, path: ['rgba(125,185,255,0.3)', 1], glow: '#ff8a3d', mesh: true,
      lbl: { text: '#e5efff', halo: 'rgba(4,20,46,0.92)', water: '#8fbcf0', place: '#f2f7ff', pill: true },
      hill: { shadow: '#01060f', high: '#3b7dbb', accent: '#1d4f86', exag: 0.95 }
    },
    trail: {
      name: 'Trail guide', note: 'Forest greens, river, dotted trails',
      bg: '#eee4c7', wood: '#548a5a', grass: '#a8c798', farm: '#dfe0b6', sand: '#efe0b0', wetland: '#a6cfc0', park: '#79a375', urban: '#e6dcbf', ind: '#e0d6b8', water: '#8fc7db', waterEdge: '#5a9eb8',
      bld: '#d6c9a4', bldLine: '#b8a97f',
      rd: { mot: ['#b3a384', '#f6eed6'], pri: ['#b3a384', '#f6eed6'], sec: ['#b9aa8c', '#f6eed6'], min: ['#c4b698', '#f6eed6'] }, path: ['#25231e', 2.4], riverW: 2.6, refs: true, pathDots: true,
      lbl: { text: '#5c4a2e', halo: '#eee4c7', water: '#3f7f99', place: '#4a3a22' },
      hill: { shadow: 'rgba(80,60,30,0.28)', high: 'rgba(255,250,235,0.35)', accent: 'rgba(80,60,30,0.10)', exag: 0.45 }
    },
    relief: {
      name: 'Relief & water', note: 'Shaded relief, teal water',
      bg: '#e9e5d6', wood: '#c4d4b6', grass: '#e2e4cf', farm: '#e6e6d2', sand: '#efe6c8', wetland: '#bcd9ec', park: '#d3dfc3', urban: '#e2dece', ind: '#dedacb', water: '#2d6f80', waterEdge: null,
      bld: null, bldLine: null,
      rd: { mot: ['#ffffff', '#c3bda4'], pri: ['#ffffff', '#cbc5ac'], sec: ['#f6f3e8', '#d3cdb5'], min: ['#f1eee2', '#dcd6bf'] }, path: ['#a99f82', 1], riverW: 1.8, riverColor: '#2f6f8c',
      lbl: { text: '#3b3b36', halo: '#e9e5d6', water: '#d8eef2', place: '#2a2a26' },
      hill: { shadow: '#8f8870', high: '#fffdf5', accent: '#c4bda2', exag: 0.9 }
    }
  };

  var ORDER = ['classic', 'light', 'dark', 'navy', 'brick', 'blue', 'violet', 'mono', 'midnight', 'trail', 'relief'];
  var LIST = ORDER.map(function (id) {
    if (id === 'classic') return { id: id, name: 'Classic', note: 'OpenStreetMap (default)', vector: false };
    return { id: id, name: PAL[id].name, note: PAL[id].note, vector: true };
  });

  // ---------- helpers ----------
  // Line width in pixels that grows with zoom. The layer's own minzoom decides where it first shows.
  function zw(base) { return ['interpolate', ['exponential', 1.5], ['zoom'], 4, base * 0.1, 12, base * 0.55, 15, base * 1.5, 19, base * 4.5]; }
  function cls(list) { return ['in', ['get', 'class'], ['literal', list]]; }
  function lines() { return ['==', ['geometry-type'], 'LineString']; }
  var NAME = ['coalesce', ['get', 'name:latin'], ['get', 'name']];

  function build(id) {
    var p = PAL[id]; if (!p) return null;
    var L = [], v = 'omt';
    function fill(idd, layer, filter, color, extra) {
      if (!color) return;
      var l = { id: idd, type: 'fill', source: v, 'source-layer': layer, paint: { 'fill-color': color } };
      if (filter) l.filter = filter;
      if (extra) for (var k in extra) l.paint[k] = extra[k];
      L.push(l);
    }

    L.push({ id: 'bg', type: 'background', paint: { 'background-color': p.bg } });

    // land cover and land use
    fill('lc-wood', 'landcover', ['==', ['get', 'class'], 'wood'], p.wood);
    fill('lc-grass', 'landcover', ['==', ['get', 'class'], 'grass'], p.grass);
    fill('lc-farm', 'landcover', ['==', ['get', 'class'], 'farmland'], p.farm);
    fill('lc-sand', 'landcover', cls(['sand', 'rock']), p.sand);
    fill('lc-wet', 'landcover', ['==', ['get', 'class'], 'wetland'], p.wetland);
    fill('lu-urban', 'landuse', cls(['residential', 'suburb', 'neighbourhood', 'commercial', 'retail']), p.urban);
    fill('lu-ind', 'landuse', cls(['industrial', 'garages', 'railway', 'quarry']), p.ind);
    fill('lu-green', 'landuse', cls(['cemetery', 'pitch', 'playground', 'stadium', 'track', 'campsite', 'zoo', 'theme_park']), p.park);
    fill('park', 'park', null, p.park, { 'fill-opacity': 0.85 });

    // hill shading from elevation tiles
    if (p.hill) L.push({ id: 'hill', type: 'hillshade', source: 'dem', paint: { 'hillshade-shadow-color': p.hill.shadow, 'hillshade-highlight-color': p.hill.high, 'hillshade-accent-color': p.hill.accent, 'hillshade-exaggeration': p.hill.exag, 'hillshade-illumination-direction': 315 } });

    // water
    var wp = { 'fill-color': p.water, 'fill-antialias': true };
    if (p.waterEdge) wp['fill-outline-color'] = p.waterEdge;
    L.push({ id: 'water', type: 'fill', source: v, 'source-layer': 'water', paint: wp });
    var rc = p.riverColor || p.water, rw = p.riverW || 1.2;
    if (p.waterEdge) L.push({ id: 'ww-edge', type: 'line', source: v, 'source-layer': 'waterway', filter: cls(['river', 'canal']), layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': p.waterEdge, 'line-width': zw(rw * 1.35, 8) } });
    L.push({ id: 'ww-river', type: 'line', source: v, 'source-layer': 'waterway', filter: cls(['river', 'canal']), layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': rc, 'line-width': zw(rw, 8) } });
    L.push({ id: 'ww-stream', type: 'line', source: v, 'source-layer': 'waterway', filter: cls(['stream', 'ditch', 'drain']), minzoom: 11, layout: { 'line-cap': 'round' }, paint: { 'line-color': p.waterEdge ? p.water : rc, 'line-width': zw(0.55 + (p.riverW ? 0.3 : 0), 11) } });

    // buildings
    if (p.bld) {
      var bp = { 'fill-color': p.bld, 'fill-opacity': ['interpolate', ['linear'], ['zoom'], 13, 0, 14.2, 1] };
      if (p.bldLine) bp['fill-outline-color'] = p.bldLine;
      L.push({ id: 'building', type: 'fill', source: v, 'source-layer': 'building', minzoom: 13, paint: bp });
    }

    // railways
    L.push({ id: 'rail', type: 'line', source: v, 'source-layer': 'transportation', minzoom: 11, filter: ['all', lines(), cls(['rail'])], paint: { 'line-color': p.rd.sec[0], 'line-opacity': 0.7, 'line-width': zw(0.7, 11), 'line-dasharray': [3, 2] } });

    // roads: glow, casing, fill (smallest class first so bigger roads draw on top)
    var G = [
      { id: 'min', cl: ['minor', 'service'], w: 1.5, z: 12, c: p.rd.min },
      { id: 'ter', cl: ['tertiary'], w: 1.9, z: 10, c: p.rd.sec },
      { id: 'sec', cl: ['secondary'], w: 2.2, z: 9, c: p.rd.sec },
      { id: 'pri', cl: ['primary'], w: 2.6, z: 7, c: p.rd.pri },
      { id: 'trk', cl: ['trunk'], w: 3, z: 6, c: p.rd.mot },
      { id: 'mot', cl: ['motorway'], w: 3.4, z: 5, c: p.rd.mot }
    ];
    var tun = ['case', ['==', ['get', 'brunnel'], 'tunnel'], 0.45, 1];
    var thin = p.mesh ? 0.55 : 1;
    if (p.glow) G.slice(2).forEach(function (r) {
      L.push({ id: 'glow-' + r.id, type: 'line', source: v, 'source-layer': 'transportation', minzoom: r.z, filter: ['all', lines(), cls(r.cl)], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': p.glow, 'line-opacity': 0.4, 'line-blur': 4, 'line-width': zw(r.w * 3.2, r.z) } });
    });
    G.forEach(function (r) {
      var f = ['all', lines(), cls(r.cl)];
      if (r.id === 'min') f = ['all', lines(), ['any', ['==', ['get', 'class'], 'minor'], ['all', ['==', ['get', 'class'], 'service'], ['>=', ['zoom'], 14.5]]]];
      if (r.c[1]) L.push({ id: 'rc-' + r.id, type: 'line', source: v, 'source-layer': 'transportation', minzoom: r.z, filter: f, layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': r.c[1], 'line-opacity': tun, 'line-width': zw(r.w + 1.6, r.z) } });
    });
    G.forEach(function (r) {
      var f = ['all', lines(), cls(r.cl)];
      if (r.id === 'min') f = ['all', lines(), ['any', ['==', ['get', 'class'], 'minor'], ['all', ['==', ['get', 'class'], 'service'], ['>=', ['zoom'], 14.5]]]];
      L.push({ id: 'rf-' + r.id, type: 'line', source: v, 'source-layer': 'transportation', minzoom: r.z, filter: f, layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': r.c[0], 'line-opacity': tun, 'line-width': zw(r.w * (r.id === 'min' ? thin : 1) * (p.mesh && r.id !== 'min' ? 0.75 : 1), r.z) } });
    });

    // paths and tracks (dotted for the trail look)
    var pd = p.pathDots ? [0.6, 1.8] : [2, 2];
    L.push({ id: 'path', type: 'line', source: v, 'source-layer': 'transportation', minzoom: p.pathDots ? 11 : 13, filter: ['all', lines(), cls(['path', 'track', 'pedestrian'])], layout: { 'line-cap': p.pathDots ? 'round' : 'butt' }, paint: { 'line-color': p.path[0], 'line-width': zw(p.path[1], 11), 'line-dasharray': pd } });

    // admin boundaries
    L.push({ id: 'boundary', type: 'line', source: v, 'source-layer': 'boundary', filter: ['all', ['<=', ['get', 'admin_level'], 4], ['!=', ['get', 'maritime'], 1]], paint: { 'line-color': p.lbl.text, 'line-opacity': 0.35, 'line-width': 1, 'line-dasharray': [4, 3] } });

    // labels
    var halo = p.lbl.pill ? { 'text-halo-color': p.lbl.halo, 'text-halo-width': 3.6, 'text-halo-blur': 0 } : { 'text-halo-color': p.lbl.halo, 'text-halo-width': 1.6, 'text-halo-blur': 0.4 };
    function sym(idd, layer, filter, minz, text, font, size, color, extraLayout, extraPaint) {
      var lay = { 'text-field': text, 'text-font': font, 'text-size': size };
      for (var k in extraLayout) lay[k] = extraLayout[k];
      var pt = { 'text-color': color, 'text-halo-color': halo['text-halo-color'], 'text-halo-width': halo['text-halo-width'], 'text-halo-blur': halo['text-halo-blur'] };
      for (var k2 in extraPaint) pt[k2] = extraPaint[k2];
      var l = { id: idd, type: 'symbol', source: v, 'source-layer': layer, minzoom: minz, layout: lay, paint: pt };
      if (filter) l.filter = filter;
      L.push(l);
    }
    sym('lbl-water', 'water_name', null, 3, NAME, FONT.i, ['interpolate', ['linear'], ['zoom'], 3, 10, 12, 13], p.lbl.water, { 'text-letter-spacing': 0.25, 'text-max-width': 6 }, { 'text-halo-width': 0 });
    sym('lbl-road', 'transportation_name', cls(['motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'minor', 'service']), 13.5, NAME, FONT.r, ['interpolate', ['linear'], ['zoom'], 13, 9, 18, 13], p.lbl.text, { 'symbol-placement': 'line', 'text-rotation-alignment': 'map', 'text-max-angle': 30 }, {});
    if (p.refs) sym('lbl-ref', 'transportation_name', ['all', ['has', 'ref'], cls(['motorway', 'trunk', 'primary', 'secondary'])], 9, ['get', 'ref'], FONT.b, 9, '#222222', { 'symbol-placement': 'line', 'symbol-spacing': 320, 'text-rotation-alignment': 'viewport', 'text-max-angle': 90, 'text-padding': 8 }, { 'text-halo-color': '#ffffff', 'text-halo-width': 3, 'text-halo-blur': 0 });
    var pl = [['place-nbh', ['neighbourhood', 'quarter'], 14, ['interpolate', ['linear'], ['zoom'], 14, 10, 18, 13], FONT.r],
      ['place-sub', ['suburb'], 11, ['interpolate', ['linear'], ['zoom'], 11, 10, 16, 14], FONT.r],
      ['place-vil', ['village', 'hamlet', 'isolated_dwelling'], 9, ['interpolate', ['linear'], ['zoom'], 9, 10, 15, 13], FONT.r],
      ['place-town', ['town'], 7, ['interpolate', ['linear'], ['zoom'], 7, 11, 14, 17], FONT.b],
      ['place-city', ['city'], 4, ['interpolate', ['linear'], ['zoom'], 4, 11, 12, 20], FONT.b],
      ['place-state', ['state', 'province'], 3, 11, FONT.r],
      ['place-country', ['country'], 1, ['interpolate', ['linear'], ['zoom'], 1, 10, 6, 16], FONT.b]];
    pl.forEach(function (q) {
      sym(q[0], 'place', cls(q[1]), q[2], NAME, q[4], q[3], q[0] === 'place-nbh' || q[0] === 'place-sub' || q[0] === 'place-vil' ? p.lbl.text : p.lbl.place,
        { 'text-max-width': 8, 'text-transform': q[0] === 'place-country' || q[0] === 'place-state' ? 'uppercase' : 'none', 'text-letter-spacing': q[0] === 'place-country' ? 0.15 : 0 }, {});
    });

    var style = {
      version: 8, name: 'Dopamine ' + p.name,
      glyphs: SRC.glyphs,
      sources: {
        omt: SRC.omtTiles ? { type: 'vector', tiles: SRC.omtTiles, minzoom: 0, maxzoom: 14 } : { type: 'vector', url: SRC.omtUrl }
      },
      layers: L
    };
    if (p.hill) style.sources.dem = { type: 'raster-dem', tiles: [SRC.demTiles], tileSize: 256, maxzoom: 15, encoding: 'terrarium' };
    return style;
  }

  function attribution(id) {
    var s = '© OpenFreeMap © OpenMapTiles © OpenStreetMap';
    if (PAL[id] && PAL[id].hill) s += ' · Terrain: Mapzen/AWS';
    return s;
  }

  // Small preview for the Settings picker: land, water, roads and buildings in the look's own colours.
  function previewSvg(id) {
    if (id === 'classic') {
      return '<svg viewBox="0 0 120 70" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="120" height="70" fill="#f2efe9"/><path d="M0 0h34c-8 14 6 24-2 38S20 60 26 70H0z" fill="#aad3df"/><g stroke="#fff" stroke-width="3.2" fill="none"><path d="M0 44h120M52 0v70M84 0l-18 70"/></g><g stroke="#fcd68a" stroke-width="2.6" fill="none"><path d="M20 18l100 12"/></g><g fill="#d9d0c8"><rect x="58" y="6" width="8" height="6"/><rect x="92" y="38" width="10" height="7"/><rect x="60" y="50" width="9" height="8"/><rect x="100" y="8" width="8" height="8"/></g></svg>';
    }
    var p = PAL[id]; if (!p) return '';
    var main = p.rd.mot[0], minor = p.rd.min[0], hill = '';
    if (p.hill) hill = '<path d="M60 0h60v70H80c10-20-6-30 4-48S66 12 60 0z" fill="' + p.hill.shadow + '" opacity=".55"/>';
    var blds = p.bld ? '<g fill="' + p.bld + '"><rect x="58" y="6" width="8" height="6"/><rect x="92" y="38" width="10" height="7"/><rect x="60" y="50" width="9" height="8"/><rect x="100" y="8" width="8" height="8"/><rect x="72" y="34" width="7" height="6"/></g>' : '';
    return '<svg viewBox="0 0 120 70" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="120" height="70" fill="' + p.bg + '"/>' +
      '<path d="M60 0h18v70H20z" fill="' + p.park + '" opacity=".0"/>' + hill +
      '<path d="M0 0h34c-8 14 6 24-2 38S20 60 26 70H0z" fill="' + p.water + '"/>' +
      '<g stroke="' + minor + '" stroke-width="1.4" fill="none"><path d="M40 12h80M44 30h76M40 56h80M66 0v70M96 0v70"/></g>' +
      '<g stroke="' + main + '" stroke-width="2.6" fill="none"><path d="M0 44h120M52 0v70M20 18l100 12"/></g>' + blds + '</svg>';
  }

  g.MapStyles = {
    list: LIST,
    build: build,
    attribution: attribution,
    previewSvg: previewSvg,
    isVector: function (id) { return !!PAL[id]; },
    setSources: function (o) { for (var k in o) if (k in SRC) SRC[k] = o[k]; }
  };
})(window);
