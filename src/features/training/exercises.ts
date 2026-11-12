export type MuscleGroup = 'Chest' | 'Back' | 'Shoulders' | 'Arms' | 'Legs' | 'Abs'
export type TrainingPlace = 'HOME' | 'GYM'
export type TrainingLevel = 'Beginner' | 'Intermediate' | 'Advanced'

export type Exercise = {
  id: string
  name: string
  place: TrainingPlace
  level: TrainingLevel
  muscle: MuscleGroup
  equipment: string
  sets: number
  reps: string
  rest: number
  technique: string[]
  musclesWorked: MuscleGroup[]
}

export const muscleGroups: MuscleGroup[] = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Abs']
export const trainingLevels: TrainingLevel[] = ['Beginner', 'Intermediate', 'Advanced']

export const exercises: Exercise[] = [
  { id: 'push-up', name: 'Push-up', place: 'HOME', level: 'Beginner', muscle: 'Chest', equipment: 'Bodyweight', sets: 3, reps: '10–12', rest: 60, musclesWorked: ['Chest', 'Shoulders', 'Arms'], technique: ['Set your hands just wider than shoulder-width and brace your core.', 'Lower your chest with control while keeping a straight line from head to heels.', 'Press the floor away to return; keep elbows at roughly 45° from your body.'] },
  { id: 'incline-push-up', name: 'Incline push-up', place: 'HOME', level: 'Beginner', muscle: 'Chest', equipment: 'Bench or sturdy surface', sets: 3, reps: '12–15', rest: 60, musclesWorked: ['Chest', 'Shoulders', 'Arms'], technique: ['Place hands on a stable elevated surface.', 'Keep your body aligned and lower your chest toward the edge.', 'Push back smoothly without shrugging your shoulders.'] },
  { id: 'dumbbell-press', name: 'Dumbbell bench press', place: 'GYM', level: 'Intermediate', muscle: 'Chest', equipment: 'Dumbbells + bench', sets: 4, reps: '8–10', rest: 90, musclesWorked: ['Chest', 'Shoulders', 'Arms'], technique: ['Plant your feet and keep shoulder blades gently retracted.', 'Lower dumbbells beside your chest with wrists stacked over elbows.', 'Press upward without letting the weights collide or locking out forcefully.'] },
  { id: 'lat-pulldown', name: 'Lat pulldown', place: 'GYM', level: 'Beginner', muscle: 'Back', equipment: 'Cable machine', sets: 3, reps: '10–12', rest: 75, musclesWorked: ['Back', 'Arms'], technique: ['Grip the bar slightly wider than shoulder-width and sit tall.', 'Draw elbows down toward your sides; bring the bar to upper chest level.', 'Return slowly until arms extend, keeping your torso steady.'] },
  { id: 'one-arm-row', name: 'Single-arm dumbbell row', place: 'GYM', level: 'Intermediate', muscle: 'Back', equipment: 'Dumbbell + bench', sets: 4, reps: '10 each side', rest: 75, musclesWorked: ['Back', 'Arms'], technique: ['Brace one hand on a bench and keep your back neutral.', 'Pull the dumbbell toward your hip, leading with your elbow.', 'Lower under control and complete both sides evenly.'] },
  { id: 'superman', name: 'Superman hold', place: 'HOME', level: 'Beginner', muscle: 'Back', equipment: 'Mat', sets: 3, reps: '20–30 sec', rest: 45, musclesWorked: ['Back', 'Legs'], technique: ['Lie face down with arms reaching forward and neck relaxed.', 'Lift arms and legs a small distance by engaging your back and glutes.', 'Hold while breathing steadily, then lower with control.'] },
  { id: 'shoulder-press', name: 'Dumbbell shoulder press', place: 'GYM', level: 'Intermediate', muscle: 'Shoulders', equipment: 'Dumbbells', sets: 4, reps: '8–10', rest: 90, musclesWorked: ['Shoulders', 'Arms'], technique: ['Stand or sit tall with dumbbells at shoulder height.', 'Brace your midsection and press overhead in a controlled path.', 'Lower until elbows are just below shoulder level; avoid arching your back.'] },
  { id: 'pike-push-up', name: 'Pike push-up', place: 'HOME', level: 'Advanced', muscle: 'Shoulders', equipment: 'Bodyweight', sets: 4, reps: '6–10', rest: 90, musclesWorked: ['Shoulders', 'Arms'], technique: ['Start in an inverted V with hips high and hands shoulder-width.', 'Bend elbows to bring the crown of your head toward the floor.', 'Press back up while keeping your core engaged and neck neutral.'] },
  { id: 'bicep-curl', name: 'Dumbbell bicep curl', place: 'GYM', level: 'Beginner', muscle: 'Arms', equipment: 'Dumbbells', sets: 3, reps: '10–12', rest: 60, musclesWorked: ['Arms'], technique: ['Stand tall with elbows close to your sides and palms forward.', 'Curl the weights without swinging your torso.', 'Lower slowly to full comfortable extension.'] },
  { id: 'diamond-push-up', name: 'Close-grip push-up', place: 'HOME', level: 'Intermediate', muscle: 'Arms', equipment: 'Bodyweight', sets: 3, reps: '8–12', rest: 60, musclesWorked: ['Arms', 'Chest'], technique: ['Set hands under your chest, a little narrower than shoulders.', 'Keep elbows close as you lower your chest with control.', 'Press up while maintaining a firm plank position.'] },
  { id: 'goblet-squat', name: 'Goblet squat', place: 'GYM', level: 'Beginner', muscle: 'Legs', equipment: 'Dumbbell or kettlebell', sets: 3, reps: '10–12', rest: 75, musclesWorked: ['Legs', 'Abs'], technique: ['Hold a weight close to your chest with feet around shoulder-width.', 'Sit between your hips, keeping knees tracking in line with toes.', 'Drive through the whole foot to stand tall.'] },
  { id: 'split-squat', name: 'Reverse lunge', place: 'HOME', level: 'Intermediate', muscle: 'Legs', equipment: 'Bodyweight or dumbbells', sets: 3, reps: '10 each side', rest: 60, musclesWorked: ['Legs', 'Abs'], technique: ['Stand tall and step one foot back into a comfortable stance.', 'Lower both knees with control while keeping your front foot planted.', 'Push through the front foot to return and alternate sides.'] },
  { id: 'plank', name: 'Forearm plank', place: 'HOME', level: 'Beginner', muscle: 'Abs', equipment: 'Mat', sets: 3, reps: '30–45 sec', rest: 45, musclesWorked: ['Abs', 'Shoulders'], technique: ['Place elbows under shoulders and extend legs behind you.', 'Make a straight line from head to heels; gently brace your abdomen.', 'Breathe steadily and stop if your lower back begins to sag.'] },
  { id: 'cable-crunch', name: 'Cable crunch', place: 'GYM', level: 'Intermediate', muscle: 'Abs', equipment: 'Cable machine', sets: 3, reps: '12–15', rest: 60, musclesWorked: ['Abs'], technique: ['Kneel facing the cable with rope ends by your temples.', 'Curl your ribs toward your pelvis without pulling with your arms.', 'Return slowly until your torso is upright, keeping tension.'] },
]
