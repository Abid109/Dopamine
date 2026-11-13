# Third-party notices

Dopamine includes or is built with the open-source components below. Each keeps its own license. All of them are compatible with the AGPL-3.0 that applies to Dopamine's own code.

## Included in the app (`www/vendor/`)

| Component | License | Copyright | Where |
| --- | --- | --- | --- |
| [Leaflet](https://leafletjs.com) 1.9.4 | BSD-2-Clause | 2010-2023 Volodymyr Agafonkin, 2010-2011 CloudMade | `www/vendor/leaflet.js`, `leaflet.css`. License text: `www/vendor/LEAFLET-LICENSE.txt` |
| [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) | MIT | 2009 Kazuhiko Arase | `www/vendor/qrcode.js` (the notice is in the file header) |
| [jsQR](https://github.com/cozmo/jsQR) | Apache-2.0 | The jsQR authors | `www/vendor/jsQR.js`. License text: `licenses/Apache-2.0.txt` |
| [supabase-js](https://github.com/supabase/supabase-js) | MIT | The Supabase authors | `www/vendor/supabase.js` |
| [jsPDF](https://github.com/parallax/jsPDF) 2.5.1 | MIT | 2010-2021 James Hall, 2015-2021 yWorks GmbH | `www/vendor/jspdf.umd.min.js`. License text: `www/vendor/JSPDF-LICENSE.txt` |
| [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable) 3.8.2 | MIT | 2024 Simon Bengtsson | `www/vendor/jspdf.plugin.autotable.min.js`. License text: `www/vendor/JSPDF-AUTOTABLE-LICENSE.txt` |

## Fonts (`www/fonts/`)

Bundled so the app never loads fonts from the internet. The files come from the [Fontsource](https://fontsource.org) packages and are the Latin subset.

| Font | License | Copyright | License text |
| --- | --- | --- | --- |
| [Inter](https://rsms.me/inter/) | SIL Open Font License 1.1 | The Inter Project Authors | `www/fonts/OFL-Inter.txt` |
| [Newsreader](https://github.com/productiontype/Newsreader) | SIL Open Font License 1.1 | The Newsreader Project Authors | `www/fonts/OFL-Newsreader.txt` |
| [JetBrains Mono](https://www.jetbrains.com/lp/mono/) | SIL Open Font License 1.1 | The JetBrains Mono Project Authors | `www/fonts/OFL-JetBrains-Mono.txt` |

The fonts are used unmodified and are not sold on their own.

## Built into the app

| Component | License |
| --- | --- |
| Tailwind CSS (the generated `www/tailwind.css` contains its base styles) | MIT |
| Capacitor core and Android (`@capacitor/core`, `@capacitor/android`) | MIT |
| Capacitor plugins: filesystem, share, app, local-notifications, geolocation | MIT |
| `@capacitor-community/file-opener` | MIT |
| `@capacitor-community/background-geolocation` | MIT |

Their license texts and copyright notices are in each package's `LICENSE` file, which is installed by npm when the app is built.

## Map data

Map pictures shown in the Run tab are loaded from OpenStreetMap. Map data (c) OpenStreetMap contributors, available under the [Open Database License](https://www.openstreetmap.org/copyright). The attribution is shown on the map.

## The MIT License (for the MIT components above)

Permission is hereby granted, free of charge, to any person obtaining a copy of the software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
