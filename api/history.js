import { createClient }
from "@supabase/supabase-js"

const supabase =
  createClient(

    process.env.SUPABASE_URL,

    process.env.SUPABASE_KEY
  )

export default async function handler(req, res) {

  // ======================
  // GET HISTORY
  // ======================

  if (req.method === "GET") {

    const { wallet } =
      req.query

    const { data, error } =
      await supabase

        .from("deploy_history")

        .select("*")

        .eq(
          "wallet",
          wallet
        )

        .order(
          "created_at",
          { ascending: false }
        )

    if (error) {

      return res
        .status(500)
        .json({
          error: error.message
        })
    }

    return res.json(data)
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

    const { error } =
  await supabase

    .from("deploy_history")

    .insert([{

      ...body,

      wallet:
        body.wallet.toLowerCase()

    }])

    if (error) {

      return res
        .status(500)
        .json({
          error: error.message
        })
    }

    return res.json({
      success: true
    })

  } catch (err) {

    return res
      .status(500)
      .json({
        error: err.message
      })
  }
}

}