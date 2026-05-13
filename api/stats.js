import { supabase }
from '../lib/supabase.js'

export default async function handler(
  req,
  res
) {

  const {
    count,
    error
  } = await supabase
    .from('deploy_history')
    .select('*', {
      count: 'exact',
      head: true
    })

  if (error) {

    return res.status(500)
    .json(error)
  }

  res.status(200).json({
    total: count
  })
}