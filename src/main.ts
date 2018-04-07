const SHA256 = require('crypto-js/sha256');

/** Format of a new transaction data */
interface Transaction {
    toAddress: string
    fromAddress?: string
    amount: number
}

/** Format of a new block data */
interface BlockData {
    timestamp: number
    transactions: Array<Transaction>
    previousHash: string
    hash?: any
    nonce?: any
}

/** Create a new block to be added in a chain */
class Block {
    blockData: BlockData

    constructor (blockData: BlockData) {
        this.blockData = blockData
        this.blockData.hash = this.calculateHash()
        this.blockData.nonce = 0;
    }

    /** Calculate the hash of a block data */
    calculateHash (): string {
        let {timestamp, transactions, previousHash, nonce} = this.blockData
        return SHA256([timestamp, JSON.stringify(transactions), previousHash, nonce].join('')).toString()
    }

    /** Mining Logic */
    mineBlock (difficulty: number) {
        console.log('Mining...')

        while (this.blockData.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
            this.blockData.nonce++
            this.blockData.hash = this.calculateHash()
        }

        console.log('Mined a block:', this.blockData.hash)
    }
}

/** Create a new blockchain */
class Blockchain {
    chain: Array<Block>
    difficulty: number = 4
    pendingTransactions: Array<Transaction> = []
    miningReward: number = 100

    constructor () {
        this.chain = [this.initialBlock()]
    }

    // Genesis Block
    initialBlock (): Block {
        return new Block({
            previousHash: '',
            transactions: [
                {
                    toAddress: '',
                    amount: 0
                }
            ],
            timestamp: Date.now()
        })
    }

    recentBlock (): Block {
        return this.chain[this.chain.length - 1]
    }

    /** Create a block and mine pending transactions. */
    minePendingTransactions (minerAddress: string) {
        let block = new Block({
            previousHash: this.recentBlock().blockData.hash,
            transactions: this.pendingTransactions,
            timestamp: Date.now()
        })

        block.mineBlock(this.difficulty)

        console.log('Block successfully mined!')
        this.chain.push(block)

        this.pendingTransactions = [{
            toAddress: minerAddress,
            amount: this.miningReward
        }]

        console.log('Total tries:', block.blockData.nonce)
    }

    /** Add transaction to current block. */
    createTransaction (transaction: Transaction): void {
        this.pendingTransactions.push(transaction)
    }

    /** Check balance of an address */
    checkBalance (minerAddress: string): number {
        let balance: number = 0

        // Loop through every block in the chain
        for (let block of this.chain) {
            // Loop through every transaction in the block
            for (let transaction of block.blockData.transactions) {
                // Deduct from Balance
                if (transaction.fromAddress === minerAddress) {
                    balance -= transaction.amount
                }

                // Add to Balance
                if (transaction.toAddress === minerAddress) {
                    balance += transaction.amount
                }
            }
        }

        return balance
    }

    /** Check if the blockchain is still connected with each other. */
    chainValidate (): boolean {
        for (let i=1; i<this.chain.length; i++) {
            let currentBlock = this.chain[i]
            let previousBlock = this.chain[i - 1]

            if (currentBlock.blockData.hash !== currentBlock.calculateHash()) {
                console.log('currentBlock:', currentBlock)
                console.log('previousBlock:', previousBlock)
                return false
            }

            if (currentBlock.blockData.previousHash !== previousBlock.blockData.hash) {
                console.log('currentBlock:', currentBlock)
                console.log('previousBlock:', previousBlock)
                return false
            }
        }

        return true
    }
}

// Testing
let druCoin = new Blockchain()

druCoin.createTransaction({
    toAddress: 'address1',
    fromAddress: 'address2',
    amount: 20
})

druCoin.createTransaction({
    toAddress: 'address2',
    fromAddress: 'address1',
    amount: 20
})

console.log('Starting miner...')
druCoin.minePendingTransactions('jhon-andrew')

console.log('Balance of jhon-andrew is:', druCoin.checkBalance('jhon-andrew'))

console.log('Restarting miner...')
druCoin.minePendingTransactions('jhon-andrew')

console.log('Balance of jhon-andrew is:', druCoin.checkBalance('jhon-andrew'))

console.log('Checking if blockchain is still valid:', druCoin.chainValidate())