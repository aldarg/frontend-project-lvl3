import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import $ from 'jquery';
import { watch } from 'melanke-watchjs';
import axios from 'axios';
import isURL from 'validator/lib/isURL';
import State from './State';
import parseContent from './parsers/content.parser';
import { renderFeedsList, renderPostsList } from './renderers';
import getLocales from './locale';

const rssProxy = 'http://cors-anywhere.herokuapp.com/';

const updatePosts = (state) => () => {
  if (state.feeds.length === 0) {
    return;
  }

  const promises = state.feeds.map(({ url }) => axios({
    method: 'get',
    url: `${rssProxy}${url}`,
  }));

  Promise.all(promises)
    .then((responses) => {
      const newPosts = responses.map(({ data }) => {
        const { posts } = parseContent(data);
        return posts;
      });
      state.replacePosts(newPosts);
    })
    .finally(() => {
      setTimeout(updatePosts(state), 5000);
    });
};

const getNextFormState = (state, inputText) => {
  if (inputText === '') {
    return 'ready';
  }

  if (!isURL(inputText)) {
    return 'errorNotUrl';
  }

  if (state.isSubscribed(inputText)) {
    return 'errorSubscribed';
  }

  return 'valid';
};

export default () => {
  const state = new State();
  const locales = getLocales();

  const input = document.getElementById('urlInput');
  const addFeedForm = document.getElementById('addFeedForm');
  const addFeedBtn = document.getElementById('addFeedBtn');
  const errorLabel = document.getElementById('errorLabel');
  const spinner = document.getElementById('spinner');
  const feedsDiv = document.getElementById('feedsHeader');

  addFeedBtn.textContent = locales.element.subscribe;
  input.placeholder = locales.element.input;
  feedsDiv.textContent = locales.element.feeds;

  input.addEventListener('input', ({ target: { value } }) => {
    state.formState = getNextFormState(state, value);
  });

  watch(state, 'formState', () => {
    switch (state.formState) {
      case 'ready':
        input.disabled = false;
        spinner.classList.add('invisible');
        addFeedBtn.disabled = true;
        input.classList.remove('border', 'border-danger');
        errorLabel.classList.add('invisible');
        input.value = '';
        break;
      case 'valid':
        addFeedBtn.disabled = false;
        input.classList.remove('border', 'border-danger');
        errorLabel.classList.add('invisible');
        break;
      case 'errorNotUrl':
        addFeedBtn.disabled = true;
        input.classList.add('border', 'border-danger');
        errorLabel.classList.add('invisible');
        break;
      case 'errorSubscribed':
        addFeedBtn.disabled = true;
        input.classList.add('border', 'border-danger');
        errorLabel.classList.remove('invisible');
        errorLabel.textContent = locales.error.subscribed;
        break;
      case 'errorNotRss':
        input.disabled = false;
        addFeedBtn.disabled = true;
        spinner.classList.add('invisible');
        input.classList.add('border', 'border-danger');
        errorLabel.classList.remove('invisible');
        errorLabel.textContent = locales.error.source;
        break;
      case 'errorConnection':
        input.disabled = false;
        spinner.classList.add('invisible');
        addFeedBtn.disabled = false;
        input.classList.add('border', 'border-danger');
        errorLabel.classList.remove('invisible');
        errorLabel.textContent = locales.error.connection;
        break;
      case 'loading':
        input.disabled = true;
        addFeedBtn.disabled = true;
        spinner.classList.remove('invisible');
        break;
      default:
        throw new Error('Uknown input state');
    }
  });

  addFeedForm.addEventListener('submit', (e) => {
    e.preventDefault();
    state.formState = 'loading';

    const formData = new FormData(e.target);
    const url = formData.get('url');
    const query = {
      method: 'get',
      url: `${rssProxy}${url}`,
    };

    axios(query)
      .then(({ data }) => {
        const feed = parseContent(data);

        if (!feed) {
          state.formState = 'errorNotRss';
          return;
        }

        const { posts, ...feedInfo } = feed;
        state.addFeed({ url, ...feedInfo });
        state.addPosts(posts);
        state.formState = 'ready';
      })
      .catch((error) => {
        console.log(error);
        state.formState = 'errorConnection';
      });
  });

  watch(state, 'feeds', () => {
    renderFeedsList(state.feeds);

    if (state.feeds.length === 1) {
      setTimeout(updatePosts(state), 5000);
    }
  });

  watch(state, 'posts', () => {
    const handleModal = (id) => (e) => {
      e.preventDefault();
      state.modal = { show: true, id };
    };
    renderPostsList(state.posts, handleModal);
  });

  $('#postModal').on('hidden.bs.modal', () => {
    state.modal = { show: false };
  });

  watch(state, 'modal', () => {
    if (!state.modal.show) {
      return;
    }

    const { title, description } = state.getPostById(state.modal.id);

    const modalHeader = document.getElementById('modalTitle');
    modalHeader.textContent = title;
    const modalBody = document.getElementById('modalBody');
    modalBody.textContent = description;

    $('#postModal').modal();
  });
};
