import {
  aws_lambda,
  Stack,
  StackProps,
  aws_iam,
  aws_apigateway,
  aws_cognito,
  aws_dynamodb,
  RemovalPolicy,
  Duration,
  aws_logs,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import * as path from "path";
import * as fs from "fs";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { Effect } from "aws-cdk-lib/aws-iam";

interface ApigwProps extends StackProps {
  userPool: string;
  bucketArn: string;
}

export class ApigwStack extends Stack {
  public readonly apigateway: aws_apigateway.RestApi;
  public readonly apiArns: string[] = [];

  constructor(scope: Construct, id: string, props: ApigwProps) {
    super(scope, id, props);

    // look up existing cognito userpool
    const userPool = aws_cognito.UserPool.fromUserPoolArn(
      this,
      "messageUserPool",
      props.userPool
    );

    // ==========================================================
    // dynamodb table
    // ==========================================================
    // dyanmodb message table
    const messageTable = new aws_dynamodb.Table(this, "MessageTable", {
      tableName: "MessageTable",
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

    // messageTable
    //   .autoScaleReadCapacity({
    //     minCapacity: 5,
    //     maxCapacity: 10,
    //   })
    //   .scaleOnUtilization({ targetUtilizationPercent: 75 });

    // messageTable
    //   .autoScaleWriteCapacity({
    //     minCapacity: 10,
    //     maxCapacity: 20,
    //   })
    //   .scaleOnUtilization({ targetUtilizationPercent: 75 });

    // ==========================================================
    // lambda polly text to speech
    // ==========================================================
    const roleForLambdaPoly = new aws_iam.Role(this, "RoleForLambdaPolly", {
      roleName: "RoleForLambdaPolly",
      assumedBy: new aws_iam.ServicePrincipal("lambda.amazonaws.com"),
    });

    roleForLambdaPoly.addToPolicy(
      new aws_iam.PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["polly:SynthesizeSpeech"],
        resources: ["*"],
      })
    );

    roleForLambdaPoly.addToPolicy(
      new aws_iam.PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["s3:*PutObject"],
        resources: [props.bucketArn, `${props.bucketArn}/*`],
      })
    );

    roleForLambdaPoly.addToPolicy(
      new aws_iam.PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["dyanmodb:PutItem", "dynamodb:Update*", "dyanmodb:Delete*"],
        resources: [messageTable.tableArn],
      })
    );

    const polly_func = new aws_lambda.Function(this, "PollyLambdaFunction", {
      functionName: "PollyLambdaFunction",
      code: aws_lambda.Code.fromInline(
        fs.readFileSync(
          path.resolve(__dirname, "./../lambda/polly_handler.py"),
          {
            encoding: "utf-8",
          }
        )
      ),
      timeout: Duration.seconds(10),
      runtime: aws_lambda.Runtime.PYTHON_3_9,
      memorySize: 1024,
      handler: "index.handler",
      environment: {
        TABLE_NAME: messageTable.tableName,
        BUCKET_NAME: `${props.bucketArn.split(":").pop()}`,
      },
      role: roleForLambdaPoly,
    });

    // ==========================================================
    // lambda handlers
    // ==========================================================
    const test_lambda_func = new aws_lambda.Function(this, "TestLambda", {
      functionName: "TestLambda",
      code: aws_lambda.Code.fromAsset(path.join(__dirname, "./../lambda")),
      timeout: Duration.seconds(10),
      runtime: aws_lambda.Runtime.PYTHON_3_9,
      memorySize: 512,
      handler: "test_handler.handler",
      environment: {
        TABLE_NAME: messageTable.tableName,
      },
    });

    // lambda -read message - get request handler
    const read_ddb_func = new aws_lambda.Function(this, "ReadMessageToDDB", {
      functionName: "ReadMessageToDDB",
      code: aws_lambda.Code.fromInline(
        fs.readFileSync(
          path.resolve(__dirname, "./../lambda/read_message_handler.py"),
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
    });

    //  lambda - write message - post request handler
    const write_ddb_func = new aws_lambda.Function(this, "WriteMessageToDDB", {
      functionName: "WriteMessageToDDB",
      code: aws_lambda.Code.fromInline(
        fs.readFileSync(
          path.resolve(__dirname, "./../lambda/write_message_handler.py"),
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
    });

    // grant that lambda read write the message table
    messageTable.grantFullAccess(write_ddb_func);
    messageTable.grantReadData(read_ddb_func);
    messageTable.grantReadData(test_lambda_func);
    messageTable.grantReadWriteData(polly_func);

    // ==========================================================
    // api gateway
    // ==========================================================
    // role for apigw
    const role = new aws_iam.Role(this, "RoleForApiGwInvokeLambda", {
      roleName: "ApiGwInvokeLambda",
      assumedBy: new aws_iam.ServicePrincipal("apigateway.amazonaws.com"),
    });

    role.addToPolicy(
      new aws_iam.PolicyStatement({
        effect: aws_iam.Effect.ALLOW,
        actions: ["lambda:InvokeFunction"],
        resources: [
          write_ddb_func.functionArn,
          read_ddb_func.functionArn,
          polly_func.functionArn,
        ],
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

    // create an api prod stage
    const apigw = new aws_apigateway.RestApi(this, "DevApigwDemo", {
      restApiName: "pollyapi",
      deploy: false,
    });

    //  integrate lambda with apigw
    const message = apigw.root.addResource("message");
    const book = apigw.root.addResource("book");
    const polly_api_resource = apigw.root.addResource("polly");

    // ==========================================================
    // apigw lambda integration
    // ==========================================================
    book.addMethod(
      "GET",
      new aws_apigateway.LambdaIntegration(test_lambda_func, {
        proxy: true,
      }),
      {
        authorizationType: aws_apigateway.AuthorizationType.COGNITO,
        authorizer: new aws_apigateway.CognitoUserPoolsAuthorizer(
          this,
          "TestAuthorizer",
          {
            cognitoUserPools: [userPool],
          }
        ),
      }
    );

    message.addMethod(
      "POST",
      new aws_apigateway.LambdaIntegration(write_ddb_func, {
        proxy: true,
        allowTestInvoke: false,
        credentialsRole: role,
        integrationResponses: [
          {
            statusCode: "200",
          },
        ],
      }),
      {
        methodResponses: [{ statusCode: "200" }],
        authorizer: new aws_apigateway.CognitoUserPoolsAuthorizer(
          this,
          "messagePostAuthorizer",
          {
            cognitoUserPools: [userPool],
          }
        ),
        authorizationType: aws_apigateway.AuthorizationType.COGNITO,
      }
    );

    message.addMethod(
      "GET",
      new aws_apigateway.LambdaIntegration(read_ddb_func, {
        credentialsRole: role,
      }),
      {
        authorizer: new aws_apigateway.CognitoUserPoolsAuthorizer(
          this,
          "messageGetAuthorizer",
          {
            cognitoUserPools: [userPool],
          }
        ),
        authorizationType: aws_apigateway.AuthorizationType.COGNITO,
      }
    );

    polly_api_resource.addMethod(
      "POST",
      new aws_apigateway.LambdaIntegration(polly_func, {
        proxy: true,
        allowTestInvoke: false,
        credentialsRole: role,
        // integrationResponses: [
        //   {
        //     statusCode: "200",
        //   },
        // ],
      })
      // {
      //   methodResponses: [{ statusCode: "200" }],
      //   authorizer: new aws_apigateway.CognitoUserPoolsAuthorizer(
      //     this,
      //     "messagePostAuthorizer",
      //     {
      //       cognitoUserPools: [userPool],
      //     }
      //   ),
      //   authorizationType: aws_apigateway.AuthorizationType.COGNITO,
      // }
    );

    // cors per resources
    message.addCorsPreflight({
      allowOrigins: ["*"],
      allowMethods: ["GET", "POST", "OPTIONS"],
      allowHeaders: ["*"],
    });

    polly_api_resource.addCorsPreflight({
      allowOrigins: ["*"],
      allowMethods: ["GET", "POST", "OPTIONS"],
      allowHeaders: ["*"],
    });

    // access log group
    const logGroup = new aws_logs.LogGroup(this, "AccessLogApi", {
      logGroupName: "AccessLogApiDevClass",
      removalPolicy: RemovalPolicy.DESTROY,
      retention: RetentionDays.ONE_WEEK,
    });

    // deployment prod stage
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

    // store api arn
    this.apiArns.push(prodStage.stageArn);
    this.apigateway = apigw;
  }
}
