# haimtran 06 DEC 2022
# hello api gateway and lambda 

import requests
import json
from datetime import datetime

ENDPOINT = "https://n67gg8t3y8.execute-api.ap-southeast-1.amazonaws.com/prod/message"

response = requests.post(
    url=ENDPOINT,
    json={
        "body": f"Hello {str(datetime.now())}"
    }
)

# print(response.json())
print(json.dumps(response.json(), indent=2, default=str))