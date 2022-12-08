# haimtran 06 DEC 2022
# test polly text to speech

import boto3
from contextlib import closing
from botocore.exceptions import BotoCoreError, ClientError
import uuid
import json
import os


# bucket store audio file
bucket = boto3.resource("s3").Bucket(os.environ["BUCKET_NAME"])
# table store url to audio file
table = boto3.resource("dynamodb").Table(os.environ["TABLE_NAME"])

def handler(event, context):
    """
    convert message to speech using amazon polly
    """
    # parset intput
    try:
        body = json.loads(event["body"])
        message = body["message"]
        file_name = body["file_name"]
    except:
        message = "hello"
        file_name = "hello.mp3"
    # create client
    client = boto3.client("polly")
    # covert to speech
    try:
        response = client.synthesize_speech(
            Engine="standard",
            OutputFormat="mp3",
            Text=message,
            VoiceId="Brian"
        )
    except (BotoCoreError, ClientError) as error:
        print(error)
    # write the audio stream to file
    if "AudioStream" in response:
        with closing(response["AudioStream"]) as stream:
            # write stream audio to mp3 file
            try:
                with open(f"/tmp/{file_name}", "wb") as file:
                    file.write(stream.read())
                # upload file to s3
                bucket.upload_file(
                    Filename=f"/tmp/{file_name}",
                    Key=file_name,
                )
                # update dynamodb record
                table.put_item(
                    Item={
                        "id": str(uuid.uuid4()),
                        "key": file_name,
                        "message": message
                    }
                )
            except IOError as error:
                print(f"io error {error}")
    else:
        print("could not stream audio")
    # lambda response headers here
    return {
        'statusCode': 200,
        'headers': {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "OPTIONS,GET"
        },
         'body': json.dumps({"file_name": file_name, "event": event})
    }

if __name__=="__main__":
    handler(event={"message": "Hello, this is Hai. welcome to developing on aws class. I am so happy to help you in this class.", "file_name": "hello.mp3"}, context=None)