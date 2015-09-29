# PhantomJS Lambda Http Check
AWS Lambda上でPhantomJSを動かし、  
チェック対象のサイトが200以外を返したら、  
画面キャプチャを撮ってメールで送信する。

次のリポジトリをクローンしている。  
[christianklotz/phantom-lambda-template · GitHub](https://github.com/christianklotz/phantom-lambda-template)

インストール方法・使い方は本家のREADME(以下)参照。

---

# PhantomJS Lambda Template

A [PhantomJS](http://phantomjs.org/) node.js app for [Amazon Lambda](http://aws.amazon.com/lambda/). Based on [node-lambda-template](https://github.com/rebelmail/node-lambda-template) using [node-lambda](https://github.com/rebelmail/node-lambda). The app includes a PhantomJS binary (`phantomjs`) compiled for AWS Linux (https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-1.9.8-linux-x86_64.tar.bz2).

## Setup

Install dependencies using npm. It'll install the AWS SDK as well as PhantomJS on the development machine.

```shell
npm install
```

## Usage

After installing use the following `npm` commands as described below. They're only wrapping the `node-lambda` functionality to allow `node-lambda` to be installed only locally. Additional params can be provided using `-- args`. For a list of available options see the `node-lambda` [documentation](https://github.com/RebelMail/node-lambda).

Run the setup command to generate the environment file with the configuration used for the Amazon Lambda function. Edit the resulting `.env.` file with your custom settings.
```shell
npm run setup
```

To run the function locally execute the following command.
```shell
npm run start
```

Run the following command to deploy the app to Amazon Lambda.
```shell
npm run deploy
```

> **Note:** npm version 2.x or newer required to pass arguments to the scripts using `-- args`


---

# 事前準備-1
インストールフォルダ直下に .env ファイルを用意して、  
デプロイ用設定を入れておく。

ここで渡すRoleにはSESの送信権限も与えておく。

例
```
AWS_ENVIRONMENT=development
AWS_ACCESS_KEY_ID=hoge
AWS_SECRET_ACCESS_KEY=hogehoge
AWS_ROLE_ARN=arn:aws:iam::0000000:role/hogehoge
AWS_REGION=us-east-1
AWS_FUNCTION_NAME=check-http
AWS_HANDLER=index.handler
AWS_MODE=event
AWS_MEMORY_SIZE=128
AWS_TIMEOUT=5
AWS_DESCRIPTION=Check-Http
AWS_RUNTIME=nodejs
```

# 事前準備-2
index.js 及び phantomjs-script.js 内の下記変数に  
チェックしたいURLなどを設定する。  

```
TARGET_URL
SERVICE_NAME
CAPTURE_FILE
SES_FROM
SES_TO
```

# 事後対応
AWS上にデプロイしたら、[Schedule Recurring AWS Lambda Invocations With The Unreliable Town Clock (UTC) · Alestic.com](https://alestic.com/2015/05/aws-lambda-recurring-schedule/) のSNS TopicをEvent Sourceに設定する。  
すると、15分に1回キックされる。  
ただ、1度設定すると外せないので、functionごと削除しないとダメだった。(権限が足りないのか？)


# 修正したい点
- キャプチャ画像の日本語が化けてる・・
- URLなどを外から渡せるようにしたい
- エラーファイル名などは1箇所で持ちたい
- テスト不十分
- 美しく書きたい
