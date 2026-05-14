export default function handler(req, res) {

  return res.status(200).json({
    ok: true,
    url: process.env.SUPABASE_URL ? "ADA" : "KOSONG",
    key: process.env.SUPABASE_KEY ? "ADA" : "KOSONG"
  })

}
