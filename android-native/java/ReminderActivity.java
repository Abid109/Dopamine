// SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-Dopamine-Commercial
// Copyright (c) 2026 Abid109. Licensed under the GNU AGPL-3.0 (see LICENSE) or, by separate written
// agreement, a commercial license (see COMMERCIAL-LICENSE.md). All other rights reserved.

package com.dopamine.fitness;

import android.app.Activity;
import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

/** Full-screen reminder shown over the lock screen. Dismiss closes it; Open goes to the calendar. */
public class ReminderActivity extends Activity {
    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        if (Build.VERSION.SDK_INT >= 27) { setShowWhenLocked(true); setTurnScreenOn(true); }
        else getWindow().addFlags(WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        final int id = getIntent().getIntExtra("id", 0);
        String title = getIntent().getStringExtra("title");
        String body = getIntent().getStringExtra("body");

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setGravity(Gravity.CENTER);
        root.setBackgroundColor(Color.parseColor("#0B0B0F"));
        int pad = (int) (32 * getResources().getDisplayMetrics().density);
        root.setPadding(pad, pad, pad, pad);

        TextView t = new TextView(this);
        t.setText(title == null ? "Reminder" : title);
        t.setTextColor(Color.WHITE); t.setTextSize(28); t.setTypeface(Typeface.DEFAULT_BOLD); t.setGravity(Gravity.CENTER);
        TextView m = new TextView(this);
        m.setText(body == null ? "" : body);
        m.setTextColor(Color.parseColor("#B5B5C0")); m.setTextSize(16); m.setGravity(Gravity.CENTER);
        m.setPadding(0, pad / 2, 0, pad);

        Button dismiss = new Button(this);
        dismiss.setText("Dismiss");
        dismiss.setTextColor(Color.BLACK);
        GradientDrawable g = new GradientDrawable(); g.setColor(Color.parseColor("#F59E0B")); g.setCornerRadius(48f);
        dismiss.setBackground(g);
        dismiss.setOnClickListener(new View.OnClickListener() { public void onClick(View v) { cancelAndFinish(id); } });

        Button open = new Button(this);
        open.setText("Open planner");
        open.setTextColor(Color.WHITE);
        open.setBackgroundColor(Color.TRANSPARENT);
        open.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                Intent i = new Intent(ReminderActivity.this, MainActivity.class);
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
                startActivity(i);
                cancelAndFinish(id);
            }
        });

        root.addView(t); root.addView(m);
        root.addView(dismiss, new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, (int) (56 * getResources().getDisplayMetrics().density)));
        root.addView(open);
        setContentView(root);
    }

    private void cancelAndFinish(int id) {
        ((NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE)).cancel(id);
        finish();
    }
}
