```js
global.historyData =
  global.historyData || []

export default function handler(
  req,
  res
) {

  res.status(200).json({
    total:
      global.historyData.length
  })
}
```
