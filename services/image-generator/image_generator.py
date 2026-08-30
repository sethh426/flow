import os
from pathlib import Path
from typing import Dict, Optional
import google.generativeai as genai

class ImageGenerator:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY required")
        genai.configure(api_key=self.api_key)
        self.generation_model = genai.GenerativeModel("gemini-1.5-flash")
        self.output_dir = Path("generated_images")
        self.output_dir.mkdir(exist_ok=True)
    
    def save_binary_file(self, file_name: str, data: bytes) -> str:
        file_path = self.output_dir / file_name
        with open(file_path, "wb") as f:
            f.write(data)
        return str(file_path)
    
    def generate_image(self, prompt: str, product_name: Optional[str] = None,
                      style: Optional[str] = None) -> Dict:
        enhanced = f"{product_name or ''} {prompt} Style:{style or 'default'}"
        response = self.generation_model.generate_content(enhanced)
        return {"success": True, "enhancedPrompt": enhanced, "generatedText": response.text,
                "metadata": {"model": "gemini-1.5-flash", "imageCount": 0}, "images": []}
    
    def edit_image(self, edit_prompt: str) -> Dict:
        response = self.generation_model.generate_content(f"Edit: {edit_prompt}")
        return {"success": True, "editPrompt": edit_prompt, "suggestions": response.text,
                "metadata": {"model": "gemini-1.5-flash"}, "images": []}
    
    def generate_product_image(self, product_name: str, description: str,
                              style: str = "realistic") -> Dict:
        return self.generate_image(description, product_name, style)
    
    def generate_social_media_image(self, prompt: str, style: str = "modern") -> Dict:
        return self.generate_image(prompt, None, style)
    
    def generate_blog_header(self, topic: str, style: str = "modern") -> Dict:
        return self.generate_image(f"Blog header for {topic}", None, style)
