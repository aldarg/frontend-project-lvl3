import _ from 'lodash';

const pubDateComparator = ({ date }) => {
  if (!date) {
    return 0;
  }

  return -Date.parse(date);
};

export default class {
  constructor() {
    this.formState = 'ready';
    this.feeds = [];
    this.posts = [];
    this.modal = {
      show: false,
      id: null,
    };
  }

  checkSubscription(url) {
    return !this.feeds.find((item) => item.url === url);
  }

  addFeed(feed) {
    this.feeds.push(feed);
  }

  addPosts(posts) {
    posts.forEach((post) => this.posts.push(post));
    const sortedPosts = _.sortBy(this.posts, pubDateComparator);
    this.posts = sortedPosts;
  }

  replacePosts(posts) {
    const sortedPosts = _.sortBy(_.flatten(posts), pubDateComparator);
    this.posts = sortedPosts;
  }

  getPostById(postId) {
    return this.posts.find(({ id }) => id === postId);
  }
}
