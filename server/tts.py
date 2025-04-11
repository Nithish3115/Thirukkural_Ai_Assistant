import os
import sys
import json
import base64
from gtts import gTTS
import re

def remove_html_tags(text):
    """Remove HTML tags like <br> from text"""
    return re.sub(r'<.*?>', ' ', text)

def text_to_speech(text, language):
    """
    Convert text to speech using gTTS
    
    Args:
        text (str): Text to convert to speech
        language (str): Language code ('ta' for Tamil, 'en' for English)
    
    Returns:
        str: Base64 encoded audio data
    """
    try:
        # Clean the text by removing HTML tags
        clean_text = remove_html_tags(text)
        
        # Map language code
        lang_code = 'ta' if language == 'tamil' else 'en'
        
        # Create a temporary file path
        temp_file = f"temp_audio_{language}.mp3"
        
        # Generate speech
        tts = gTTS(text=clean_text, lang=lang_code, slow=False)
        tts.save(temp_file)
        
        # Read the file and encode to base64
        with open(temp_file, "rb") as audio_file:
            audio_data = base64.b64encode(audio_file.read()).decode('utf-8')
        
        # Remove the temporary file
        if os.path.exists(temp_file):
            os.remove(temp_file)
        
        return audio_data
        
    except Exception as e:
        print(f"Error in text_to_speech: {str(e)}")
        return None

if __name__ == "__main__":
    # Get input parameters from command line
    if len(sys.argv) < 3:
        print("Usage: python tts.py <text> <language>")
        sys.exit(1)
    
    text = sys.argv[1]
    language = sys.argv[2]
    
    # Generate audio and return as base64
    audio_data = text_to_speech(text, language)
    
    # Output as JSON
    result = {
        "audio_data": audio_data,
        "text": remove_html_tags(text)
    }
    
    print(json.dumps(result))