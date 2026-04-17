import { LinearClient } from "@linear/sdk";

let _client: LinearClient | null = null;

export function getLinearClient(): LinearClient {
  if (!_client) {
    _client = new LinearClient({
      apiKey: process.env.LINEAR_API_KEY!,
    });
  }
  return _client;
}
