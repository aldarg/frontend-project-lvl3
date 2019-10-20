export default (dom) => {
  const title = dom.getElementsByTagName('title')[0].textContent;
  const description = dom.getElementsByTagName('description')[0].textContent;
  const itemElements = dom.getElementsByTagName('item');
  const items = [...itemElements].map((itemEl) => {
    const itemTitle = itemEl.getElementsByTagName('title')[0].textContent;
    const itemLink = itemEl.getElementsByTagName('link')[0].textContent;
    const itemDescription = itemEl.getElementsByTagName('description')[0].textContent;

    return { title: itemTitle, link: itemLink, description: itemDescription };
  });

  return { title, description, items };
};
