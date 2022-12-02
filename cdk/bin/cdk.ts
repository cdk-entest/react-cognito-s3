#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CognitoDemoStack } from "../lib/cognito-stack";

const app = new cdk.App();
new CognitoDemoStack(app, "CognitoDemoStack", {});
