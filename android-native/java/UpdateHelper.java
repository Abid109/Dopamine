// SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-Dopamine-Commercial
// Copyright (c) 2026 Abid109. Licensed under the GNU AGPL-3.0 (see LICENSE) or, by separate written
// agreement, a commercial license (see COMMERCIAL-LICENSE.md). All other rights reserved.

package com.dopamine.fitness;

import android.content.Context;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.Signature;
import android.os.Build;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Arrays;

/** Downloads a new Dopamine APK from the project's GitHub release and checks it before it is installed. */
final class UpdateHelper {
    /** Only files from this project's releases are ever downloaded. */
    static final String ALLOWED_PREFIX = "https://github.com/Abid109/Dopamine/releases/";

    static volatile String state = "idle";   // idle | downloading | ready | error
    static volatile int percent = 0;
    static volatile String error = "";

    private UpdateHelper() { }

    static File apkFile(Context c) {
        File dir = new File(c.getCacheDir(), "updates");
        //noinspection ResultOfMethodCallIgnored
        dir.mkdirs();
        return new File(dir, "Dopamine.apk");
    }

    @SuppressWarnings("deprecation")
    static long versionCodeOf(PackageInfo info) {
        return Build.VERSION.SDK_INT >= 28 ? info.getLongVersionCode() : info.versionCode;
    }

    static boolean allowedUrl(String url) {
        return url != null && url.startsWith(ALLOWED_PREFIX);
    }

    static synchronized void start(final Context c, final String url, final long expectedSize) {
        if ("downloading".equals(state)) return;
        state = "downloading";
        percent = 0;
        error = "";
        new Thread(new Runnable() {
            @Override
            public void run() {
                HttpURLConnection conn = null;
                try {
                    File out = apkFile(c);
                    if (out.exists()) //noinspection ResultOfMethodCallIgnored
                        out.delete();
                    URL u = new URL(url);
                    int hops = 0;
                    while (true) {
                        conn = (HttpURLConnection) u.openConnection();
                        conn.setInstanceFollowRedirects(false);
                        conn.setConnectTimeout(15000);
                        conn.setReadTimeout(30000);
                        conn.setRequestProperty("User-Agent", "Dopamine-Updater");
                        int code = conn.getResponseCode();
                        if (code >= 300 && code < 400) {
                            String loc = conn.getHeaderField("Location");
                            conn.disconnect();
                            if (loc == null || !loc.startsWith("https://") || ++hops > 5) throw new IOException("bad redirect");
                            u = new URL(loc);
                            continue;
                        }
                        if (code != 200) throw new IOException("server answered " + code);
                        break;
                    }
                    long total = conn.getContentLength();
                    if (total <= 0) total = expectedSize;
                    InputStream in = conn.getInputStream();
                    FileOutputStream fo = new FileOutputStream(out);
                    byte[] buf = new byte[32768];
                    long got = 0;
                    int n;
                    int last = -1;
                    try {
                        while ((n = in.read(buf)) > 0) {
                            fo.write(buf, 0, n);
                            got += n;
                            if (total > 0) {
                                int p = (int) Math.min(99, got * 100 / total);
                                if (p != last) { percent = p; last = p; }
                            }
                        }
                        fo.flush();
                    } finally {
                        try { fo.close(); } catch (IOException ignored) { }
                        try { in.close(); } catch (IOException ignored) { }
                    }
                    if (expectedSize > 0 && got != expectedSize) throw new IOException("download was incomplete");
                    String problem = verify(c, out);
                    if (problem != null) {
                        //noinspection ResultOfMethodCallIgnored
                        out.delete();
                        throw new IOException(problem);
                    }
                    percent = 100;
                    state = "ready";
                } catch (Exception e) {
                    error = e.getMessage() == null ? "download failed" : e.getMessage();
                    state = "error";
                } finally {
                    if (conn != null) conn.disconnect();
                }
            }
        }, "dopamine-update").start();
    }

    /** Returns null when the file is a newer Dopamine build signed with the same key, otherwise a reason. */
    @SuppressWarnings("deprecation")
    static String verify(Context c, File apk) {
        PackageManager pm = c.getPackageManager();
        String pkg = c.getPackageName();
        PackageInfo mine;
        PackageInfo theirs;
        try {
            if (Build.VERSION.SDK_INT >= 28) {
                mine = pm.getPackageInfo(pkg, PackageManager.GET_SIGNING_CERTIFICATES);
                theirs = pm.getPackageArchiveInfo(apk.getAbsolutePath(), PackageManager.GET_SIGNING_CERTIFICATES);
            } else {
                mine = pm.getPackageInfo(pkg, PackageManager.GET_SIGNATURES);
                theirs = pm.getPackageArchiveInfo(apk.getAbsolutePath(), PackageManager.GET_SIGNATURES);
            }
        } catch (Exception e) {
            return "cannot read the update file";
        }
        if (theirs == null) return "the update file is damaged";
        if (!pkg.equals(theirs.packageName)) return "the file is not Dopamine";
        if (versionCodeOf(theirs) <= versionCodeOf(mine)) return "you already have this version";

        Signature[] a;
        Signature[] b;
        if (Build.VERSION.SDK_INT >= 28) {
            a = mine.signingInfo == null ? null : mine.signingInfo.getApkContentsSigners();
            b = theirs.signingInfo == null ? null : theirs.signingInfo.getApkContentsSigners();
        } else {
            a = mine.signatures;
            b = theirs.signatures;
        }
        // Android enforces the signature too; when the phone cannot read it from the file we leave it to Android.
        if (a != null && b != null && !sameSigners(a, b)) return "the update is not signed with the Dopamine key";
        return null;
    }

    private static boolean sameSigners(Signature[] a, Signature[] b) {
        for (Signature y : b) {
            boolean found = false;
            for (Signature x : a) {
                if (Arrays.equals(x.toByteArray(), y.toByteArray())) { found = true; break; }
            }
            if (!found) return false;
        }
        return b.length > 0;
    }
}
