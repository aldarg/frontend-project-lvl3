import _ from 'lodash';

const sortPostsByDateDesc = (posts) => _.orderBy(posts, ({ date }) => Date.parse(date), ['desc']);

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

  isSubscribed(url) {
    return !!this.feeds.find((item) => item.url === url);
  }

  addFeed(feed) {
    this.feeds.push(feed);
  }

  addPosts(posts) {
    this.posts.push(...posts);
    const sortedPosts = sortPostsByDateDesc(this.posts);
    this.posts = sortedPosts;
  }

  replacePosts(posts) {
    const sortedPosts = sortPostsByDateDesc(_.flatten(posts));
    this.posts = sortedPosts;
  }

  getPostById(postId) {
    return this.posts.find(({ id }) => id === postId);
  }
}
