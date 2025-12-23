from flask import Flask, request, jsonify
from flask_cors import CORS
from io import BytesIO
from PIL import Image
import numpy as np
import tensorflow as tf
import base64
import json
import cv2
import os
import joblib
import random
from pymongo import MongoClient
from datetime import datetime

# ---------------- Flask setup ----------------
app = Flask(__name__)
CORS(app)

# ---------------- Paths ----------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")

EMOTION_MODEL_PATH = os.path.join(MODEL_DIR, "emotion_cnn.keras")
LABELS_PATH = os.path.join(MODEL_DIR, "emotion_cnn.labels.json")
RECOMMENDER_PATH = os.path.join(MODEL_DIR, "song_recommender.joblib")
ENCODER_PATH = os.path.join(MODEL_DIR, "emotion_encoder.joblib")
CASCADE_PATH = os.path.join(BASE_DIR, "haarcascade_frontalface_default.xml")

# ---------------- Load emotion CNN ----------------
emotion_model = tf.keras.models.load_model(EMOTION_MODEL_PATH)

with open(LABELS_PATH, "r") as f:
    emotion_labels = json.load(f)

print("✅ Emotion CNN loaded")
print(f"🎭 Face emotions: {emotion_labels}")

# ---------------- Load recommender ----------------
song_recommender = joblib.load(RECOMMENDER_PATH)
emotion_encoder = joblib.load(ENCODER_PATH)

print("✅ Song recommender loaded")
print(f"🎵 Song emotions: {list(emotion_encoder.classes_)}")

# ---------------- Load face detector ----------------
face_cascade = cv2.CascadeClassifier(CASCADE_PATH)
if face_cascade.empty():
    raise RuntimeError("❌ Haar Cascade not loaded")

# ---------------- MongoDB ----------------
client = MongoClient("mongodb://localhost:27017/")
db = client["musicDB"]
songs_collection = db["songs"]

# Session memory to track recently shown songs
recent_songs = {}  # {user_ip: [song_ids]}
MAX_RECENT_SONGS = 20

# ---------------- Helpers ----------------
def decode_base64_image(b64_string):
    b64_string = b64_string.split(",")[-1]
    missing_padding = len(b64_string) % 4
    if missing_padding:
        b64_string += "=" * (4 - missing_padding)
    return base64.b64decode(b64_string)

def extract_face(pil_image):
    img = np.array(pil_image.convert("RGB"))
    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)

    faces = face_cascade.detectMultiScale(gray, 1.3, 5)
    if len(faces) == 0:
        return None

    x, y, w, h = max(faces, key=lambda f: f[2] * f[3])
    return img[y:y+h, x:x+w]

def preprocess_face(face_img):
    face_img = cv2.resize(face_img, (224, 224))
    face_img = face_img.astype(np.float32)
    face_img = tf.keras.applications.mobilenet_v2.preprocess_input(face_img)
    return np.expand_dims(face_img, axis=0)

def get_varied_recommendations(features, valid_songs, target_emotion=None, user_ip=None):
    """
    Get varied song recommendations with randomization
    """
    try:
        # Get emotion probabilities for all songs
        probabilities = song_recommender.predict_proba(features)
        
        # Calculate scores based on target emotion
        if target_emotion and target_emotion in emotion_encoder.classes_:
            # Specific emotion requested
            emotion_idx = list(emotion_encoder.classes_).index(target_emotion)
            scores = probabilities[:, emotion_idx]
        else:
            # For neutral: find balanced songs
            scores = 1 - np.max(probabilities, axis=1)
        
        # Get recently shown songs for this user (if tracking)
        recent_song_ids = []
        if user_ip and user_ip in recent_songs:
            recent_song_ids = recent_songs[user_ip]
        
        # Combine songs with their scores and other metrics for variety
        song_data = []
        for i, (song, score) in enumerate(zip(valid_songs, scores)):
            song_id = str(song.get("_id", i))
            
            # Calculate variety factors
            danceability = float(song.get("danceability", 0.5))
            energy = float(song.get("energy", 0.5))
            tempo = float(song.get("tempo", 120))
            
            # Penalty for recently shown songs
            recency_penalty = 0.5 if song_id in recent_song_ids else 1.0
            
            # Add some randomness to avoid always same order
            random_factor = random.uniform(0.8, 1.2)
            
            # Combine score with variety factors
            # Higher tempo and energy get slight boost for variety
            tempo_factor = 1.0 + (tempo - 120) / 240  # ±20% based on tempo
            diversity_score = score * recency_penalty * random_factor * tempo_factor
            
            song_data.append({
                "song": song,
                "original_score": score,
                "diversity_score": diversity_score,
                "song_id": song_id,
                "danceability": danceability,
                "energy": energy
            })
        
        # Sort by diversity score (not just emotion score)
        song_data.sort(key=lambda x: x["diversity_score"], reverse=True)
        
        # Strategy 1: Take top 20, then shuffle selection
        top_n = min(20, len(song_data))
        top_songs = song_data[:top_n]
        
        # Group by score ranges for variety
        high_score = [s for s in top_songs if s["original_score"] > 0.7]
        mid_score = [s for s in top_songs if 0.4 <= s["original_score"] <= 0.7]
        low_score = [s for s in top_songs if s["original_score"] < 0.4]
        
        # Select mix of songs from different score ranges
        selected = []
        
        # Take 2 from high score (if available)
        if high_score:
            selected.extend(random.sample(high_score, min(2, len(high_score))))
        
        # Take 2 from mid score (if available)
        if mid_score:
            selected.extend(random.sample(mid_score, min(2, len(mid_score))))
        
        # Take 1 from low score for variety (if available)
        if low_score and len(selected) < 5:
            selected.extend(random.sample(low_score, min(1, len(low_score))))
        
        # If we still don't have 5 songs, fill from top songs
        if len(selected) < 5:
            remaining_needed = 5 - len(selected)
            # Get songs not already selected
            available = [s for s in top_songs if s not in selected]
            if available:
                selected.extend(random.sample(available, min(remaining_needed, len(available))))
        
        # Shuffle the final selection
        random.shuffle(selected)
        
        # Update recent songs (simplified - using session memory)
        if user_ip:
            new_recent_ids = [s["song_id"] for s in selected]
            if user_ip not in recent_songs:
                recent_songs[user_ip] = []
            recent_songs[user_ip] = (recent_songs[user_ip] + new_recent_ids)[-MAX_RECENT_SONGS:]
        
        return [(item["song"], item["original_score"]) for item in selected]
        
    except Exception as e:
        print(f"⚠️ Error in varied recommendations: {e}")
        # Fallback: random selection
        combined = list(zip(valid_songs, scores if 'scores' in locals() else [0]*len(valid_songs)))
        random.shuffle(combined)
        return combined[:5]

def map_face_to_song_emotion(face_emotion):
    """Map face emotion to song emotion categories"""
    face_emotion_lower = face_emotion.lower()
    
    # Direct matches
    if face_emotion_lower in ["happy", "sad", "neutral"]:
        return face_emotion_lower
    
    # Map other common face emotions
    emotion_map = {
        "angry": "sad",
        "disgust": "sad", 
        "fear": "sad",
        "surprise": "happy",
        "contempt": "neutral",
    }
    
    return emotion_map.get(face_emotion_lower, "neutral")

# ---------------- API ----------------
@app.route("/api/scan-face", methods=["POST"])
def scan_face():
    start_time = datetime.now()
    print(f"\n📸 New scan request at {start_time.strftime('%H:%M:%S')}")
    
    # Get user IP for session tracking
    user_ip = request.remote_addr
    
    data = request.get_json()
    if not data or "image" not in data:
        return jsonify({"error": "Image not provided", "emotion": "neutral", "songs": []}), 400

    try:
        image_bytes = decode_base64_image(data["image"])
        image = Image.open(BytesIO(image_bytes))
        print("✅ Image decoded successfully")
    except Exception as e:
        print(f"❌ Image error: {e}")
        return jsonify({"error": f"Invalid image: {str(e)}", "emotion": "neutral", "songs": []}), 400

    # Face detection
    face = extract_face(image)
    if face is None:
        print("⚠️ No face detected")
        face_emotion = "neutral"
        confidence = 0.0
    else:
        # Emotion prediction
        face_tensor = preprocess_face(face)
        preds = emotion_model.predict(face_tensor, verbose=0)
        
        emotion_idx = int(np.argmax(preds))
        face_emotion = emotion_labels[emotion_idx]
        confidence = float(preds[0][emotion_idx])
        
        print(f"🎭 Face emotion: {face_emotion} ({confidence:.1%} confidence)")

    # Map to song emotion
    song_emotion = map_face_to_song_emotion(face_emotion)
    print(f"🎵 Mapped to song emotion: {song_emotion}")

    # Fetch all songs
    all_songs = list(songs_collection.find())
    print(f"📊 Total songs in database: {len(all_songs)}")
    
    if not all_songs:
        print("❌ No songs in database")
        return jsonify({"emotion": song_emotion, "songs": []}), 200

    # Prepare features
    features = []
    valid_songs = []
    
    for song in all_songs:
        try:
            features.append([
                float(song.get("danceability", 0.5)),
                float(song.get("tempo", 120.0)),
                float(song.get("acousticness", 0.5)),
                float(song.get("energy", 0.5)),
                float(song.get("valence", 0.5))
            ])
            valid_songs.append(song)
        except Exception as e:
            continue  # Skip songs with missing features

    if not features:
        print("❌ No songs with valid features")
        return jsonify({"emotion": song_emotion, "songs": []}), 200

    X = np.array(features)
    print(f"✅ Processing {len(features)} valid songs")

    # Get varied song recommendations
    ranked_songs = get_varied_recommendations(X, valid_songs, song_emotion, user_ip)
    
    # Prepare response
    recommended_songs = []
    for song, score in ranked_songs[:5]:  # Get top 5
        recommended_songs.append({
            "title": song.get("title", "Unknown Song"),
            "artist": song.get("artist", "Unknown Artist"),
            "album": song.get("album", ""),
            "score": round(float(score), 3),
            "danceability": round(float(song.get("danceability", 0)), 2),
            "energy": round(float(song.get("energy", 0)), 2),
            "valence": round(float(song.get("valence", 0)), 2),
            "tempo": round(float(song.get("tempo", 0)), 1)
        })

    # Calculate response time
    response_time = (datetime.now() - start_time).total_seconds()
    
    print(f"✅ Recommended {len(recommended_songs)} varied songs for '{song_emotion}'")
    print(f"🎲 Songs: {[s['title'] for s in recommended_songs]}")
    print(f"⏱️  Response time: {response_time:.2f}s")
    
    return jsonify({
        "emotion": song_emotion,
        "face_emotion": face_emotion,
        "confidence": round(confidence, 3),
        "songs": recommended_songs,
        "response_time": response_time,
        "total_songs_considered": len(features),
        "selection_type": "varied"  # Indicate varied selection
    }), 200

# ---------------- Reset recent songs ----------------
@app.route("/api/reset-history", methods=["POST"])
def reset_history():
    """Reset recent song history for a user"""
    user_ip = request.remote_addr
    if user_ip in recent_songs:
        recent_songs[user_ip] = []
        return jsonify({"message": "History reset for your session"}), 200
    return jsonify({"message": "No history found"}), 200

# ---------------- Health check ----------------
@app.route("/api/health", methods=["GET"])
def health():
    """Health check endpoint"""
    try:
        total_songs = songs_collection.count_documents({})
        
        # Get some random sample songs
        all_songs = list(songs_collection.find({}, {"title": 1, "artist": 1}))
        if all_songs:
            sample_songs = random.sample(all_songs, min(5, len(all_songs)))
            sample_titles = [f"{s.get('title', 'Unknown')} - {s.get('artist', 'Unknown')}" 
                           for s in sample_songs]
        else:
            sample_titles = []
        
        return jsonify({
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "models": {
                "face_emotions": emotion_labels,
                "song_emotions": list(emotion_encoder.classes_),
                "recommendation_strategy": "varied_with_randomization"
            },
            "database": {
                "total_songs": total_songs,
                "sample_songs": sample_titles,
            },
            "session": {
                "active_sessions": len(recent_songs),
                "max_recent_songs": MAX_RECENT_SONGS
            }
        }), 200
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

# ---------------- Run ----------------
if __name__ == "__main__":
    print("\n" + "="*60)
    print("🎵 MOOD MUSIC RECOMMENDATION SYSTEM")
    print("="*60)
    print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🎭 Face emotions: {emotion_labels}")
    print(f"🎵 Song emotions: {list(emotion_encoder.classes_)}")
    print(f"💿 Songs in database: {songs_collection.count_documents({})}")
    print("🎲 Recommendation strategy: VARIED WITH RANDOMIZATION")
    print("="*60)
    print("🌐 API Server: http://0.0.0.0:5000")
    print("📱 Frontend: http://192.168.18.240:5000")
    print("🔧 Endpoints:")
    print("   POST /api/scan-face    - Scan face and get varied songs")
    print("   POST /api/reset-history- Reset song history")
    print("   GET  /api/health       - System health check")
    print("="*60 + "\n")
    
    # Seed random for reproducibility
    random.seed(datetime.now().timestamp())
    
    app.run(host="0.0.0.0", port=5000, debug=True)