# Notifications and Permissions

Dopamine asks Android for a few permissions. Each one is used for one feature only, and you can say no to any of them.

## Permissions

| Permission | Used for | When it is asked |
| --- | --- | --- |
| Notifications | Rest timer alerts, the workout session notification, calendar reminders, the run and walk tracking notification and goal alerts | The first time a feature needs it (Android 13 and later) |
| Full-screen reminders | Calendar and Planner reminders that open a full screen, also over the lock screen | From **Settings**, **Timers & alerts**. Android 14 and later may open a system page for you to allow it |
| Location (GPS) | Recording a run or walk | When you press **Start** in the Run tab |
| Battery optimization | Stops Android from pausing GPS tracking in the background | After your first start, or from **Settings**, **Timers & alerts** |
| Camera | Scanning QR codes in [Share and Receive](Share-and-Receive) | When you open the scanner |
| Install unknown apps | Opening Android's installer for an in-app update | When you first tap **Download and install** |

Check the state of Notifications, Location and Battery optimization at any time in **Settings**, **Timers & alerts**. Each row shows whether it is allowed and has a button to allow it. If a permission was blocked, the button opens the app's page in Android settings.

## What notifications you get

| Notification | Sound and pop-up | Details |
| --- | --- | --- |
| Rest timer | Yes | Fires when your rest ends. Pausing or resetting the timer cancels it |
| Workout session | Yes (once) | An ongoing notification while the session stopwatch runs. Tap it to return |
| Calendar | Yes | A confirmation when you add a routine, and a reminder at the time you set |
| Full-screen reminder | Yes, over the lock screen | A Dismiss button closes it |
| Run and walk goals | Yes | Tells you when you reach a distance, time or map goal |
| Tracking | Ongoing, may play the normal sound once when tracking starts | Shown by Android while GPS is recording, so you can see the app is working. It cannot be swiped away until you finish |

All of them show the Dopamine icon. They are created on your phone; nothing is sent to a server.

## Change the sound or turn one type off

Notifications use separate Android channels (Timers, Workout session, Calendar, Run and walk goals, Reminders, Run and walk tracking). To change a sound or hide one type:

1. Open Android **Settings**, **Apps**, **Dopamine**, **Notifications**.
2. Tap the channel and change its importance or sound.

To turn all of them off inside the app, use the **Notifications** switch in **Settings**, **Timers & alerts**.

## Why battery optimization

To save power, Android can stop apps that run for a long time in the background. For a run or walk that could end your recording early. Allowing Dopamine to ignore battery optimization prevents that. On some phones (Xiaomi, Huawei, Samsung and others) also open the app info page and set Battery to **Unrestricted**.

## Notifications missing or silent?

See [Troubleshooting](Troubleshooting).
