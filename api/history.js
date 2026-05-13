```js
let history = []

export default function handler(
  req,
  res
) {

  if (req.method === "POST") {

    history.unshift(req.body)

    return res.status(200).json({
      success: true
    })
  }

  return res.status(200).json(
    history
  )
}
```
