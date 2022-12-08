# haimtran 06 DEC 2022
# hello api gateway and lambda 

import requests
import json
from datetime import datetime

ENDPOINT = "https://vyrb4lx0cc.execute-api.ap-southeast-1.amazonaws.com/prod/polly"

response = requests.post(
    url=ENDPOINT,
    json={
        "message": "Click on the Review policy button and on the next tab provide the name of your policy, for example: MyServerlessAppPolicy. Click on Create policy button and that’s all! Your IAM Policy is done!",
        "file_name": "nice.mp3"
    }
)

# print(response.json())
# print(response.json())
print(json.dumps(response.json(), indent=2, default=str))