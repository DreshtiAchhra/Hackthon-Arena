/**
 * Mood Store - Manages mood data and provides personalized recommendations
 * Integrates with Resource Hub for dynamic content adaptation
 */

class MoodStore {
    constructor() {
        this.sessionId = this.getSessionId();
        this.moodData = [];
        this.patterns = [];
        this.recommendations = [];
        this.isLoading = false;
        this.listeners = [];
    }

    getSessionId() {
        // Use the same session ID as the chat system
        return window.empSessionId || 'session_' + Math.random().toString(36).substring(2, 10);
    }

    // Subscribe to mood store changes
    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    // Notify all listeners of changes
    notify() {
        this.listeners.forEach(callback => callback(this.getState()));
    }

    // Get current state
    getState() {
        return {
            moodData: this.moodData,
            patterns: this.patterns,
            recommendations: this.recommendations,
            isLoading: this.isLoading,
            dominantMood: this.getDominantMood(),
            stressLevel: this.calculateStressLevel()
        };
    }

    // Fetch mood logs from backend and localStorage
    async fetchMoodData() {
        this.isLoading = true;
        this.notify();

        try {
            // Fetch from backend
            const response = await fetch(`http://localhost:8000/mood-logs/${this.sessionId}`);
            if (response.ok) {
                const data = await response.json();
                this.moodData = data.mood_logs || [];
            }
        } catch (error) {
            console.warn('Backend mood data fetch failed, using localStorage only:', error);
        }

        // Merge with localStorage journal entries
        this.mergeLocalStorageData();

        // Analyze patterns
        await this.analyzePatterns();

        // Generate recommendations
        this.generateRecommendations();

        this.isLoading = false;
        this.notify();
    }

    // Merge localStorage journal data
    mergeLocalStorageData() {
        try {
            const journalEntries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
            const localMoodData = journalEntries.map(entry => ({
                mood: entry.mood,
                timestamp: new Date(entry.timestamp).toISOString(),
                source: 'journal'
            }));

            // Combine and deduplicate
            const combined = [...this.moodData, ...localMoodData];
            const unique = combined.filter((item, index, self) =>
                index === self.findIndex(t => t.timestamp === item.timestamp)
            );

            this.moodData = unique.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        } catch (error) {
            console.warn('Error merging localStorage data:', error);
        }
    }

    // Analyze mood patterns
    async analyzePatterns() {
        try {
            const response = await fetch(`http://localhost:8000/analyze-mood-patterns/${this.sessionId}`);
            if (response.ok) {
                const data = await response.json();
                this.patterns = data.patterns || [];
            }
        } catch (error) {
            console.warn('Pattern analysis failed:', error);
            // Fallback pattern detection
            this.fallbackPatternAnalysis();
        }
    }

    // Fallback pattern analysis when backend is unavailable
    fallbackPatternAnalysis() {
        if (this.moodData.length < 3) return;

        const recentMoods = this.moodData.slice(0, 7).map(d => d.mood.toLowerCase());
        const negativeMoods = ['sad', 'stressed', 'anxious'];

        // Check for consecutive negative moods
        let consecutiveNegative = 0;
        for (let mood of recentMoods) {
            if (negativeMoods.includes(mood)) {
                consecutiveNegative++;
            } else {
                break;
            }
        }

        if (consecutiveNegative >= 3) {
            this.patterns.push('consecutive_negative_moods');
        }

        // Check sleep patterns
        const lowSleepEntries = this.moodData.filter(d => (d.sleep_hours || 8) < 6);
        if (lowSleepEntries.length >= 4) {
            this.patterns.push('sleep_deprivation');
        }
    }

    // Get dominant mood from recent entries
    getDominantMood() {
        if (this.moodData.length === 0) return null;

        const recentMoods = this.moodData.slice(0, 7);
        const moodCounts = {};

        recentMoods.forEach(entry => {
            const mood = entry.mood.toLowerCase();
            moodCounts[mood] = (moodCounts[mood] || 0) + 1;
        });

        return Object.keys(moodCounts).reduce((a, b) =>
            moodCounts[a] > moodCounts[b] ? a : b, null
        );
    }

    // Calculate stress level based on patterns
    calculateStressLevel() {
        let stressLevel = 0;

        if (this.patterns.includes('consecutive_negative_moods')) stressLevel += 3;
        if (this.patterns.includes('sleep_deprivation')) stressLevel += 2;

        const dominantMood = this.getDominantMood();
        if (['stressed', 'anxious'].includes(dominantMood)) stressLevel += 2;
        if (dominantMood === 'sad') stressLevel += 1;

        return Math.min(stressLevel, 5); // Max stress level of 5
    }

    // Generate personalized recommendations
    generateRecommendations() {
        this.recommendations = [];

        const dominantMood = this.getDominantMood();
        const stressLevel = this.calculateStressLevel();

        // Mood-based recommendations
        if (dominantMood === 'sad') {
            this.recommendations.push({
                type: 'uplifting',
                title: 'Uplifting Content for You',
                description: 'Based on your recent mood logs, here are some uplifting resources to brighten your day.',
                resources: ['inspire', 'activities'],
                priority: 'high'
            });
        } else if (dominantMood === 'anxious') {
            this.recommendations.push({
                type: 'calming',
                title: 'Anxiety Relief Resources',
                description: 'Try these breathing exercises and grounding techniques to help manage anxiety.',
                resources: ['relax', 'self-help'],
                priority: 'high'
            });
        } else if (dominantMood === 'stressed') {
            this.recommendations.push({
                type: 'stress_relief',
                title: 'Stress Management Tools',
                description: 'Your stress levels are elevated. These resources can help you find relief.',
                resources: ['relax', 'activities'],
                priority: 'high'
            });
        }

        // Pattern-based recommendations
        if (this.patterns.includes('sleep_deprivation')) {
            this.recommendations.push({
                type: 'sleep',
                title: 'Sleep Improvement Resources',
                description: 'Your sleep patterns suggest you could benefit from better sleep hygiene.',
                resources: ['self-help'],
                priority: 'medium'
            });
        }

        // Stress level recommendations
        if (stressLevel >= 3) {
            this.recommendations.push({
                type: 'emergency_calm',
                title: 'Emergency Calming Toolkit',
                description: 'High stress detected. Access immediate calming resources.',
                resources: ['relax', 'support'],
                priority: 'urgent'
            });
        }

        // Default recommendations if no specific patterns
        if (this.recommendations.length === 0) {
            this.recommendations.push({
                type: 'general_wellness',
                title: 'Daily Wellness Check',
                description: 'Maintain your mental wellness with these daily practices.',
                resources: ['self-help', 'activities'],
                priority: 'low'
            });
        }
    }

    // Add new mood entry
    async addMoodEntry(mood, additionalData = {}) {
        const entry = {
            mood: mood,
            timestamp: new Date().toISOString(),
            ...additionalData
        };

        // Save to localStorage for immediate access
        const journalEntries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
        journalEntries.push({
            date: new Date().toLocaleDateString(),
            mood: mood,
            entry: additionalData.note || '',
            timestamp: entry.timestamp
        });
        localStorage.setItem('journalEntries', JSON.stringify(journalEntries));

        // Send to backend
        try {
            await fetch('http://localhost:8000/metrics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: this.sessionId,
                    mood: mood,
                    sleep_hours: additionalData.sleep_hours || 0,
                    activity_engagement: additionalData.activity_engagement || 0
                })
            });
        } catch (error) {
            console.warn('Failed to save mood to backend:', error);
        }

        // Refresh data
        await this.fetchMoodData();
    }

    // Get resource priority order based on current mood
    getResourceOrder() {
        const dominantMood = this.getDominantMood();
        const stressLevel = this.calculateStressLevel();

        const baseOrder = ['relax', 'learn', 'self-help', 'inspire', 'activities', 'support'];

        // Reorder based on mood and stress
        if (stressLevel >= 3) {
            // High stress: prioritize calming resources
            return ['relax', 'support', 'self-help', 'activities', 'inspire', 'learn'];
        } else if (dominantMood === 'sad') {
            // Sad: prioritize uplifting content
            return ['inspire', 'activities', 'relax', 'self-help', 'learn', 'support'];
        } else if (dominantMood === 'anxious') {
            // Anxious: prioritize breathing and grounding
            return ['relax', 'self-help', 'activities', 'inspire', 'learn', 'support'];
        }

        return baseOrder;
    }

    // Get wellness insights for banners
    getWellnessInsights() {
        const insights = [];
        const dominantMood = this.getDominantMood();
        const stressLevel = this.calculateStressLevel();

        if (dominantMood) {
            insights.push(`Your dominant mood this week: ${dominantMood}`);
        }

        if (stressLevel >= 3) {
            insights.push("Consider taking a short break to manage stress levels");
        }

        if (this.patterns.includes('sleep_deprivation')) {
            insights.push("Your sleep patterns suggest possible fatigue - check our sleep resources");
        }

        if (this.patterns.includes('consecutive_negative_moods')) {
            insights.push("You've been feeling down - remember to reach out for support");
        }

        return insights;
    }
}

// Create global mood store instance
window.moodStore = new MoodStore();