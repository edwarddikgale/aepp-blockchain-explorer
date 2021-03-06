import times from 'lodash/times'
import isEqual from 'lodash/isEqual'
import ae from '../../aeppsdk'

/**
 * @param height
 * @param epochUrl
 * @returns {Promise<*>}
 */
async function getGenerationFromHeightWrapper (height, epochUrl) {
  const client = await ae(epochUrl)
  const generation = await client.api.getGenerationByHeight(height, { txEncoding: 'json' })
  const microBlocksHashes = generation.microBlocks
  let transactionNumber = 0

  let microBlocks = await Promise.all(
    microBlocksHashes.map(
      async (hash) => {
        return client.api.getBlockByHash(hash, { txEncoding: 'json' })
      }
    )
  )
  for (const index in microBlocks) {
    transactionNumber += microBlocks[index].transactions.length
  }

  generation.micros = microBlocks
  generation.transactionNumber = transactionNumber

  return generation
}

export default {
  /**
   * height fetches the block-height
   * @param {Object} state
   * @param {Function} commit
   * @param {Function} dispatch
   * @return {Object}
   */
  async height ({ state, commit, dispatch }) {
    const client = await ae(this.state.epochUrl)
    const height = await client.height()

    if (height === state.height) {
      return state.height
    }

    commit('setHeight', height)

    return height
  },

  /**
   * @param state
   * @param commit
   * @param dispatch
   * @param hash
   * @returns {Promise<*>}
   */
  async getGenerationFromHash ({ state, commit, dispatch }, hash) {
    const client = await ae(this.state.epochUrl)
    const generation = await client.api.getGenerationByHash(hash, { txEncoding: 'json' })
    const microBlocksHashes = generation.microBlocks
    let transactionNumber = 0

    const microBlocks = await Promise.all(
      microBlocksHashes.map(
        async (hash) => {
          return client.api.getBlockByHash(hash, { txEncoding: 'json' })
        }
      )
    )
    for (const index in microBlocks) {
      transactionNumber += microBlocks[index].transactions.length
    }

    generation.micros = microBlocks
    generation.transactionNumber = transactionNumber

    if (isEqual(state.generation, generation)) {
      return state.generation
    }

    commit('setGeneration', generation)
    return generation
  },

  /**
   * getBlockFromHash fetches the block from the blockchain
   * from a single hash argument
   * @param {Object} state
   * @param {Function} commit
   * @param {Function} dispatch
   * @param {String} hash
   * @return {*}
   */
  async getBlockFromHash ({ state, commit, dispatch }, hash) {
    const client = await ae(this.state.epochUrl)
    const block = await client.api.getKeyBlockByHash(hash, { txEncoding: 'json' })

    if (isEqual(state.block, block)) {
      return state.block
    }

    commit('setBlock', block)

    return block
  },

  /**
   * Fetches the head of the blockchain
   * @param {Object} store
   * @param {Object} store.state
   * @param {Function} store.commit
   * @param {Function} store.dispatch
   * @param {String} store.height
   * @return {*}
   */
  async getGenerationFromHeight ({ state, commit, dispatch }, height) {
    const generation = await getGenerationFromHeightWrapper(height, this.state.epochUrl)

    if (isEqual(state.block, generation)) {
      return state.block
    }

    commit('setGeneration', generation)

    return generation
  },

  /**
   * Fetches the head of the blockchain
   * @param {Object} state
   * @param {Function} commit
   * @param {Function} dispatch
   * @param {String} height
   * @return {*}
   */
  async getBlockFromHeight ({ state, commit, dispatch }, height) {
    const client = await ae(this.state.epochUrl)
    const block = await client.api.getKeyBlockByHeight(height, { txEncoding: 'json' })

    if (isEqual(state.block, block)) {
      return state.block
    }

    commit('setBlock', block)

    return block
  },

  /**
   * getLatestBlocks pulls a list of blocks based on the
   * size of the payload
   * @param {Object} state
   * @param {Function} commit
   * @param {Function} dispatch
   * @param {Number} size
   * @return {*}
   */
  async getLatestBlocks ({ state, commit, dispatch }, size) {
    await dispatch('height')
    const client = await ae(this.state.epochUrl)
    const blocks = await Promise.all(
      times(size, (index) => client
        .api
        .getKeyBlockByHeight(state.height - index, { txEncoding: 'json' }))
    )

    if (!blocks.length) {
      return state.blocks
    }

    commit('setBlocks', blocks)

    return blocks
  },

  /**
   * getLatestBlocks pulls a list of blocks based on the
   * size of the payload
   * @param {Object} state
   * @param {Function} commit
   * @param {Function} dispatch
   * @param {Number} size
   * @return {*}
   */
  async getLatestGenerations ({ state, commit, dispatch }, size) {
    await dispatch('height')
    const generations = await Promise.all(
      times(size, (index) => getGenerationFromHeightWrapper(state.height - index, this.state.epochUrl))
    )

    if (!generations.length) {
      return state.blocks
    }

    commit('setGenerations', generations)

    return generations
  },

  /**
   * addBlocksByHeightAndSize pulls a list of blocks based on the
   * specified height and size of the pull requested
   * @param {Object} state
   * @param {Function} commit
   * @param {Function} dispatch
   * @param {Number} height
   * @param {Number} size
   * @return {*}
   */
  async addBlocksByHeightAndSize ({ state, commit, dispatch }, {height, size}) {
    const client = await ae(this.state.epochUrl)
    const blocks = await Promise.all(
      times(size, (index) => client
        .api
        .getKeyBlockByHeight(height - index, { txEncoding: 'json' }))
    )

    if (!blocks.length) {
      return state.blocks
    }

    commit('addBlocks', blocks)

    return blocks
  }
}
