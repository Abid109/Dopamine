# Calorie Calculation

Calories are an **estimate**, not a measurement. They are meant to help you compare sessions, not to replace a medical or sports device.

## Formula

```
base     = (minutes / 60) x MET x bodyweight (kg)
volume   = sets x reps x 0.08
calories = round(base + volume), never less than 1
```

- **MET** is the intensity of the movement. Each library exercise has its own value, and custom exercises use the intensity you pick.
- **Bodyweight** comes from your profile. If it is not set, 70 kg is used.
- The **volume** part adds a little extra for the total number of repetitions.

## Tips for better numbers

- Enter your real weight in [Profile and Biometrics](Profile-and-Biometrics).
- Enter the real time you spent on the exercise.
- Use the matching intensity for custom exercises.
