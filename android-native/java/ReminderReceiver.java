package com.dopamine.fitness;

import android.app.Notification;
import android.media.AudioAttributes;
import android.media.RingtoneManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.graphics.BitmapFactory;
import android.os.Build;

/** Posts a normal (sound + vibration) notification that opens the full-screen reminder. */
public class ReminderReceiver extends BroadcastReceiver {
    static final String CHANNEL = "reminder_fullscreen_v2";
    static final String OLD_SILENT_CHANNEL = "reminder_fullscreen_silent";

    @Override
    public void onReceive(Context c, Intent in) {
        int id = in.getIntExtra("id", 0);
        String title = in.getStringExtra("title");
        String body = in.getStringExtra("body");
        String date = in.getStringExtra("date");

        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        if (Build.VERSION.SDK_INT >= 26) {
            // The old silent channel cannot be edited, so it is replaced by a new one that makes sound.
            try { nm.deleteNotificationChannel(OLD_SILENT_CHANNEL); } catch (Exception ignored) { }
            NotificationChannel ch = new NotificationChannel(CHANNEL, "Reminders", NotificationManager.IMPORTANCE_HIGH);
            ch.setDescription("Full-screen reminders from your calendar and planner");
            ch.enableVibration(true);
            ch.setVibrationPattern(new long[]{0, 300, 200, 300});
            ch.enableLights(true);
            ch.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            AudioAttributes aa = new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build();
            ch.setSound(RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION), aa);
            nm.createNotificationChannel(ch);
        }

        Intent full = new Intent(c, ReminderActivity.class);
        full.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        full.putExtra("id", id).putExtra("title", title).putExtra("body", body).putExtra("date", date);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE;
        PendingIntent fullPi = PendingIntent.getActivity(c, id, full, flags);

        Intent dismiss = new Intent(c, ReminderDismissReceiver.class).putExtra("id", id);
        PendingIntent dismissPi = PendingIntent.getBroadcast(c, id, dismiss, flags);

        int small = c.getResources().getIdentifier("ic_stat_icon", "drawable", c.getPackageName());
        int large = c.getResources().getIdentifier("ic_notif_large", "drawable", c.getPackageName());
        Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(c, CHANNEL) : new Notification.Builder(c);
        b.setSmallIcon(small != 0 ? small : android.R.drawable.ic_popup_reminder)
                .setContentTitle(title)
                .setContentText(body)
                .setCategory(Notification.CATEGORY_ALARM)
                .setAutoCancel(true)
                .setContentIntent(fullPi)
                .setFullScreenIntent(fullPi, true)
                .addAction(new Notification.Action.Builder(null, "Dismiss", dismissPi).build());
        if (large != 0) b.setLargeIcon(BitmapFactory.decodeResource(c.getResources(), large));
        if (Build.VERSION.SDK_INT < 26) { b.setDefaults(Notification.DEFAULT_ALL); b.setPriority(Notification.PRIORITY_HIGH); }
        nm.notify(id, b.build());
    }
}
