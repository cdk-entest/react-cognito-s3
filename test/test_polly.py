# haimtran 06 DEC 2022
# test polly text to speech

import boto3
from contextlib import closing
from botocore.exceptions import BotoCoreError, ClientError
import uuid

BUCKET_NAME = "cognito-demo-bucket-392194582387-1" 

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


def test_generate_signed_url(bucket_name: str, key: str):
    """
    generate signed url to view an image
    """
    # create s3 client
    s3 = boto3.client("s3")
    # generate pre_signed_url
    pre_signed_url = s3.generate_presigned_url(
        # 
        ClientMethod='get_object',
        # bucket information
        Params={
            "Bucket": bucket_name,
            "Key": key
        },
        # in seconds the link expired
        ExpiresIn=3600,
        HttpMethod="GET"
    )
    # 
    print(pre_signed_url)
    # download the object given the pre_signed_url
    # try: 
    #     response = requests.get(pre_signed_url)
    #     print(response)
    #     with open("image.png", "wb") as file:
    #         file.write(response.content)
    # except ClientError as error:
    #     print(error)


if __name__=="__main__":
    handler(event={"message": "Hello, this is Hai. welcome to developing on aws class. I am so happy to help you in this class.", "file_name": "last_day_mc_dev.mp3"}, context=None)


    test_generate_signed_url(
        bucket_name=BUCKET_NAME,
        key="last_day_mc_dev.mp3"
    )