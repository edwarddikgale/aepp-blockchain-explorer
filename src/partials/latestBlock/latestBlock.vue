<template>
  <div class="latest-generation-partial">
    <div class="grid">
      <div class="explanation">
        <h2 class="title">Latest Generation</h2>
        <ae-button type="exciting" size="small" :to="`/generation/${height}`">view last</ae-button>
        <ae-button type="exciting" size="small" to="/generations">view all</ae-button>
      </div>
      <div class="generation-data">
        <template v-if="generation" v-cloak>
          <h2>Generation</h2>
          <div class="grid generation">
            <div class="field">
              <div class="field-name">
                Height
              </div>
              <div class="field-value number">
                <router-link :to="`/generation/${height}`">{{ height }}</router-link>
              </div>
            </div>
            <div class="field">
              <div class="field-name">Micro Blocks</div>
              <div class="field-value number">{{ generation.micros.length}}</div>
            </div>
            <div class="field">
              <div class="field-name">Transactions</div>
              <div class="field-value number" >{{ generation.transactionNumber }}</div>
            </div>
          </div>

          <div class="grid">
            <h2>Key Block</h2>
          </div>
          <div class="grid block-extended-info">
            <div class="field">
              <div class="field-name">Hash</div>
              <div class="field-value block-hash">
                <router-link :to="`/block/${generation.keyBlock.hash}`">
                  <ae-hash type='short' :hash="generation.keyBlock.hash"/>
                </router-link>
              </div>
            </div>
            <div class="field">
              <div class="field-name">Mined by</div>
              <div class="field-value account-address">
                <router-link :to="`/account/${generation.keyBlock.miner}`">
                  <named-address :address="generation.keyBlock.miner" />
                </router-link>
              </div>
            </div>
            <div class="field">
              <div class="field-name">Time since mined</div>
              <div class="field-value number">
                <relative-time :ts="currentTime - generation.keyBlock.time" />
              </div>
            </div>
          </div>
        </template>
        <loader v-else />
      </div>
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import { AeButton } from '@aeternity/aepp-components'
import currentTime from '../../mixins/currentTime'
import RelativeTime from '../../components/relativeTime'
import AeHash from '../../components/aeHash'
import NamedAddress from '../../components/namedAddress'
import Loader from '../../components/loader'

export default {
  components: { AeButton, RelativeTime, AeHash, NamedAddress, Loader },
  mixins: [ currentTime ],
  computed: mapState('blocks', {
    generation: ({ generations }) => generations[0],
    height: ({ height }) => height
  })
}
</script>
<style src='./latestBlock.scss' lang='scss' />
