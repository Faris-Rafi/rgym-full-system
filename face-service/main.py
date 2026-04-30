from fastapi import FastAPI, File, UploadFile, HTTPException
from deepface import DeepFace
import numpy as np
import cv2
import os
import shutil
import json

app = FastAPI()

FACES_DIR = "./faces"
os.makedirs(FACES_DIR, exist_ok=True)

@app.get("/")
def root():
    return {"message": "Face Recognition Service is running 👁️"}

# Register a member's face
@app.post("/register/{member_id}")
async def register_face(member_id: int, file: UploadFile = File(...)):
    try:
        member_dir = os.path.join(FACES_DIR, str(member_id))
        os.makedirs(member_dir, exist_ok=True)

        file_path = os.path.join(member_dir, "face.jpg")
        with open(file_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        # Verify it's actually a face
        result = DeepFace.extract_faces(img_path=file_path, enforce_detection=True)
        if not result:
            os.remove(file_path)
            raise HTTPException(status_code=400, detail="No face detected in the image")

        return {"message": f"Face registered successfully for member {member_id}"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
# Recognize a face from uploaded image
@app.post("/recognize")
async def recognize_face(file: UploadFile = File(...)):
    try:
        # Save uploaded image temporarily
        temp_path = "./temp_recognize.jpg"
        with open(temp_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        if not os.path.exists(FACES_DIR) or not os.listdir(FACES_DIR):
            raise HTTPException(status_code=400, detail="No registered faces available for recognition")
        
        # Compare against all registered faces
        best_match = None
        best_distance = float("inf")

        for member_id in os.listdir(FACES_DIR):
            face_path = os.path.join(FACES_DIR, member_id, "face.jpg")
            if not os.path.exists(face_path):
                continue
            
            try:
                result = DeepFace.verify(img1_path=temp_path, img2_path=face_path, enforce_detection=False)
                if result["verified"] and result["distance"] < best_distance:
                    best_distance = result["distance"]
                    best_match = member_id
            except Exception as e:
                continue
            
        os.remove(temp_path)

        if best_match:
            return {
                "matched": True,
                "member_id": int(best_match),
                "confidence": round((1 - best_distance) * 100, 2)
            }
        else:
            return {"matched": False, "message": "No matching face found"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# Delete a member's face
@app.delete("/faces/{member_id}")
def delete_face(member_id: int):
    member_dir = os.path.join(FACES_DIR, str(member_id))
    if os.path.exists(member_dir):
        shutil.rmtree(member_dir)
        return {"message": f"Face data for member {member_id} deleted successfully"}
    else:
        raise HTTPException(status_code=404, detail="Member not found")