/**
 * Read the first line of an NDJSON stream and return the parsed object.
 * Cancels the reader after the first line — the server stream continues independently.
 */
export async function readFirstNDJSONLine<T = Record<string, unknown>>(
  response: Response
): Promise<T> {
  if (!response.body) {
    throw new Error("Response has no body")
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const newlineIndex = buffer.indexOf("\n")

      if (newlineIndex !== -1) {
        const firstLine = buffer.substring(0, newlineIndex)
        reader.cancel()
        return JSON.parse(firstLine) as T
      }
    }
  } catch (err) {
    reader.cancel()
    throw err
  }

  // Stream ended without a newline — try to parse whatever we got
  if (buffer.trim()) {
    return JSON.parse(buffer.trim()) as T
  }

  throw new Error("Empty NDJSON stream")
}
