from flask import Flask, request, render_template, jsonify
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import load_img, img_to_array
import numpy as np
import os

# Load the CNN model
# custom_objects = {'reduction': None}  # Adjust as necessary
model = load_model('cnn.h5')

# Define class names
CLASS_NAMES = ['black', 'transparent', 'color']

# Set up Flask
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads/'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def preprocess_image(image_path, target_size=(256, 256)):
    image = load_img(image_path, target_size=target_size)
    image = img_to_array(image)  # Convert to array
    image = np.expand_dims(image, axis=0)  # Add batch dimension
    return image

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    # Save the file and prepare for prediction
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(file_path)

    # Preprocess and make prediction
    processed_image = preprocess_image(file_path)
    prediction = model.predict(processed_image)
    predicted_class = CLASS_NAMES[np.argmax(prediction)]
    
    # Prepare probabilities
    probabilities = {CLASS_NAMES[i]: float(prediction[0][i]) for i in range(len(CLASS_NAMES))}

    os.remove(file_path)  # Clean up the uploaded file

    return jsonify({"predicted_class": predicted_class, "probabilities": probabilities})

if __name__ == '__main__':
    app.run(debug=True)
