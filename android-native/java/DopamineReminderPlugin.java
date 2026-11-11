package com.dopamine.fitness;

import android.app.AlarmManager;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;
import android.os.PowerManager;
import android.provider.Settings;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONObject;

import java.util.HashSet;
import java.util.Set;

/** Schedules full-screen reminders (shown over the lock screen with a Dismiss button) and helps with battery settings. */
@CapacitorPlugin(name = "DopamineReminder")
public class DopamineReminderPlugin extends Plugin {
    static final String PREFS = "dopamine_reminders";
    static final String IDS = "ids";

    private PendingIntent pending(Context c, int id, String title, String body, String date, int flags) {
        Intent i = new Intent(c, ReminderReceiver.class);
        i.setAction("com.dopamine.fitness.REMINDER_" + id);
        i.putExtra("id", id);
        i.putExtra("title", title);
        i.putExtra("body", body);
        i.putExtra("date", date);
        return PendingIntent.getBroadcast(c, id, i, flags | PendingIntent.FLAG_IMMUTABLE);
    }

    @PluginMethod
    public void scheduleMany(PluginCall call) {
        Context c = getContext();
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        SharedPreferences sp = c.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        Set<String> ids = new HashSet<>(sp.getStringSet(IDS, new HashSet<String>()));
        JSArray items = call.getArray("items");
        try {
            for (int n = 0; n < items.length(); n++) {
                JSONObject o = items.getJSONObject(n);
                int id = o.getInt("id");
                long at = o.getLong("at");
                PendingIntent pi = pending(c, id, o.optString("title"), o.optString("body"), o.optString("date"), PendingIntent.FLAG_UPDATE_CURRENT);
                boolean exact = Build.VERSION.SDK_INT < 31 || am.canScheduleExactAlarms();
                if (exact) am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi);
                else am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi);
                ids.add(String.valueOf(id));
            }
            sp.edit().putStringSet(IDS, ids).apply();
            call.resolve();
        } catch (Exception e) {
            call.reject("schedule failed: " + e.getMessage());
        }
    }

    @PluginMethod
    public void cancelAll(PluginCall call) {
        Context c = getContext();
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        SharedPreferences sp = c.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        for (String s : sp.getStringSet(IDS, new HashSet<String>())) {
            try {
                int id = Integer.parseInt(s);
                am.cancel(pending(c, id, "", "", "", PendingIntent.FLAG_UPDATE_CURRENT));
            } catch (Exception ignored) { }
        }
        sp.edit().remove(IDS).apply();
        call.resolve();
    }

    @PluginMethod
    public void canFullScreen(PluginCall call) {
        boolean ok = true;
        if (Build.VERSION.SDK_INT >= 34) {
            NotificationManager nm = (NotificationManager) getContext().getSystemService(Context.NOTIFICATION_SERVICE);
            ok = nm.canUseFullScreenIntent();
        }
        JSObject r = new JSObject();
        r.put("value", ok);
        call.resolve(r);
    }

    @PluginMethod
    public void openFullScreenSettings(PluginCall call) {
        try {
            Intent i;
            if (Build.VERSION.SDK_INT >= 34) {
                i = new Intent(Settings.ACTION_MANAGE_APP_USE_FULL_SCREEN_INTENT, Uri.parse("package:" + getContext().getPackageName()));
            } else {
                i = new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).putExtra(Settings.EXTRA_APP_PACKAGE, getContext().getPackageName());
            }
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(i);
            call.resolve();
        } catch (Exception e) {
            call.reject("cannot open settings");
        }
    }

    /** True when Android will not put the app to sleep to save battery (needed for long GPS tracking). */
    @PluginMethod
    public void isIgnoringBatteryOptimizations(PluginCall call) {
        boolean ok = true;
        if (Build.VERSION.SDK_INT >= 23) {
            PowerManager pm = (PowerManager) getContext().getSystemService(Context.POWER_SERVICE);
            ok = pm != null && pm.isIgnoringBatteryOptimizations(getContext().getPackageName());
        }
        JSObject r = new JSObject();
        r.put("value", ok);
        call.resolve(r);
    }

    /** Asks the user to let Dopamine run without battery restrictions. Falls back to the system list. */
    @PluginMethod
    public void requestIgnoreBatteryOptimizations(PluginCall call) {
        try {
            Intent i = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, Uri.parse("package:" + getContext().getPackageName()));
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(i);
            call.resolve();
        } catch (Exception e) {
            try {
                Intent i = new Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS);
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(i);
                call.resolve();
            } catch (Exception e2) {
                call.reject("cannot open battery settings");
            }
        }
    }
}
