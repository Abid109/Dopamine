// SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-Dopamine-Commercial
// Copyright (c) 2026 Abid109. Licensed under the GNU AGPL-3.0 (see LICENSE) or, by separate written
// agreement, a commercial license (see COMMERCIAL-LICENSE.md). All other rights reserved.
// Tells the page it runs in the desktop app (see www/platform.js). Nothing else is exposed.
'use strict';
const { contextBridge } = require('electron');
contextBridge.exposeInMainWorld('dopamineDesktop', { platform: process.platform });
