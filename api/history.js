import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

export default async function handler(
  req,
  res
) {

  try {

    // ======================
    // GET
    // ======================

    if (req.method === "GET") {

      const wallet =
        req.query.wallet?.toLowerCase()

      const { data, error } =
        await supabase
          .from("deploy_history")
          .select("*")
          .eq("wallet", wallet)
          .order(
            "created_at",
            { ascending: false }
          )

      if (error) {
        throw error
      }

      return res.status(200).json(data)
    }

    // ======================
    // POST
    // ======================

    if (req.method === "POST") {

      const body = req.body

      const { error } =
        await supabase
          .from("deploy_history")
          .insert([{

            txHash:
              body.txHash,

            contractAddress:
              body.contractAddress,

            wallet:
              body.wallet.toLowerCase(),

            status:
              body.status

          }])

      if (error) {
        throw error
      }

      return res.status(200).json({
        success: true
      })
    }

    return res.status(405).json({
      error: "Method not allowed"
    })

  } catch (err) {

    console.log(err)

    return res.status(500).json({
      error: err.message
    })
  }
}