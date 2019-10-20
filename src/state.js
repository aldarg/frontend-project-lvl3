export default class {
  constructor() {
    this.inputState = 'ready';
    this.reloading = false;
    this.subscriptions = [];
    this.modal = false;
  }

  checkSubscription(url) {
    return !this.subscriptions.find((item) => item.url === url);
  }

  addSubscription(rss) {
    this.subscriptions.push(rss);
  }
}
