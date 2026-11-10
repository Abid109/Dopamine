package com.dopamine.fitness;

import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class ReminderDismissReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context c, Intent in) {
        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        nm.cancel(in.getIntExtra("id", 0));
    }
}
