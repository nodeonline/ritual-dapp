import { supabase }
from '../lib/supabase.js'

export default async function handler(
  req,
  res
) {

  // SAVE

  if (req.method === 'POST') {

    const {
      txHash,
      contractAddress,
      wallet,
      status
    } = req.body

    const { error } =
      await supabase
        .from('deploy_history')
        .insert([
          {
            txhash: txHash,
            contractaddress:
              contractAddress,
            wallet,
            status
          }
        ])

    if (error) {

      return res.status(500)
      .json(error)
    }

    return res.status(200)
    .json({ success: true })
  }

  // GET

  const { data, error } =
    await supabase
      .from('deploy_history')
      .select('*')
      .order('id', {
        ascending: false
      })

  if (error) {

    return res.status(500)
    .json(error)
  }

  res.status(200).json(data)
}