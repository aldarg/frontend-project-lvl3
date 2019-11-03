import _ from 'lodash';

const isInvalidData = (data) => data.getElementsByTagName('parsererror').length > 0;

const getFirstTagContent = (dom, tagName) => {
  const node = dom.getElementsByTagName(tagName)[0];
  return node ? node.textContent : null;
};

export default (data) => {
  const dom = new DOMParser().parseFromString(data, 'text/xml');

  const error = isInvalidData(dom);
  if (error) {
    return null;
  }

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
    id: feedId,
    title,
    description,
    posts
  };
};
