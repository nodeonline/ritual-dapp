import { createClient }
from "@supabase/supabase-js"

import solc from "solc"

const supabase =
  createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  )

export default async function handler(
  req,
  res
) {

  try {

    const { contractAddress } =
      req.body

    const { data, error } =
      await supabase

        .from("deploy_history")

        .select("*")

        .eq(
          "contractAddress",
          contractAddress
        )

        .single()

    if (error || !data) {

      return res.status(404).json({
        error:
          "contract not found"
      })
    }

    const input = {

      language: "Solidity",

      sources: {

        "Contract.sol": {

          content:
            data.source_code
        }
      },

      settings: {

        outputSelection: {

          "*": {

            "*": [
              "evm.bytecode"
            ]
          }
        }
      }
    }

    const output =
      JSON.parse(
        solc.compile(
          JSON.stringify(input)
        )
      )

    const contractName =
      Object.keys(
        output.contracts[
          "Contract.sol"
        ]
      )[0]

    const compiledBytecode =
      "0x" +

      output.contracts[
        "Contract.sol"
      ][contractName]

      .evm.bytecode.object

    console.log(
      "COMPILED:",
      compiledBytecode
    )

    console.log(
      "DATABASE:",
      data.bytecode
    )

    const verified =
      compiledBytecode ===
      data.bytecode

    console.log(
      "VERIFIED:",
      verified
    )

    await supabase

      .from("deploy_history")

      .update({
        verified
      })

      .eq(
        "contractAddress",
        contractAddress
      )

    return res.status(200).json({

      success: true,

      verified
    })

  } catch (err) {

    console.log(err)

    return res.status(500).json({

      error: err.message
    })
  }
}