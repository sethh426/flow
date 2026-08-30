"""
Test script for Image Generator API
Tests the health endpoint and basic image generation
"""

import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

BASE_URL = "http://localhost:5001"

def test_health():
    """Test health check endpoint"""
    print("\n🧪 Testing Health Check...")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('initialized'):
                print("✅ Service is healthy and initialized")
                return True
            else:
                print("⚠️  Service is running but not initialized")
                return False
        else:
            print("❌ Health check failed")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to service. Is it running?")
        print("   Run: python api.py")
        return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Request error: {e}")
        return False
    except Exception as e:  # pylint: disable=broad-except
        print(f"❌ Unexpected error: {e}")
        return False


def test_generate_image():
    """Test image generation endpoint"""
    print("\n🧪 Testing Image Generation...")
    
    payload = {
        "prompt": "A modern minimalist desk setup with a laptop and coffee cup",
        "productName": "Home Office Collection",
        "style": "minimalist",
        "purpose": "product-hero",
        "saveToDisk": False  # Don't save during testing
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/generate-image",
            json=payload,
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Image generated successfully!")
            print(f"   - Images: {data['metadata']['imageCount']}")
            print(f"   - Model: {data['metadata']['model']}")
            print(f"   - Enhanced prompt: {data['enhancedPrompt'][:80]}...")
            return True
        elif response.status_code == 503:
            print("⚠️  Service not initialized (missing API key)")
            print(response.json())
            return False
        else:
            print(f"❌ Generation failed: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("⏱️  Request timed out (image generation can take 10-30 seconds)")
        return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Request error: {e}")
        return False
    except Exception as e:  # pylint: disable=broad-except
        print(f"❌ Unexpected error: {e}")
        return False


def test_list_images():
    """Test list images endpoint"""
    print("\n🧪 Testing List Images...")
    
    try:
        response = requests.get(f"{BASE_URL}/api/images", timeout=5)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Found {data['count']} saved images")
            if data['images']:
                print(f"   Recent: {data['images'][0]['fileName']}")
            return True
        else:
            print(f"❌ Failed: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request error: {e}")
        return False
    except Exception as e:  # pylint: disable=broad-except
        print(f"❌ Unexpected error: {e}")
        return False


def main():
    """Run all tests"""
    print("=" * 60)
    print("🎨 Image Generator API Test Suite")
    print("=" * 60)
    
    # Check if API key is set
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key or api_key == "your_gemini_api_key_here":
        print("\n⚠️  WARNING: GEMINI_API_KEY not set in .env file")
        print("   Some tests will fail without a valid API key")
    
    # Run tests
    results = {
        "health": test_health(),
        "list_images": test_list_images(),
    }
    
    # Only test image generation if health check passed
    if results["health"]:
        results["generate_image"] = test_generate_image()
    else:
        print("\n⏭️  Skipping image generation test (service not healthy)")
        results["generate_image"] = False
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 Test Summary")
    print("=" * 60)
    
    passed = sum(results.values())
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed!")
    elif passed > 0:
        print("\n⚠️  Some tests failed. Check the output above.")
    else:
        print("\n❌ All tests failed. Is the service running?")
        print("   Start it with: python api.py")


if __name__ == "__main__":
    main()
