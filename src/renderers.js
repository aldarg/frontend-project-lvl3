export const renderFeedsList = (feeds) => {
  const feedsHeader = document.getElementById('feedsHeader');
  feedsHeader.classList.remove('invisible');
  const div = document.getElementById('feeds');
  div.innerHTML = '';

  feeds.forEach(({ title, description }) => {
    const child = document.createElement('div');
    child.classList.add('list-group-item');
    const childTitle = document.createElement('h5');
    childTitle.textContent = title;
    const childDescription = document.createElement('p');
    childDescription.textContent = description;
    child.append(childTitle);
    child.append(childDescription);
    div.append(child);
  });
};

export const renderPostsList = (posts, handleModal) => {
  const div = document.getElementById('posts');
  div.innerHTML = '';

  posts.forEach((post) => {
    const {
      id,
      title,
      link,
      date,
    } = post;

    const child = document.createElement('div');
    child.classList.add('list-group-item', 'col');

    const linkDiv = document.createElement('div');
    linkDiv.classList.add('col');
    child.append(linkDiv);

    const childLink = document.createElement('a');
    childLink.setAttribute('href', link);
    childLink.textContent = title;
    linkDiv.append(childLink);

    if (date) {
      const pubDate = document.createElement('div');
      const result = new Date(date);
      pubDate.textContent = result.toUTCString();
      linkDiv.append(pubDate);
    }

    const btnDiv = document.createElement('div');
    btnDiv.classList.add('col-1');
    child.append(btnDiv);

    const childModalBtn = document.createElement('a');
    childModalBtn.setAttribute('href', '#');
    childModalBtn.classList.add('badge', 'badge-info');
    childModalBtn.textContent = 'Info';
    childModalBtn.addEventListener('click', handleModal(id));
    btnDiv.append(childModalBtn);

    div.append(child);
  });
};
