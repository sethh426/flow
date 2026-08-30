"""
Image Generation API - Flask REST API
Exposes image generation capabilities via HTTP endpoints
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
from dotenv import load_dotenv
from image_generator import ImageGenerator

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, origins=[
    "http://localhost:3000",
    "https://affiliateflow-abzfy.web.app"
])

# Initialize image generator
try:
    generator = ImageGenerator()
    print("âœ… Image Generator initialized successfully")
except ValueError as e:
    print(f"âŒ Failed to initialize Image Generator: {e}")
    print("   Please set GEMINI_API_KEY in .env file")
    generator = None


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy" if generator else "unhealthy",
        "service": "image-generator",
        "initialized": generator is not None,
        "models": {
            "generation": "imagen-3.0-generate-001",
            "editing": "imagen-3.0-capability-preview-0930"
        }
    })


@app.route('/api/generate-image', methods=['POST'])
def generate_image():
    """
    Generate an image from a prompt
    
    Body:
        {
            "prompt": "image description",
            "productName": "optional product name",
            "style": "realistic|artistic|minimalist|vintage|modern",
            "purpose": "product-hero|social-media|blog-header|thumbnail",
            "saveToDisk": true|false
        }
    """
    try:
        if generator is None:
            return jsonify({
                "error": "Image generator not initialized. Please check GEMINI_API_KEY."
            }), 503
        
        data = request.json
        
        if not data or 'prompt' not in data:
            return jsonify({"error": "Missing required field: prompt"}), 400
        
        result = generator.generate_image(
            prompt=data['prompt'],
            product_name=data.get('productName'),
            style=data.get('style'),
            purpose=data.get('purpose'),
            save_to_disk=data.get('saveToDisk', False)
        )
        
        return jsonify(result)
    
    except ValueError as e:
        return jsonify({"error": f"Invalid input: {str(e)}"}), 400
    except (IOError, OSError) as e:
        return jsonify({"error": f"File operation failed: {str(e)}"}), 500
    except Exception as e:  # pylint: disable=broad-except
        return jsonify({"error": str(e)}), 500


@app.route('/api/edit-image', methods=['POST'])
def edit_image():
    """
    Edit an existing image using Imagen 3 editing capabilities
    
    Body:
        {
            "imageData": "base64_encoded_image",
            "editPrompt": "description of changes to make",
            "maskData": "optional base64_encoded_mask",
            "saveToDisk": true|false
        }
    """
    try:
        if generator is None:
            return jsonify({
                "error": "Image generator not initialized. Please check GEMINI_API_KEY."
            }), 503
        
        data = request.json
        
        if not data or 'imageData' not in data or 'editPrompt' not in data:
            return jsonify({"error": "Missing required fields: imageData, editPrompt"}), 400
        
        result = generator.edit_image(
            image_data=data['imageData'],
            edit_prompt=data['editPrompt'],
            mask_data=data.get('maskData'),
            save_to_disk=data.get('saveToDisk', False)
        )
        
        return jsonify(result)
    
    except ValueError as e:
        return jsonify({"error": f"Invalid input: {str(e)}"}), 400
    except (IOError, OSError) as e:
        return jsonify({"error": f"File operation failed: {str(e)}"}), 500
    except Exception as e:  # pylint: disable=broad-except
        return jsonify({"error": str(e)}), 500


@app.route('/api/generate-product-image', methods=['POST'])
def generate_product_image():
    """
    Generate a product hero image
    
    Body:
        {
            "productName": "Product Name",
            "description": "product description",
            "style": "realistic|artistic|minimalist|vintage|modern"
        }
    """
    try:
        data = request.json
        
        if not data or 'productName' not in data or 'description' not in data:
            return jsonify({"error": "Missing required fields: productName, description"}), 400
        
        result = generator.generate_product_image(
            product_name=data['productName'],
            description=data['description'],
            style=data.get('style', 'realistic'),
            save_to_disk=data.get('saveToDisk', False)
        )
        
        return jsonify(result)
    
    except ValueError as e:
        return jsonify({"error": f"Invalid input: {str(e)}"}), 400
    except (IOError, OSError) as e:
        return jsonify({"error": f"File operation failed: {str(e)}"}), 500
    except Exception as e:  # pylint: disable=broad-except
        return jsonify({"error": str(e)}), 500


@app.route('/api/generate-social-image', methods=['POST'])
def generate_social_image():
    """
    Generate a social media image
    
    Body:
        {
            "prompt": "image description",
            "style": "realistic|artistic|minimalist|vintage|modern"
        }
    """
    try:
        data = request.json
        
        if not data or 'prompt' not in data:
            return jsonify({"error": "Missing required field: prompt"}), 400
        
        result = generator.generate_social_media_image(
            prompt=data['prompt'],
            style=data.get('style', 'modern'),
            save_to_disk=data.get('saveToDisk', False)
        )
        
        return jsonify(result)
    
    except ValueError as e:
        return jsonify({"error": f"Invalid input: {str(e)}"}), 400
    except (IOError, OSError) as e:
        return jsonify({"error": f"File operation failed: {str(e)}"}), 500
    except Exception as e:  # pylint: disable=broad-except
        return jsonify({"error": str(e)}), 500


@app.route('/api/generate-blog-header', methods=['POST'])
def generate_blog_header():
    """
    Generate a blog header image
    
    Body:
        {
            "topic": "blog topic or title",
            "style": "realistic|artistic|minimalist|vintage|modern"
        }
    """
    try:
        data = request.json
        
        if not data or 'topic' not in data:
            return jsonify({"error": "Missing required field: topic"}), 400
        
        result = generator.generate_blog_header(
            topic=data['topic'],
            style=data.get('style', 'modern'),
            save_to_disk=data.get('saveToDisk', False)
        )
        
        return jsonify(result)
    
    except ValueError as e:
        return jsonify({"error": f"Invalid input: {str(e)}"}), 400
    except (IOError, OSError) as e:
        return jsonify({"error": f"File operation failed: {str(e)}"}), 500
    except Exception as e:  # pylint: disable=broad-except
        return jsonify({"error": str(e)}), 500

@app.route('/api/images/<path:filename>', methods=['GET'])
def serve_image(filename):
    """Serve a generated image file"""
    try:
        image_path = generator.output_dir / filename
        if not image_path.exists():
            return jsonify({"error": "Image not found"}), 404
        
        return send_file(image_path, mimetype='image/png')
    
    except FileNotFoundError as e:
        return jsonify({"error": f"Image not found: {str(e)}"}), 404
    except (IOError, OSError) as e:
        return jsonify({"error": f"File operation failed: {str(e)}"}), 500
    except Exception as e:  # pylint: disable=broad-except
        return jsonify({"error": str(e)}), 500


@app.route('/api/images', methods=['GET'])
def list_images():
    """List all generated images"""
    try:
        images = []
        for image_file in generator.output_dir.glob('*'):
            if image_file.is_file() and image_file.suffix in ['.png', '.jpg', '.jpeg', '.webp']:
                images.append({
                    "fileName": image_file.name,
                    "filePath": str(image_file),
                    "size": image_file.stat().st_size,
                    "created": image_file.stat().st_ctime
                })
        
        return jsonify({"images": images, "count": len(images)})
    
    except (IOError, OSError) as e:
        return jsonify({"error": f"File operation failed: {str(e)}"}), 500
    except Exception as e:  # pylint: disable=broad-except
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    
    print(f"ðŸŽ¨ Image Generator API starting on port {port}")
    print(f"   Health: http://localhost:{port}/health")
    print(f"   Generate: POST http://localhost:{port}/api/generate-image")
    
    app.run(host='0.0.0.0', port=port, debug=debug)

