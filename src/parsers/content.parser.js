import _ from 'lodash';

const getFirstTagContent = (dom, tagName) => {
  const node = dom.getElementsByTagName(tagName)[0];
  return node ? node.textContent : null;
};

export default (dom) => {
  const title = getFirstTagContent(dom, 'title');
  const description = getFirstTagContent(dom, 'description');
  const feedId = _.uniqueId('feed_');

  const itemElements = dom.getElementsByTagName('item');
  const posts = [...itemElements].map((item) => {
    const itemTitle = getFirstTagContent(item, 'title');
    const itemLink = getFirstTagContent(item, 'link');
    const itemDescription = getFirstTagContent(item, 'description');
    const itemPubDate = getFirstTagContent(item, 'pubDate');

    return {
      id: _.uniqueId('item_'),
      feedId,
      link: itemLink,
      title: itemTitle,
      description: itemDescription,
      date: itemPubDate,
    };
  });

  return {
    feed: {
      id: feedId,
      title,
      description,
    },
    posts,
  };
};
