# haimtran 06 DEC 2022
# test polly text to speech

import boto3
from contextlib import closing
from botocore.exceptions import BotoCoreError, ClientError
import uuid

# bucket store audio file
bucket = boto3.resource("s3").Bucket("cognito-demo-bucket-392194582387-1")
# table store url to audio file
table = boto3.resource("dynamodb").Table("MessageTable")

def handler(event, context):
    """
    convert message to speech using amazon polly
    """
    # parset intput
    message = event["message"]
    file_name = event["file_name"]
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
                        "key": file_name
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
        'body': file_name
    }

if __name__=="__main__":
    handler(event={"message": "Hello, this is Hai. welcome to developing on aws class. I am so happy to help you in this class.", "file_name": "hello.mp3"}, context=None)