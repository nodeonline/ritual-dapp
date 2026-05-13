```js
global.historyData =
  global.historyData || []

export default function handler(
  req,
  res
) {

  if (req.method === "POST") {

    global.historyData.unshift(
      req.body
    )

    return res.status(200).json({
      success: true
    })
  }

  return res.status(200).json(
    global.historyData
  )
}
```
