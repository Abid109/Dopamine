# Calorie Calculation

Calories are an **estimate**, not a measurement. They are meant to help you compare sessions, not to replace a medical device or a heart-rate monitor. A typical error for any app of this kind is 20 to 30 percent.

## How it is worked out

1. **Work time** = sets x reps x seconds per rep. Each movement has its own tempo (see the table below). Timed holds such as planks use the seconds you enter.
2. **Rest time** = the rest of the duration you entered. It is counted at a light intensity (MET 2.0), not at full effort.
3. **Energy** is then:

```
active calories = weight x resting factor x ((MET - 1) x work time + (2.0 - 1) x rest time) / 3600
```

Time is in seconds. The "- 1" removes the energy you would burn anyway at rest, so the number is what the exercise adds. This is the same idea as the "active calories" on fitness watches. If you choose **Include resting** in Settings, the "- 1" is dropped and the total energy is counted. The result is never less than 1.

### Resting factor

A MET is defined as about 1 kcal per kg per hour, but real resting energy varies with body size and age. The app adjusts for this using your age, height and weight (the Mifflin-St Jeor equation, with the average of the male and female constants), limited to between 0.85 and 1.15. If you have not filled in all three on your Profile, the factor is 1.0, and 70 kg is used when weight is missing.

## Intensity values

The intensity (MET) of each movement is the effort **while you are working**. For reference, the 2024 Compendium of Physical Activities lists vigorous calisthenics at 7.5 METs, moderate calisthenics at 3.8 and light calisthenics such as planks and crunches at 2.8. Those averages include normal rests, which is why the app separates working time from rest time instead of applying one number to the whole duration.

The values below are estimates based on that range and on published measurements. They are approximations for each movement.

| Movement | Group | Intensity (MET) | Tempo |
| --- | --- | --- | --- |
| Push-ups | Push | 8.0 | 2.2 s per rep |
| Diamond Push-ups | Push | 8.5 | 2.6 s per rep |
| Parallel Bar Dips | Push | 8.0 | 2.8 s per rep |
| Pike Push-ups | Push | 8.0 | 2.8 s per rep |
| Handstand Push-ups | Push | 9.0 | 4.0 s per rep |
| Pull-ups | Pull | 8.0 | 3.2 s per rep |
| Chin-ups | Pull | 8.0 | 3.2 s per rep |
| Inverted Rows (Australian) | Pull | 6.5 | 2.8 s per rep |
| Bar Muscle-ups | Pull | 10.0 | 5.0 s per rep |
| Bodyweight Squats | Legs | 5.5 | 2.2 s per rep |
| Walking Lunges | Legs | 6.0 | 2.6 s per rep |
| Pistol Squats | Legs | 8.0 | 4.0 s per rep |
| Calf Raises | Legs | 3.8 | 1.8 s per rep |
| Forearm Plank | Core | 3.5 | hold, seconds |
| Hollow Body Hold | Core | 4.0 | hold, seconds |
| Hanging Leg Raises | Core | 5.5 | 3.0 s per rep |
| Burpees | Full Body | 10.0 | 3.6 s per rep |
| Mountain Climbers | Full Body | 8.5 | 0.8 s per rep |

For custom exercises you choose **Counted in** (repetitions or seconds) and an intensity: Moderate 5.0, Standard 7.0, Vigorous 8.5 or High Explosive 10.0. The tempo comes from the muscle group.

## Examples (70 kg, 175 cm, 25 years)

| Workout | Active calories | With resting |
| --- | --- | --- |
| 3 x 15 push-ups in 5 minutes | 16 | 22 |
| 120 push-ups without stopping | 34 | 39 |
| 4 x 20 squats in 6 minutes | 17 | 24 |
| 3 x 40 s plank in 4 minutes | 8 | 12 |
| 4 x 15 burpees in 8 minutes | 41 | 49 |

## Why the numbers are lower than in earlier versions

Earlier versions counted the whole duration at full effort and then added a bonus for every repetition. For normal sets with rests, that overstated the burn by roughly two to three times. Workouts you logged before keep their saved numbers. New workouts use this method.

## Run and walk

The Run tab estimates calories from your distance, time and weight with standard walking and running equations. It uses the weight in your [Profile](Profile-and-Biometrics) (70 kg if none is set) and follows your **Calorie Count** setting: active calories only, or including resting. These calories are shown on the Run tab and in the route history. They are separate from the workout calories on the [Dashboard](Dashboard).

## Not counted

The extra energy burned for some hours after hard training (the afterburn effect) is not included.

## Tips for better numbers

- Fill in weight, height and age on your [Profile](Profile-and-Biometrics).
- Enter the real time of the whole exercise, rests included.
- Enter the seconds for holds, and pick **Seconds (a hold)** for custom holds.
- Use the intensity that matches how hard it really felt.
