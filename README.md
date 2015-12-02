# PhantomJS Lambda Http Check
AWS Lambda上でPhantomJSを動かし、  
チェック対象のサイトが200以外を返したら、  
画面キャプチャを撮ってメールで送信する。

加えて、.envにChatworkのtokenが入っていたら、
指定したRoomにチャットを投げる。

次のリポジトリをクローンしている。  
[christianklotz/phantom-lambda-template · GitHub](https://github.com/christianklotz/phantom-lambda-template)

が取り込まれたのか今は見れないので、本家の本家を載せる。

[justengland/phantom-lambda-template · GitHub](https://github.com/justengland/phantom-lambda-template)

詳しくは本家のREADME参照ください。


# Setup & Usage

```
$ npm install
$ npm run setup

# ローカルで実行する
$ npm run start

# AWS Lambdaにデプロイ
$ npm run deploy
```

---

# 事前準備-1
インストールフォルダ直下に .env ファイルを用意して、  
デプロイ用設定 & チェック対象のURLとChatworkAPIの設定を入れておく。

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

SERVICE_NAME="hoge"
TARGET_URL="http://example.com/"
CAPTURE_FILE="/tmp/error.png"
SES_FROM="hoge@example.com"
SES_TO="hoge@example.com"

CHATWORK_TOKEN="hogehogehoge"
CHATWORK_TO_1="[To:000000]foo"
CHATWORK_TO_2=""
CHATWORK_ROOMID="0000000"

```

CHATWORK_TOKENを空にしたらチャットは飛びません。


# 事前準備-2
~~index.js 及び phantomjs-script.js 内の下記変数に~~  
~~チェックしたいURLなどを設定する。~~  

```
TARGET_URL
SERVICE_NAME
CAPTURE_FILE
SES_FROM
SES_TO
```

※ .envに含めるようにしました。


# 事後対応
~~AWS上にデプロイしたら、[Schedule Recurring AWS Lambda Invocations With The Unreliable Town Clock (UTC) · Alestic.com](https://alestic.com/2015/05/aws-lambda-recurring-schedule/) のSNS TopicをEvent Sourceに設定する。~~  
~~すると、15分に1回キックされる。~~  
~~ただ、1度設定すると外せないので、functionごと削除しないとダメだった。(権限が足りないのか？~~

※ LambdaにSchedule Eventが追加されたので、それを使う方がいいです。


# 修正したい点
- キャプチャ画像の日本語が化けてる・・
- ~~URLなどを外から渡せるようにしたい~~
- ~~エラーファイル名などは1箇所で持ちたい~~
- 美しく書きたい
