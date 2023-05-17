# Open api

open api 功能只能使用平台余额

# 请求配置

```tsx
baseUrl: "https://{url}/api/openapi"
baseUrl: "https://{url}/api/openapi"
baseUrl 二选一
headers: {
    apikey: "63f9a12228d2a6383839e12b-r5lbdhot32hvcfd1wg12"
}

```

# 响应结构

```json
{
    "code": 200,
    "statusText": "string",
    "message": "***",
    "data": "any"
}

```

# 错误码 statusText

```json
{
unAuthorization - api key鉴权错误、
insufficientQuota - 账号余额不足
}

```

# prompt 格式

obj可选: **System, AI, Human**

部分接口是传入 propmpts，即多组对话, 数组最大长度为 30

```json
{
    "obj": "Human",
    "value": "string"
}

```

# 流响应例子

```tsx
const streamFetch = ({ url, data, onMessage }) =>
  new Promise(async (resolve, reject) => {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: '63f9a12228d2a638d839e11b-r5l1dho132hvcfd1wg12'
        },
        body: JSON.stringify(data),
      });
      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let responseText = '';

      const read = async () => {
        const { done, value } = await reader?.read();
        if (done) {
          if (res.status === 200) {
            resolve(responseText);
          } else {
            try {
              const parseError = JSON.parse(responseText);
              reject(parseError?.message || '请求异常');
            } catch (err) {
              reject('请求异常');
            }
          }

          return;
        }
        const text = decoder.decode(value).replace(/<br\/>/g, '\n');
        res.status === 200 && onMessage(text);
        responseText += text;
        read();
      };
      read();
    } catch (err) {
      console.log(err, '====');
      reject(typeof err === 'string' ? err : err?.message || '请求异常');
    }
  });

async function test() {
    const responseText = await streamFetch({
        url: 'https://{url}/api/openapi/chat/vectorGpt',
        data: {
            "modelId":"22222222",
            "prompt": [{
                "obj": "Human",
                "value": "laf是什么"
            }]
        },
        onMessage(e) {
            // e为收到的消息，可以做拼接
            resule += e
        }
    })
    console.log(responseText )
}

```

# 接口

# 对话

通过 api 形式去请求模型。如果需要进行知识库搜索，需要在模型设置页里开启“知识库搜索”。

**请求**

```bash
curl --location 'https://{url}/api/openapi/chat/chat' \
--header 'apikey: 63f9a12228d2a638d839e11b-r5lbdhot32h33fd1wg12' \
--header 'Content-Type: application/json' \
--data '{
    "modelId": "642989b537d6e4b98e4a1037",
    "isStream": false,
    "prompts": [
        {
            "obj": "System",
            "value": "下面是 AI 和 Human 的对话，讨论 laf 的内容。"
        },
        {
            "obj": "Human",
            "value": "什么是 laf"
        },
        {
            "obj": "AI",
            "value": "laf 是云开发平台...."
        },
        {
            "obj": "Human",
            "value": "laf 可以做什么?"
        },
    ]
}'

```

**响应**

```json
{
    "code": 200,
    "statusText": "",
    "data": "laf是********"
}

```
