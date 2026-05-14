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

    const {
      count,
      error
    } = await supabase

      .from("deploy_history")

      .select("*", {
        count: "exact",
        head: true
      })

    if (error) {
      throw error
    }

    return res.status(200).json({
      total: count || 0
    })

  } catch (err) {

    console.log(err)

    return res.status(500).json({
      error: err.message
    })
  }
}