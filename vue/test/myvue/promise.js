const PENDING = 'pending'
const RESOLVED = 'resolved'
const REJECTED = 'rejected'

class Promise {
  constructor(excute) {
    this.state = PENDING
    this.value = null
    this.error = null
    this.onResolved = []
    this.onRejected = []
    excute(resolve, reject)
  }

  resolve(value) {
    // 状态不可变
    if(this.state === PENDING) {
      this.state = RESOLVED
      this.value = value
      this.onResolved,forEach(resolve => resolve(this.value))
    }
  }

  reject(error) {
    // 保持状态不可变
    if(this.state === PENDING) {
      this.state = REJECTED
      this.error = error
      this.onRejected.forEach(rejeced => rejeced(this.error))
    }
  }

  then(onResolved, onRejected) {
    if(this.state === RESOLVED) {
      typeof onResolved === 'function' && onResolved(this.value)
    }

    if(this.state === REJECTED) {
      typeof onRejected === 'function' && onRejected(this.value)
    }
    if(this.state === PENDING) {
      typeof onRejected === 'function' && this.onRejected.push(onRejected)
      typeof onResolved === 'function' && this.onResolved.push(onResolved)
    }
  }

}