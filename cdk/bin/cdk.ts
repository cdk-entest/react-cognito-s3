#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CognitoDemoStack } from "../lib/cognito-stack";
import { ApigwStack } from "../lib/apigw-stack";
import { ApigwLambdaHelloStack } from "../lib/apigw-lambda-hello-stack";
import { WafApigwStack } from "../lib/waf-stack";

const app = new cdk.App();

// simple apigw and lambda integration demo
const hellloAPI = new ApigwLambdaHelloStack(app, "ApigwLambdaHelloStack", {});

// cognito userpool and identity pool
const cognito = new CognitoDemoStack(app, "CognitoDemoStack", {});

// apigateway and lambda
const apigw = new ApigwStack(app, "ApigwStackDevClass", {
  userPool: cognito.userPool,
  bucketArn: `arn:aws:s3:::cognito-demo-bucket-${process.env.CDK_DEFAULT_ACCOUNT}-1`,
});

// waf stack protect api gw
const waf = new WafApigwStack(app, "WafProtectApiGw", {
  resourceArns: hellloAPI.apiArns,
});

apigw.addDependency(cognito);
