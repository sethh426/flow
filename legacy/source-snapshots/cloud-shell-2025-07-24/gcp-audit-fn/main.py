import functions_framework
import google.auth
from google.cloud import asset_v1
import vertexai
from vertexai.language_models import TextGenerationModel
import traceback

@functions_framework.http
def audit_request(request):
    try:
        # Authenticate
        credentials, project = google.auth.default()

        # List all GCP assets in your project
        client = asset_v1.AssetServiceClient()
        parent = f"projects/{project}"
        resources = client.search_all_resources(request={"scope": parent})

        # Build the prompt
        summary = [f"{res.asset_type} — {res.name}" for res in resources]
        prompt = f"""
You are an AI business analyst.
Based on the following GCP assets and services, provide:
- A feasibility assessment for scaling to multi-brand AI affiliate automation
- A short SWOT analysis
- A 3-tier monetization plan
- A 10-slide pitch deck outline for investors

GCP Resources:
{chr(10).join(summary[:100])}
"""

        # Initialize Vertex AI and call the text model
        vertexai.init(project=project, location="us-central1")
        model = TextGenerationModel.from_pretrained("text-bison@001")
        response = model.predict(
            prompt=prompt,
            temperature=0.7,
            max_output_tokens=2048
        )

        return response.text, 200

    except Exception:
        tb = traceback.format_exc()
        print(tb)  # so it appears in Cloud Logging
        return f"<pre>ERROR:\n{tb}</pre>", 500
