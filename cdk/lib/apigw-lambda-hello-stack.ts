import {
  Stack,
  StackProps,
  aws_dynamodb,
  aws_apigateway,
  aws_iam,
  aws_lambda,
  RemovalPolicy,
  Duration,
  aws_logs,
} from "aws-cdk-lib";
import { PassthroughBehavior } from "aws-cdk-lib/aws-apigateway";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";
import * as fs from "fs";
import * as path from "path";

export class ApigwLambdaHelloStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    // dynamod db table
    const messageTable = new aws_dynamodb.Table(this, "MCMessageTableDemo", {
      tableName: "MCMessageTableDemo",
      removalPolicy: RemovalPolicy.DESTROY,
      partitionKey: {
        name: "id",
        type: aws_dynamodb.AttributeType.STRING,
      },
      billingMode: aws_dynamodb.BillingMode.PAY_PER_REQUEST,
      // billingMode: aws_dynamodb.BillingMode.PROVISIONED,
      // readCapacity: 5,
      // writeCapacity: 10,
    });

    //  lambda - write message - post request handler
    const write_ddb_func = new aws_lambda.Function(
      this,
      "MCWriteMessageTableFunction",
      {
        functionName: "MCWriteMessageTableFunction",
        code: aws_lambda.Code.fromInline(
          fs.readFileSync(
            path.resolve(__dirname, "./../lambda/simple_message_handler.py"),
            { encoding: "utf-8" }
          )
        ),
        handler: "index.handler",
        runtime: aws_lambda.Runtime.PYTHON_3_9,
        memorySize: 512,
        timeout: Duration.seconds(10),
        environment: {
          TABLE_NAME: messageTable.tableName,
        },
      }
    );

    // ddb grant access to lambda
    messageTable.grantReadWriteData(write_ddb_func);

    // role for api gateway
    const role = new aws_iam.Role(this, "RoleForApiGwInvokeLambda", {
      roleName: "MCApiGwInvokeLambda",
      assumedBy: new aws_iam.ServicePrincipal("apigateway.amazonaws.com"),
    });

    role.addToPolicy(
      new aws_iam.PolicyStatement({
        effect: aws_iam.Effect.ALLOW,
        actions: ["lambda:InvokeFunction"],
        resources: [write_ddb_func.functionArn],
      })
    );

    role.addToPolicy(
      new aws_iam.PolicyStatement({
        effect: aws_iam.Effect.ALLOW,
        actions: [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams",
          "logs:PutLogEvents",
          "logs:GetLogEvents",
          "logs:FilterLogEvents",
        ],
        resources: ["*"],
      })
    );

    //  api gateway
    const apigw = new aws_apigateway.RestApi(this, "DevApigwDemo", {
      restApiName: "mcpollyapi",
      deploy: false,
    });

    //  integrate lambda with apigw
    const message = apigw.root.addResource("message");

    //  integration
    message.addMethod(
      "POST",
      new aws_apigateway.LambdaIntegration(write_ddb_func, {
        // proxy: true,
        proxy: false,
        allowTestInvoke: false,
        credentialsRole: role,
        // api input mapping
        passthroughBehavior: PassthroughBehavior.WHEN_NO_TEMPLATES,
        requestParameters: {},
        requestTemplates: {},
        // api output mapping
        integrationResponses: [
          {
            statusCode: "200",
            responseTemplates: {
              "application/json": fs.readFileSync(
                path.resolve(
                  __dirname,
                  "./../template/response-template-lambda"
                ),
                { encoding: "utf-8" }
              ),
            },
          },
        ],
      }),
      {
        methodResponses: [{ statusCode: "200" }],
      }
    );

    // cors per resources
    // message.addCorsPreflight({
    //   allowOrigins: ["*"],
    //   allowMethods: ["GET", "POST", "OPTIONS"],
    //   allowHeaders: ["*"],
    // });

    // access log group
    const logGroup = new aws_logs.LogGroup(this, "AccessLogApi", {
      logGroupName: "MCAccessLogApiDevClass",
      removalPolicy: RemovalPolicy.DESTROY,
      retention: RetentionDays.ONE_WEEK,
    });

    // deploy stage
    const deployment = new aws_apigateway.Deployment(this, "Deployment", {
      api: apigw,
    });

    const prodStage = new aws_apigateway.Stage(this, "ProdStage", {
      stageName: "prod",
      deployment,
      dataTraceEnabled: true,
      accessLogDestination: new aws_apigateway.LogGroupLogDestination(logGroup),
      accessLogFormat: aws_apigateway.AccessLogFormat.jsonWithStandardFields(),
    });
  }
}
