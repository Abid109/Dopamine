package com.dopamine.fitness;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.graphics.BitmapFactory;
import android.os.Build;

/** Posts a silent notification that opens the full-screen reminder. */
public class ReminderReceiver extends BroadcastReceiver {
    static final String CHANNEL = "reminder_fullscreen_silent";

    @Override
    public void onReceive(Context c, Intent in) {
        int id = in.getIntExtra("id", 0);
        String title = in.getStringExtra("title");
        String body = in.getStringExtra("body");
        String date = in.getStringExtra("date");

        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationChannel ch = new NotificationChannel(CHANNEL, "Reminders", NotificationManager.IMPORTANCE_HIGH);
            ch.setSound(null, null);
            ch.enableVibration(false);
            ch.setDescription("Silent full-screen reminders from your calendar and planner");
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
        if (Build.VERSION.SDK_INT < 26) { b.setSound(null); b.setPriority(Notification.PRIORITY_HIGH); }
        nm.notify(id, b.build());
    }
}
