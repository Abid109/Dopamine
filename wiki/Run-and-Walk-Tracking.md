# Run and Walk Tracking

The **Run** tab records a walk or run with your phone's GPS. It keeps recording when the screen is off or you switch to another app.

## First time

Press **Start**. Dopamine asks for:

1. **Location** (required). Without it nothing can be recorded.
2. **Notifications.** Android shows a small "Dopamine is tracking" notification while GPS is on, and goal alerts use notifications too.
3. **Battery optimization.** Allow it so Android does not stop tracking after a while. On some phones (Xiaomi, Huawei, Samsung) also open **App info** and set Battery to Unrestricted.

You can check or change all three in **Settings**, **Timers & alerts**. More in [Notifications and Permissions](Notifications-and-Permissions).

## The screen

- **Walk / Run** switch at the top.
- **Map** with your position, an accuracy circle and your route. Drag the map to look around and tap **Re-center** to follow you again.
- **Time, distance (km), pace (min/km) and calories**, plus your average speed and the GPS accuracy.
- **Start, Pause / Resume and Finish** buttons.
- **Goal** card, an optional **permissions** card, and your **History**.

## Recording

- Pick **Walk** or **Run**, choose a goal, press **Start**.
- **Pause** stops the clock and distance (for a traffic light or a break). **Resume** continues and does not count the distance travelled while paused.
- **Finish** saves the activity to your history. If almost nothing was recorded, the app offers to discard it.
- Tap an entry in the history to see its route on the map, or **Delete** to remove it.
- If the app is closed while you are recording, the route so far is kept and you can **Resume**, **Save** or **Discard** next time.

## Goals

- **Distance** (km) or **Time** (minutes): a progress bar fills and you get a notification when you reach it.
- **Map pin:** tap the map to place a flag. The bar shows how far you have left, and the goal is reached when you are within about 25 m of the flag.
- **Free:** no goal.

You can change the goal while recording.

## Accuracy

Weak or jumpy GPS readings (worse than about 35 m), tiny jitter while standing still, and impossible jumps (faster than a person can walk or run) are ignored. For best results start in the open and wait for the accuracy to drop below 20 m.

## Calories

Estimated from distance, time and the weight in your Profile with the standard walking and running equations. See [Calorie Calculation](Calorie-Calculation).

## Limits

- Distances and pace are in kilometres.
- The map pictures come from OpenStreetMap and need internet. The route is recorded without it.
- You can change the map look in Settings, Map style. Classic is the default. The other styles need internet and a phone with WebGL, and are not used when Smooth mode is on.
- The tracking notification shows fixed text, not live distance.

## Privacy

Routes are stored on the phone only and are not synced. See [Privacy and Data](Privacy-and-Data). Problems? See [Troubleshooting](Troubleshooting).
