# haimtran 03 DEC 2022
# test ddb

import boto3

ddb = boto3.resource("dynamodb")
table = ddb.Table("MessageTable")

resp = table.scan(
    Limit=10
)

print(resp["Items"])