# NebGov Architecture

NebGov is a modular on-chain governance framework for Soroban. It is composed of five independent smart contracts that work together to provide a full governance lifecycle.

## Contract Interaction Flow

```
User
 │
 ├── propose() ──────────────────────► Governor Contract
 │                                         │
 ├── cast_vote() ─────────────────────────►│
 │                                         │ on quorum + majority
 │                                         ▼
 │                               Timelock Controller
 │                                         │ after delay
 │                                         ▼
 │                               Target Contract (execution)
 │
 └── delegate() ──────────────────► Token Votes Contract
                                         │
                            Governor reads voting power
```

## Contracts

### Governor (`contracts/governor`)
The core contract. Manages proposal lifecycle:
- **Pending** → voting hasn't started yet (within `voting_delay` ledgers)
- **Active** → voting is open
- **Defeated** → voting ended, quorum or majority not met
- **Succeeded** → quorum and majority met, ready to queue
- **Queued** → scheduled in the Timelock
- **Executed** → Timelock executed the calldata
- **Cancelled** → cancelled by proposer or admin

Key parameters:
| Parameter | Description |
|---|---|
| `voting_delay` | Ledgers between proposal creation and voting start |
| `voting_period` | Ledgers during which voting is open |
| `quorum_numerator` | % of total supply needed for quorum (out of 100) |
| `proposal_threshold` | Minimum voting power to create a proposal |

### Timelock (`contracts/timelock`)
Enforces a mandatory delay between a proposal passing and being executed. This gives the community time to react before changes take effect.

- Operations are scheduled with a `delay` (in seconds) ≥ `min_delay`
- Identified by a hash of their calldata
- Can be cancelled by admin or governor before execution

### Token Votes (`contracts/token-votes`)
Wraps any SEP-41 token to provide snapshot-based voting power with checkpointing. Users must self-delegate (or delegate to others) to activate voting power.

### Governor Factory (`contracts/governor-factory`)
Deploys Governor + Timelock pairs permissionlessly. Any team can deploy their own governance instance by calling `factory.deploy()`. All instances are registered in the factory.

### Treasury (`contracts/treasury`)
A multi-signature treasury controlled by a set of owner addresses and a configurable approval threshold. Integrates with the governor so on-chain proposals can execute treasury transfers automatically.

## SDK (`sdk/`)

`@nebgov/sdk` is a TypeScript client library for interacting with all NebGov contracts. Install via npm/pnpm:

```bash
pnpm add @nebgov/sdk @stellar/stellar-sdk
```

See [SDK docs](./sdk.md) for full API reference.

## Frontend (`app/`)

A Next.js 14 governance dashboard. Connects to any deployed NebGov governor instance via Stellar Wallets Kit.

Pages:
- `/` — Proposals list
- `/propose` — Create proposal
- `/proposal/[id]` — Proposal detail + voting
- `/treasury` — Treasury balances + pending transactions

## Security Considerations

- **Timelock delay**: Set `min_delay` ≥ 24 hours for production deployments
- **Quorum**: Set quorum high enough that a small minority cannot pass proposals
- **Proposal threshold**: Prevents proposal spam from accounts with no stake
- **Upgrade mechanism**: Contract upgrades should themselves go through governance (see issue #24)

## Building on OpenZeppelin Stellar

NebGov is designed to compose with [OpenZeppelin Contracts for Stellar](https://github.com/OpenZeppelin/openzeppelin-contracts-stellar):
- Use OpenZeppelin's `fungible` token as your governance token
- Use OpenZeppelin's `access_control` for admin roles in the Timelock
- NebGov's `token_votes` wraps any OZ-compatible SEP-41 token

## Integration: Reflector Oracle (for dynamic quorum)

TODO issue #8 (contract): Integrate Reflector oracle to compute quorum as a USD-denominated threshold rather than a raw token amount, so quorum remains meaningful as token price changes.

```rust
// Future quorum calculation pattern:
let token_price = reflector_client.lastprice(env, Asset::Stellar(token_address));
let quorum_usd = 10_000_00; // $10,000 in 5-decimal USDC
let quorum_tokens = quorum_usd * PRICE_DECIMALS / token_price.price;
```
