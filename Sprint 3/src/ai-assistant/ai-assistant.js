// AI Fitness Assistant - Chatbot Logic
import Calories from "../calories/food-helper.js";
import Exercises from "../exercises/exercise-helper.js";

(function () {
    const chatMessages = document.getElementById("chat-messages");
    const chatInput = document.getElementById("chat-input");
    const sendButton = document.getElementById("send-button");
    const quickOptions = document.getElementById("quick-options");
    const planOutput = document.getElementById("plan-output");
    const dietPlanContent = document.getElementById("diet-plan-content");
    const workoutPlanContent = document.getElementById("workout-plan-content");

    // User profile to collect information
    let userProfile = {
        goal: null,
        age: null,
        weight: null,
        height: null,
        activityLevel: null,
        dietaryRestrictions: [],
        workoutFrequency: null,
        workoutDuration: null,
        fitnessLevel: null,
        equipment: null
    };

    // Conversation state
    let conversationState = {
        currentQuestion: 0,
        questions: [
            {
                key: 'goal',
                text: "What's your primary fitness goal?",
                type: 'choice',
                options: ['weight-loss', 'muscle-gain', 'maintain', 'endurance']
            },
            {
                key: 'age',
                text: "How old are you?",
                type: 'number',
                min: 13,
                max: 100
            },
            {
                key: 'weight',
                text: "What's your current weight (in lbs)?",
                type: 'number',
                min: 80,
                max: 500
            },
            {
                key: 'height',
                text: "What's your height (in inches)?",
                type: 'number',
                min: 48,
                max: 96
            },
            {
                key: 'activityLevel',
                text: "What's your current activity level?",
                type: 'choice',
                options: ['sedentary', 'lightly-active', 'moderately-active', 'very-active']
            },
            {
                key: 'dietaryRestrictions',
                text: "Do you have any dietary restrictions? (You can say 'none', 'vegetarian', 'vegan', 'keto', 'gluten-free', or multiple)",
                type: 'text'
            },
            {
                key: 'workoutFrequency',
                text: "How many days per week can you work out?",
                type: 'choice',
                options: ['3', '4', '5', '6']
            },
            {
                key: 'workoutDuration',
                text: "How long can you work out per session?",
                type: 'choice',
                options: ['30 minutes', '45 minutes', '60 minutes', '90 minutes']
            },
            {
                key: 'fitnessLevel',
                text: "What's your current fitness level?",
                type: 'choice',
                options: ['beginner', 'intermediate', 'advanced']
            },
            {
                key: 'equipment',
                text: "What equipment do you have access to?",
                type: 'choice',
                options: ['home-bodyweight', 'home-basic', 'gym-full']
            }
        ]
    };

    // Initialize event listeners
    function init() {
        sendButton.addEventListener("click", handleSendMessage);
        chatInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                handleSendMessage();
            }
        });

        // Quick option buttons
        document.querySelectorAll(".quick-option-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const value = e.target.dataset.value;
                handleQuickOption(value, e.target.textContent);
            });
        });

        // Plan action buttons
        document.getElementById("save-diet-btn").addEventListener("click", saveDietPlan);
        document.getElementById("save-workout-btn").addEventListener("click", saveWorkoutPlan);
        document.getElementById("new-plan-btn").addEventListener("click", resetConversation);

        // Focus input
        chatInput.focus();
    }

    function handleQuickOption(value, displayText) {
        chatInput.value = displayText;
        handleSendMessage(value);
    }

    function handleSendMessage(explicitValue = null) {
        const userMessage = explicitValue || chatInput.value.trim();
        if (!userMessage) return;

        // Add user message to chat
        addMessage(userMessage, "user");
        chatInput.value = "";

        // Process the answer
        processAnswer(userMessage);

        // Show typing indicator
        showTypingIndicator();

        // Simulate AI thinking time
        setTimeout(() => {
            hideTypingIndicator();
            continueConversation();
        }, 1000);
    }

    function processAnswer(answer) {
        const currentQ = conversationState.questions[conversationState.currentQuestion];
        if (!currentQ) return;

        let value = answer.toLowerCase().trim();

        // Handle choice questions
        if (currentQ.type === 'choice') {
            // Map common responses to options
            const optionMap = {
                'weight-loss': ['lose weight', 'weight loss', 'lose', 'slim down', 'cut'],
                'muscle-gain': ['build muscle', 'muscle gain', 'gain muscle', 'bulk', 'strength'],
                'maintain': ['maintain', 'maintain weight', 'stay the same'],
                'endurance': ['endurance', 'improve endurance', 'cardio', 'stamina'],
                'sedentary': ['sedentary', 'little', 'none', 'desk job'],
                'lightly-active': ['lightly active', 'light', 'walk', 'light exercise'],
                'moderately-active': ['moderately active', 'moderate', 'regular exercise'],
                'very-active': ['very active', 'active', 'intense', 'hard'],
                'beginner': ['beginner', 'new', 'starting', 'just starting'],
                'intermediate': ['intermediate', 'some experience', 'moderate'],
                'advanced': ['advanced', 'experienced', 'expert'],
                'home-bodyweight': ['home bodyweight', 'bodyweight', 'home', 'none', 'no equipment'],
                'home-basic': ['home basic', 'dumbbells', 'basic equipment', 'home gym'],
                'gym-full': ['gym full', 'gym', 'full gym', 'full equipment']
            };

            // Find matching option
            let matchedOption = null;
            for (const [option, keywords] of Object.entries(optionMap)) {
                if (currentQ.options.includes(option) && keywords.some(kw => value.includes(kw))) {
                    matchedOption = option;
                    break;
                }
            }

            // Or try direct match
            if (!matchedOption) {
                matchedOption = currentQ.options.find(opt => value.includes(opt));
            }

            value = matchedOption || value;
        }

        // Handle dietary restrictions
        if (currentQ.key === 'dietaryRestrictions') {
            const restrictions = [];
            const restrictionKeywords = {
                'vegetarian': ['vegetarian', 'no meat'],
                'vegan': ['vegan', 'no animal'],
                'keto': ['keto', 'ketogenic', 'low carb'],
                'gluten-free': ['gluten-free', 'gluten free', 'celiac'],
                'dairy-free': ['dairy-free', 'dairy free', 'lactose'],
                'none': ['none', 'no restrictions', 'nothing']
            };

            for (const [restriction, keywords] of Object.entries(restrictionKeywords)) {
                if (keywords.some(kw => value.includes(kw))) {
                    if (restriction !== 'none') {
                        restrictions.push(restriction);
                    }
                }
            }

            userProfile[currentQ.key] = restrictions.length > 0 ? restrictions : [];
        } else {
            userProfile[currentQ.key] = value;
        }
    }

    function continueConversation() {
        conversationState.currentQuestion++;

        if (conversationState.currentQuestion < conversationState.questions.length) {
            // Ask next question
            const nextQ = conversationState.questions[conversationState.currentQuestion];
            const options = nextQ.options || [];
            
            // Show quick options if available
            showQuickOptions(nextQ.type === 'choice' ? options : []);
            
            addBotMessage(nextQ.text);
        } else {
            // All questions answered, generate plans
            generatePlans();
        }
    }

    function showQuickOptions(options) {
        quickOptions.innerHTML = "";
        
        if (options.length === 0) {
            quickOptions.classList.add("hidden");
            return;
        }

        quickOptions.classList.remove("hidden");

        const optionLabels = {
            'weight-loss': 'Lose Weight',
            'muscle-gain': 'Build Muscle',
            'maintain': 'Maintain Weight',
            'endurance': 'Improve Endurance',
            'sedentary': 'Sedentary (desk job)',
            'lightly-active': 'Lightly Active (light exercise)',
            'moderately-active': 'Moderately Active',
            'very-active': 'Very Active',
            'beginner': 'Beginner',
            'intermediate': 'Intermediate',
            'advanced': 'Advanced',
            'home-bodyweight': 'Home (Bodyweight Only)',
            'home-basic': 'Home (Basic Equipment)',
            'gym-full': 'Full Gym Access',
            '3': '3 days',
            '4': '4 days',
            '5': '5 days',
            '6': '6 days',
            '30 minutes': '30 minutes',
            '45 minutes': '45 minutes',
            '60 minutes': '60 minutes',
            '90 minutes': '90 minutes'
        };

        options.forEach(option => {
            const btn = document.createElement("button");
            btn.className = "quick-option-btn";
            btn.textContent = optionLabels[option] || option;
            btn.dataset.value = option;
            btn.addEventListener("click", () => handleQuickOption(option, btn.textContent));
            quickOptions.appendChild(btn);
        });
    }

    function generatePlans() {
        quickOptions.classList.add("hidden");
        
        addBotMessage("Perfect! I have all the information I need. Let me create your personalized diet and workout plan...");

        setTimeout(() => {
            const dietPlan = generateDietPlan();
            const workoutPlan = generateWorkoutPlan();

            displayPlans(dietPlan, workoutPlan);
            planOutput.style.display = "block";
            planOutput.scrollIntoView({ behavior: "smooth" });
        }, 1500);
    }

    function generateDietPlan() {
        const { goal, age, weight, height, activityLevel, dietaryRestrictions, workoutFrequency } = userProfile;

        // Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
        let bmr;
        if (weight && height && age) {
            // Using average values if gender not specified
            // Male formula: (10 × weight in kg) + (6.25 × height in cm) - (5 × age) + 5
            // Female formula: (10 × weight in kg) + (6.25 × height in cm) - (5 × age) - 161
            // Using average: +5 for male, -161 for female, average = -78
            const weightKg = weight / 2.20462;
            const heightCm = height * 2.54;
            bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 78;
        } else {
            bmr = 2000; // Default estimate
        }

        // Activity multipliers
        const activityMultipliers = {
            'sedentary': 1.2,
            'lightly-active': 1.375,
            'moderately-active': 1.55,
            'very-active': 1.725
        };

        let tdee = bmr * (activityMultipliers[activityLevel] || 1.375);

        // Adjust calories based on goal
        let targetCalories;
        if (goal === 'weight-loss') {
            targetCalories = Math.round(tdee - 500); // 1 lb per week
        } else if (goal === 'muscle-gain') {
            targetCalories = Math.round(tdee + 300);
        } else {
            targetCalories = Math.round(tdee);
        }

        // Macronutrient distribution
        let proteinGrams, carbGrams, fatGrams;

        if (goal === 'weight-loss') {
            proteinGrams = Math.round(weight * 1.2); // Higher protein for weight loss
            fatGrams = Math.round(targetCalories * 0.25 / 9);
            carbGrams = Math.round((targetCalories - (proteinGrams * 4) - (fatGrams * 9)) / 4);
        } else if (goal === 'muscle-gain') {
            proteinGrams = Math.round(weight * 1.6); // Higher protein for muscle gain
            carbGrams = Math.round(targetCalories * 0.45 / 4);
            fatGrams = Math.round((targetCalories - (proteinGrams * 4) - (carbGrams * 4)) / 9);
        } else {
            proteinGrams = Math.round(weight * 1.0);
            carbGrams = Math.round(targetCalories * 0.40 / 4);
            fatGrams = Math.round((targetCalories - (proteinGrams * 4) - (carbGrams * 4)) / 9);
        }

        // Generate meal plan based on dietary restrictions
        const meals = generateMealPlan(dietaryRestrictions, targetCalories, proteinGrams);

        return {
            targetCalories,
            proteinGrams,
            carbGrams,
            fatGrams,
            meals,
            dietaryRestrictions
        };
    }

    function generateMealPlan(restrictions, calories, protein) {
        const isVegan = restrictions.includes('vegan');
        const isVegetarian = restrictions.includes('vegetarian');
        const isKeto = restrictions.includes('keto');
        const isGlutenFree = restrictions.includes('gluten-free');

        const mealPlan = {
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
            saturday: [],
            sunday: []
        };

        // Protein sources
        let proteinSources = [];
        if (isVegan) {
            proteinSources = ['tofu', 'lentils', 'chickpeas', 'black beans', 'tempeh', 'quinoa'];
        } else if (isVegetarian) {
            proteinSources = ['eggs', 'greek yogurt', 'cottage cheese', 'lentils', 'chickpeas', 'quinoa'];
        } else {
            proteinSources = ['chicken breast', 'salmon', 'lean beef', 'eggs', 'turkey', 'tuna'];
        }

        // Carbohydrate sources
        let carbSources = [];
        if (isKeto) {
            carbSources = ['broccoli', 'spinach', 'cauliflower', 'zucchini', 'avocado'];
        } else if (isGlutenFree) {
            carbSources = ['brown rice', 'quinoa', 'sweet potato', 'oats (gluten-free)', 'fruits'];
        } else {
            carbSources = ['brown rice', 'whole wheat bread', 'quinoa', 'oats', 'sweet potato'];
        }

        // Generate meals for each day
        const days = Object.keys(mealPlan);
        days.forEach((day, index) => {
            const proteinSource = proteinSources[index % proteinSources.length];
            const carbSource = carbSources[index % carbSources.length];

            mealPlan[day] = [
                {
                    meal: 'Breakfast',
                    food: isKeto 
                        ? `Scrambled eggs with spinach and avocado (${Math.round(calories * 0.25)} cal)`
                        : `Oatmeal with berries and protein (${Math.round(calories * 0.25)} cal)`,
                    protein: `${Math.round(protein / 7 * 2)}g protein`
                },
                {
                    meal: 'Lunch',
                    food: `${proteinSource} with ${carbSource} and vegetables (${Math.round(calories * 0.35)} cal)`,
                    protein: `${Math.round(protein / 7 * 3)}g protein`
                },
                {
                    meal: 'Snack',
                    food: isVegan 
                        ? `Mixed nuts and fruit (${Math.round(calories * 0.10)} cal)`
                        : `Greek yogurt with berries (${Math.round(calories * 0.10)} cal)`,
                    protein: `${Math.round(protein / 7 * 1)}g protein`
                },
                {
                    meal: 'Dinner',
                    food: `${proteinSource} with vegetables and ${isKeto ? 'healthy fats' : carbSource} (${Math.round(calories * 0.30)} cal)`,
                    protein: `${Math.round(protein / 7 * 2)}g protein`
                }
            ];
        });

        return mealPlan;
    }

    function generateWorkoutPlan() {
        const { goal, workoutFrequency, workoutDuration, fitnessLevel, equipment } = userProfile;

        const daysPerWeek = parseInt(workoutFrequency) || 4;
        const duration = workoutDuration || '60 minutes';
        const isBodyweight = equipment === 'home-bodyweight';
        const isHomeBasic = equipment === 'home-basic';
        const isGym = equipment === 'gym-full';

        const workoutPlan = {};

        // Generate workout schedule
        if (goal === 'weight-loss') {
            // Cardio-focused with strength
            const cardioDays = Math.ceil(daysPerWeek * 0.6);
            const strengthDays = Math.floor(daysPerWeek * 0.4);

            for (let i = 0; i < daysPerWeek; i++) {
                const dayName = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'][i];
                
                if (i < cardioDays) {
                    workoutPlan[dayName] = generateCardioWorkout(duration, fitnessLevel, isBodyweight);
                } else {
                    workoutPlan[dayName] = generateStrengthWorkout(duration, fitnessLevel, isBodyweight, isHomeBasic, isGym);
                }
            }
        } else if (goal === 'muscle-gain') {
            // Strength-focused
            for (let i = 0; i < daysPerWeek; i++) {
                const dayName = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'][i];
                
                if (i % 2 === 0) {
                    workoutPlan[dayName] = generateUpperBodyWorkout(duration, fitnessLevel, isBodyweight, isHomeBasic, isGym);
                } else {
                    workoutPlan[dayName] = generateLowerBodyWorkout(duration, fitnessLevel, isBodyweight, isHomeBasic, isGym);
                }
            }
        } else if (goal === 'endurance') {
            // Cardio-focused
            for (let i = 0; i < daysPerWeek; i++) {
                const dayName = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'][i];
                workoutPlan[dayName] = generateEnduranceWorkout(duration, fitnessLevel, isBodyweight);
            }
        } else {
            // Balanced maintenance
            for (let i = 0; i < daysPerWeek; i++) {
                const dayName = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'][i];
                
                if (i % 2 === 0) {
                    workoutPlan[dayName] = generateStrengthWorkout(duration, fitnessLevel, isBodyweight, isHomeBasic, isGym);
                } else {
                    workoutPlan[dayName] = generateCardioWorkout(duration, fitnessLevel, isBodyweight);
                }
            }
        }

        return workoutPlan;
    }

    function generateCardioWorkout(duration, level, isBodyweight) {
        const exercises = [];

        if (duration === '30 minutes') {
            exercises.push({ name: 'Warm-up', sets: '5 min light movement', rest: '' });
            exercises.push({ name: 'HIIT Circuit', sets: '20 min (4 rounds)', rest: 'Rest 1 min between rounds' });
            exercises.push({ name: 'Cool-down', sets: '5 min stretching', rest: '' });
        } else if (duration === '45 minutes') {
            exercises.push({ name: 'Warm-up', sets: '5 min', rest: '' });
            exercises.push({ name: 'Running/Jogging', sets: '30 min', rest: 'Moderate pace' });
            exercises.push({ name: 'Cool-down', sets: '10 min stretching', rest: '' });
        } else {
            exercises.push({ name: 'Warm-up', sets: '10 min', rest: '' });
            exercises.push({ name: 'Running/Jogging', sets: '40 min', rest: 'Moderate to fast pace' });
            exercises.push({ name: 'Cool-down', sets: '10 min stretching', rest: '' });
        }

        return {
            type: 'Cardio',
            exercises: exercises,
            notes: 'Focus on maintaining steady pace. Increase intensity gradually.'
        };
    }

    function generateStrengthWorkout(duration, level, isBodyweight, isHomeBasic, isGym) {
        const exercises = [];
        let reps, sets;

        if (level === 'beginner') {
            reps = '8-10';
            sets = '3';
        } else if (level === 'intermediate') {
            reps = '10-12';
            sets = '3-4';
        } else {
            reps = '12-15';
            sets = '4';
        }

        if (isBodyweight) {
            exercises.push({ name: 'Push-ups', sets: `${sets} sets x ${reps} reps`, rest: '60 sec rest' });
            exercises.push({ name: 'Bodyweight Squats', sets: `${sets} sets x ${reps} reps`, rest: '60 sec rest' });
            exercises.push({ name: 'Plank', sets: `${sets} sets x 30-60 sec`, rest: '60 sec rest' });
            exercises.push({ name: 'Lunges', sets: `${sets} sets x ${reps} reps each leg`, rest: '60 sec rest' });
            exercises.push({ name: 'Dips (on chair)', sets: `${sets} sets x ${reps} reps`, rest: '60 sec rest' });
        } else if (isHomeBasic) {
            exercises.push({ name: 'Dumbbell Press', sets: `${sets} sets x ${reps} reps`, rest: '60 sec rest' });
            exercises.push({ name: 'Dumbbell Rows', sets: `${sets} sets x ${reps} reps`, rest: '60 sec rest' });
            exercises.push({ name: 'Dumbbell Squats', sets: `${sets} sets x ${reps} reps`, rest: '60 sec rest' });
            exercises.push({ name: 'Dumbbell Lunges', sets: `${sets} sets x ${reps} reps each leg`, rest: '60 sec rest' });
            exercises.push({ name: 'Dumbbell Shoulder Press', sets: `${sets} sets x ${reps} reps`, rest: '60 sec rest' });
        } else {
            exercises.push({ name: 'Bench Press', sets: `${sets} sets x ${reps} reps`, rest: '90 sec rest' });
            exercises.push({ name: 'Barbell Rows', sets: `${sets} sets x ${reps} reps`, rest: '90 sec rest' });
            exercises.push({ name: 'Squats', sets: `${sets} sets x ${reps} reps`, rest: '90 sec rest' });
            exercises.push({ name: 'Deadlifts', sets: `${sets} sets x ${reps} reps`, rest: '90 sec rest' });
            exercises.push({ name: 'Overhead Press', sets: `${sets} sets x ${reps} reps`, rest: '90 sec rest' });
        }

        return {
            type: 'Strength Training',
            exercises: exercises,
            notes: 'Focus on proper form. Increase weight gradually when you can complete all reps easily.'
        };
    }

    function generateUpperBodyWorkout(duration, level, isBodyweight, isHomeBasic, isGym) {
        const exercises = [];
        let reps, sets;

        if (level === 'beginner') {
            reps = '8-10';
            sets = '3';
        } else if (level === 'intermediate') {
            reps = '10-12';
            sets = '4';
        } else {
            reps = '12-15';
            sets = '4-5';
        }

        if (isBodyweight) {
            exercises.push({ name: 'Push-ups', sets: `${sets} sets x ${reps} reps`, rest: '60 sec' });
            exercises.push({ name: 'Pike Push-ups', sets: `${sets} sets x ${reps} reps`, rest: '60 sec' });
            exercises.push({ name: 'Dips', sets: `${sets} sets x ${reps} reps`, rest: '60 sec' });
            exercises.push({ name: 'Pull-ups (if available)', sets: `${sets} sets x max reps`, rest: '90 sec' });
        } else if (isHomeBasic) {
            exercises.push({ name: 'Dumbbell Press', sets: `${sets} sets x ${reps} reps`, rest: '60 sec' });
            exercises.push({ name: 'Dumbbell Rows', sets: `${sets} sets x ${reps} reps`, rest: '60 sec' });
            exercises.push({ name: 'Dumbbell Shoulder Press', sets: `${sets} sets x ${reps} reps`, rest: '60 sec' });
            exercises.push({ name: 'Dumbbell Bicep Curls', sets: `${sets} sets x ${reps} reps`, rest: '60 sec' });
        } else {
            exercises.push({ name: 'Bench Press', sets: `${sets} sets x ${reps} reps`, rest: '90 sec' });
            exercises.push({ name: 'Bent-over Rows', sets: `${sets} sets x ${reps} reps`, rest: '90 sec' });
            exercises.push({ name: 'Overhead Press', sets: `${sets} sets x ${reps} reps`, rest: '90 sec' });
            exercises.push({ name: 'Pull-ups', sets: `${sets} sets x max reps`, rest: '90 sec' });
        }

        return {
            type: 'Upper Body Strength',
            exercises: exercises,
            notes: 'Focus on progressive overload. Track your weights and aim to increase weekly.'
        };
    }

    function generateLowerBodyWorkout(duration, level, isBodyweight, isHomeBasic, isGym) {
        const exercises = [];
        let reps, sets;

        if (level === 'beginner') {
            reps = '10-12';
            sets = '3';
        } else if (level === 'intermediate') {
            reps = '12-15';
            sets = '4';
        } else {
            reps = '15-20';
            sets = '4-5';
        }

        if (isBodyweight) {
            exercises.push({ name: 'Bodyweight Squats', sets: `${sets} sets x ${reps} reps`, rest: '60 sec' });
            exercises.push({ name: 'Lunges', sets: `${sets} sets x ${reps} reps each leg`, rest: '60 sec' });
            exercises.push({ name: 'Bulgarian Split Squats', sets: `${sets} sets x ${reps} reps each leg`, rest: '60 sec' });
            exercises.push({ name: 'Glute Bridges', sets: `${sets} sets x ${reps} reps`, rest: '60 sec' });
        } else if (isHomeBasic) {
            exercises.push({ name: 'Dumbbell Squats', sets: `${sets} sets x ${reps} reps`, rest: '60 sec' });
            exercises.push({ name: 'Dumbbell Lunges', sets: `${sets} sets x ${reps} reps each leg`, rest: '60 sec' });
            exercises.push({ name: 'Dumbbell Romanian Deadlifts', sets: `${sets} sets x ${reps} reps`, rest: '60 sec' });
            exercises.push({ name: 'Dumbbell Calf Raises', sets: `${sets} sets x ${reps} reps`, rest: '60 sec' });
        } else {
            exercises.push({ name: 'Barbell Squats', sets: `${sets} sets x ${reps} reps`, rest: '90 sec' });
            exercises.push({ name: 'Romanian Deadlifts', sets: `${sets} sets x ${reps} reps`, rest: '90 sec' });
            exercises.push({ name: 'Leg Press', sets: `${sets} sets x ${reps} reps`, rest: '90 sec' });
            exercises.push({ name: 'Leg Curls', sets: `${sets} sets x ${reps} reps`, rest: '90 sec' });
        }

        return {
            type: 'Lower Body Strength',
            exercises: exercises,
            notes: 'Focus on full range of motion. Don\'t skip leg day!'
        };
    }

    function generateEnduranceWorkout(duration, level, isBodyweight) {
        const exercises = [];

        exercises.push({ name: 'Warm-up', sets: '10 min easy pace', rest: '' });
        
        if (duration === '30 minutes') {
            exercises.push({ name: 'Interval Running', sets: '15 min (30 sec fast, 60 sec slow)', rest: 'Repeat intervals' });
        } else if (duration === '45 minutes') {
            exercises.push({ name: 'Steady-State Running', sets: '25 min moderate pace', rest: 'Maintain consistent pace' });
        } else {
            exercises.push({ name: 'Long Distance Run', sets: '40 min moderate pace', rest: 'Focus on endurance' });
        }

        exercises.push({ name: 'Cool-down', sets: '5-10 min walking + stretching', rest: '' });

        return {
            type: 'Endurance Training',
            exercises: exercises,
            notes: 'Gradually increase distance and pace. Listen to your body.'
        };
    }

    function displayPlans(dietPlan, workoutPlan) {
        // Display diet plan
        let dietHTML = `
            <div class="plan-content">
                <p><strong>Daily Target:</strong> ${dietPlan.targetCalories} calories</p>
                <p><strong>Macros:</strong> ${dietPlan.proteinGrams}g protein, ${dietPlan.carbGrams}g carbs, ${dietPlan.fatGrams}g fat</p>
                ${dietPlan.dietaryRestrictions.length > 0 ? `<p><strong>Dietary Restrictions:</strong> ${dietPlan.dietaryRestrictions.join(', ')}</p>` : ''}
        `;

        const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        dayNames.forEach(day => {
            const dayCapitalized = day.charAt(0).toUpperCase() + day.slice(1);
            dietHTML += `<div class="plan-day"><h3>${dayCapitalized}</h3>`;
            dietPlan.meals[day].forEach(meal => {
                dietHTML += `
                    <div class="meal-item">
                        <strong>${meal.meal}:</strong> ${meal.food}
                        <br><span>${meal.protein}</span>
                    </div>
                `;
            });
            dietHTML += `</div>`;
        });

        dietHTML += `</div>`;
        dietPlanContent.innerHTML = dietHTML;

        // Display workout plan
        let workoutHTML = `<div class="plan-content">`;

        dayNames.forEach(day => {
            if (workoutPlan[day]) {
                const dayCapitalized = day.charAt(0).toUpperCase() + day.slice(1);
                const workout = workoutPlan[day];
                workoutHTML += `<div class="plan-day"><h3>${dayCapitalized} - ${workout.type}</h3>`;
                workout.exercises.forEach(ex => {
                    workoutHTML += `
                        <div class="exercise-item">
                            <strong>${ex.name}:</strong> ${ex.sets}
                            ${ex.rest ? `<br><span>${ex.rest}</span>` : ''}
                        </div>
                    `;
                });
                workoutHTML += `<p><em>${workout.notes}</em></p></div>`;
            }
        });

        workoutHTML += `</div>`;
        workoutPlanContent.innerHTML = workoutHTML;
    }

    function saveDietPlan() {
        // This would integrate with the food tracking system
        alert("Diet plan saved! (This would integrate with your food tracking in a full implementation)");
    }

    function saveWorkoutPlan() {
        // This would integrate with the exercise tracking system
        alert("Workout plan saved! (This would integrate with your exercise tracking in a full implementation)");
    }

    function resetConversation() {
        // Reset everything
        conversationState.currentQuestion = 0;
        userProfile = {
            goal: null,
            age: null,
            weight: null,
            height: null,
            activityLevel: null,
            dietaryRestrictions: [],
            workoutFrequency: null,
            workoutDuration: null,
            fitnessLevel: null,
            equipment: null
        };

        chatMessages.innerHTML = `
            <div class="message bot-message">
                <div class="message-content">
                    <p>👋 Hi! I'm your AI Fitness Assistant. I'll help you create a personalized diet and workout plan.</p>
                    <p>Let me ask you a few questions to understand your goals and preferences:</p>
                    <p><strong>What's your primary fitness goal?</strong></p>
                </div>
            </div>
        `;

        planOutput.style.display = "none";
        showQuickOptions(['weight-loss', 'muscle-gain', 'maintain', 'endurance']);
        chatInput.focus();
    }

    function addMessage(text, sender) {
        const messageDiv = document.createElement("div");
        messageDiv.className = `message ${sender}-message`;
        
        const contentDiv = document.createElement("div");
        contentDiv.className = "message-content";
        contentDiv.textContent = text;
        
        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addBotMessage(text) {
        addMessage(text, "bot");
    }

    function showTypingIndicator() {
        const typingDiv = document.createElement("div");
        typingDiv.className = "message bot-message";
        typingDiv.id = "typing-indicator";
        
        const contentDiv = document.createElement("div");
        contentDiv.className = "message-content";
        contentDiv.innerHTML = `
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        
        typingDiv.appendChild(contentDiv);
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function hideTypingIndicator() {
        const indicator = document.getElementById("typing-indicator");
        if (indicator) {
            indicator.remove();
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

