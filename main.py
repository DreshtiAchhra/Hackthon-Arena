from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import os
import config

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory

from database import get_message_history, save_user_metrics, save_intervention, get_recent_interventions, get_recent_metrics

# Setup Gemini API key
os.environ["GOOGLE_API_KEY"] = config.GEMINI_API_KEY

app = FastAPI(title="Empathetic AI Chatbot API")

# Enable CORS for the frontend widget
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    session_id: str = "default_session"

class ChatResponse(BaseModel):
    ai_response: str = Field(description="The empathetic and supportive response from the AI")
    emotion: str = Field(description="The detected emotion of the user (e.g., Happy, Sad, Anxious, Stressed, Neutral)")
    stress_score: int = Field(description="Estimated stress level of the user from 1 (lowest) to 10 (highest)")
    intervention_needed: bool = Field(description="Set to true if the user's message indicates severe distress, self-harm, or requires human help")
    recommended_resource: str = Field(description="Optional. If the user needs help, provide a link or recommendation to a specific section in the Resource Hub, e.g. 'scrollable.html#relax' for relaxation videos or 'Booking.html' for counselor booking.", default="")

class MetricsRequest(BaseModel):
    session_id: str
    mood: str = ""
    sleep_hours: float = 0.0
    activity_engagement: int = 0

# Initialize Gemini model with structured output
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.7)
structured_llm = llm.with_structured_output(ChatResponse)

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are an empathetic, supportive, and context-aware AI chatbot for a mental health platform. "
               "Your goal is to provide helpful, kind, and emotionally intelligent responses. "
               "Analyze the user's input to determine their emotional state and stress level (1-10). "
               "If the user expresses thoughts of self-harm, extreme distress, or imminent danger, set intervention_needed to true. "
               "If the user would benefit from a resource (e.g. they are stressed or anxious), recommend a specific section in our Resource Hub in 'recommended_resource' (e.g. 'scrollable.html#relax' for breathing/meditation, 'scrollable.html#self-help' for journals). "
               "Keep your conversational responses natural and understanding."),
    MessagesPlaceholder(variable_name="history"),
    ("human", "{input}")
])

chain = prompt | structured_llm

chain_with_history = RunnableWithMessageHistory(
    chain,
    get_message_history,
    input_messages_key="input",
    history_messages_key="history",
)

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
        
    try:
        response = chain_with_history.invoke(
            {"input": request.message},
            config={"configurable": {"session_id": request.session_id}}
        )
        
        # Proactively trigger an intervention if stress is high
        if response.intervention_needed or response.stress_score >= 7:
            save_intervention(request.session_id, {
                "type": "danger" if response.intervention_needed else "warning",
                "icon": "🚨" if response.intervention_needed else "⚠️",
                "title": "High Stress Detected",
                "text": "You seem overwhelmed right now. Please consider taking a break or booking a counselor.",
                "action_url": "Booking.html" if response.intervention_needed else "scrollable.html#relax"
            })
            
        return response
    except Exception as e:
        print(f"Error calling Gemini: {e}")
        # Fallback if structured output fails
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/metrics")
async def track_metrics(request: MetricsRequest):
    metrics_data = {
        "mood": request.mood,
        "sleep_hours": request.sleep_hours,
        "activity_engagement": request.activity_engagement
    }
    save_user_metrics(request.session_id, metrics_data)

    interventions = []
    
    if request.mood.lower() in ["stressed", "anxious", "sad"]:
        interventions.append({
            "type": "warning",
            "icon": "⚠️",
            "title": "Mood Alert",
            "text": "We noticed you're feeling down. Take a 2-minute breathing break.",
            "action_url": "scrollable.html#relax"
        })

    if 0 < request.sleep_hours < 5:
        interventions.append({
            "type": "info",
            "icon": "😴",
            "title": "Sleep Pattern Alert",
            "text": "Your sleep trend suggests fatigue. Check out our sleep hygiene resources.",
            "action_url": "scrollable.html#self-help"
        })
    
    for inv in interventions:
        save_intervention(request.session_id, inv)
        
    return {"status": "Metrics logged", "triggered_interventions": len(interventions)}

@app.get("/mood-logs/{session_id}")
async def get_mood_logs(session_id: str, limit: int = 10):
    """Get recent mood logs for a user session"""
    metrics = get_recent_metrics(session_id, limit)
    
    # Extract mood-related data
    mood_logs = []
    for metric in metrics:
        if metric.get("mood"):
            mood_logs.append({
                "mood": metric["mood"],
                "timestamp": metric["timestamp"],
                "sleep_hours": metric.get("sleep_hours", 0),
                "activity_engagement": metric.get("activity_engagement", 0)
            })
    
    return {"mood_logs": mood_logs}

@app.post("/analyze-mood-patterns/{session_id}")
async def analyze_mood_patterns(session_id: str):
    """Analyze mood patterns and return insights"""
    metrics = get_recent_metrics(session_id, 30)  # Last 30 entries
    
    if not metrics:
        return {"patterns": [], "insights": ["No mood data available yet. Start tracking your mood!"]}
    
    # Simple pattern analysis
    patterns = []
    insights = []
    
    mood_counts = {}
    recent_moods = []
    
    for metric in metrics[-7:]:  # Last 7 entries
        mood = metric.get("mood", "").lower()
        if mood:
            recent_moods.append(mood)
            mood_counts[mood] = mood_counts.get(mood, 0) + 1
    
    # Detect patterns
    if len(recent_moods) >= 3:
        # Check for consecutive negative moods
        negative_moods = ["sad", "stressed", "anxious"]
        consecutive_negative = 0
        for mood in recent_moods[-5:]:
            if mood in negative_moods:
                consecutive_negative += 1
            else:
                break
        
        if consecutive_negative >= 3:
            patterns.append("consecutive_negative_moods")
            insights.append("You've been feeling down for several days. Consider reaching out for support.")
        
        # Check for sleep deprivation
        low_sleep_count = sum(1 for m in metrics[-7:] if m.get("sleep_hours", 8) < 6)
        if low_sleep_count >= 4:
            patterns.append("sleep_deprivation")
            insights.append("Your sleep patterns suggest possible fatigue. Check our sleep resources.")
    
    # Most common mood
    if mood_counts:
        dominant_mood = max(mood_counts, key=mood_counts.get)
        patterns.append(f"dominant_mood_{dominant_mood}")
        insights.append(f"Your most common recent mood is {dominant_mood}.")
    
    return {
        "patterns": patterns,
        "insights": insights,
        "mood_distribution": mood_counts,
        "recent_trend": recent_moods[-3:] if recent_moods else []
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
