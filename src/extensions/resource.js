'use strict'

// This is a ROUGH estimate, since the amount of decay reduces as the total reduces.
Resource.prototype.ticksToFullyDecay = function() {
  return Math.floor(this.amount/Math.ceil(this.amount/1000))
}
