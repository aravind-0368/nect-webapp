Here is the fully balanced **NECT System XP Blueprint**.

To maintain perfect game balance while honoring your strict rules, the baseline actions award scaled XP from **5 to 10 XP**, scaling up to a **max ceiling of 40 XP** for ultimate tier accomplishments (like your S-Rank Exam modifier).

---

## 📈 THE STREAK SYSTEM: "🔥 OVERDRIVE MODE"

Once a user establishes a **50-day streak** in an activity module, the calculation engine activates. So every **50-day streak** adds extra 10 xp if the user is at 100 day straek 10+10 20 extra ex. But when the streak is break the extra xp is lost.  **Overdrive Mode**:


$$\text{Final XP} = \text{Base Action XP} + 10 \text{ XP Bonus}$$



---

## ⚔️ THE CORE ARCHITECTURE: XP REWARD MATRIX

### 📟 1. TASK MODULE

* 🥉 **Low Priority Task:** `+5 XP` *(e.g., Clear workspace)*
* 🥈 **Medium Priority Task:** `+8 XP` *(e.g., Code database seed script)*
* 🥇 **High Priority Task:** `+10 XP` *(e.g., Submit project draft)*
* 🔥 **Streak 50d+ Overdrive:** Boosts payouts to `15 / 18 / 20 XP`.

### 🧠 2. LEARNING & ACADEMIC TRIAD

* 📚 **Study Log (Per 30 Mins):** `+10 XP` *(Capped at 40 XP max per day to prevent artificial level grinding).*
* 🔄 **Revision Session:** `+10 XP` *(Reviewing past modules locks in retained memory).*
* 🎓 **Main Exam Base Payout:** `+20 XP` *(Standard completion).*
* 🏆 **Main Exam Milestone:** **`+40 XP` (MAX)**
* *Trigger Rule:* Automatically awarded if user gains **$>90\%$ marks** on the exam data log.


* 🔥 **Streak 50d+ Overdrive:** Boosts standard study/revisions by $+10\text{ XP}$.

### 🏋️‍♂️ 3. PHYSICAL REGENERATION & ATHLETICS

* 💪 **Workout Split (Gym/Home):** `+10 XP` *(Awarded instantly upon logging execution of focus muscle group).*
* ⚽ **Sports / Tournament Play:** `+10 XP` *(Awarded for active match play or stamina drills).*
* 🔥 **Streak 50d+ Overdrive:** Complete a workout or sport session at a 50+ day streak velocity to trigger `20 XP` per entry.

### 🍽️ 4. VITALITY POOL (FOOD & WATER)

* 🥗 **Food Log (Met Targets):** `+5 XP` *(Awarded when daily Calories/Protein stay stable within $+/- 10\%$ of system parameters).*
* 💧 **Water Intake (Per 1L logged):** `+5 XP` *(Capped at 20 XP max per day for optimal health boundaries).*
* 🔥 **Streak 50d+ Overdrive:** Proper nutrition logging while on fire scales up to `15 XP` per checklist.

### 💼 5. THE TREASURY (MONEY)

* 💰 **Transaction Audit / Financial Log:** `+5 XP` *(Awarded for manual line-item documentation to build wealth awareness).*
* 📉 **Recurring Budget Target Held:** `+10 XP` *(Triggered when a recurring payment roster item processing cycles through cleanly without going over budget bounds).*
* 🔥 **Streak 50d+ Overdrive:** Financial consistency scales to `15 / 20 XP`.

---

## 💻 Technical Backend Implementation Strategy (Prisma + Next.js)

When updating your database controllers on your live Vercel stack, use this atomic method block to parse user actions and apply the streak logic smoothly:

```typescript
export async function completeActivity(userId: string, activityType: 'workout' | 'learning' | 'task', baseXp: number) {
  // 1. Fetch current streak metrics dynamically from user profile
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Player context not found");

  // 2. Evaluate if current module qualifies for Overdrive Mode (+10 XP)
  let streakValue = 0;
  if (activityType === 'workout') streakValue = user.workoutStreak;
  if (activityType === 'learning') streakValue = user.learningStreak;

  const isOverdriveActive = streakValue >= 50;
  const streakBonus = isOverdriveActive ? 10 : 0;
  
  // 3. Prevent system exploits (Hard ceiling checks)
  const finalXpAwarded = Math.min(baseXp + streakBonus, 40);

  // 4. Update core records cleanly
  return await prisma.user.update({
    where: { id: userId },
    data: {
      totalPoints: { increment: finalXpAwarded }
    }
  });
}

```