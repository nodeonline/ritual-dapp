import { createClient }
from "@supabase/supabase-js"

const supabase =
  createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  )

export default async function handler(
  req,
  res
) {

  // ======================
  // GET HISTORY
  // ======================

  if (req.method === "GET") {

    try {

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

    } catch (err) {

      return res.status(500).json({
        error: err.message
      })
    }
  }

  // ======================
  // SAVE HISTORY
  // ======================

  if (req.method === "POST") {

    try {

      const body =
        typeof req.body === "string"
          ? JSON.parse(req.body)
          : req.body

      const insertData = {

        tx_hash:
          body.tx_hash,

        contract_address:
          body.contract_address,

        wallet:
          body.wallet.toLowerCase(),

        status:
          body.status
      }

      console.log(
        "INSERT:",
        insertData
      )

      const { data, error } =
        await supabase

          .from("deploy_history")

          .insert([insertData])

          .select()

      if (error) {
        throw error
      }

      return res.status(200).json({
        success: true,
        data
      })

    } catch (err) {

      return res.status(500).json({
        error: err.message
      })
    }
  }

  return res.status(405).json({
    error: "Method not allowed"
  })
}