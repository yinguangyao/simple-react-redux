export default class Subscription {
    constructor(store) {
        this.store = store;
        this.listeners = [this.handleChangeWrapper];
    }
    notify = () => {
        this.listeners.forEach(listener => {
            listener()
        });
    }
    addListener(listener) {
        this.listeners.push(listener);
    }
    // 监听 store
    trySubscribe() {
        this.unsubscribe = this.store.subscribe(this.notify);
    }
    handleChangeWrapper = () => {
        console.log(this.onStateChange)
        if (this.onStateChange) {
          this.onStateChange()
        }
    }
    unsubscribe() {
        this.listeners = null;
        this.unsubscribe();
    }
}
