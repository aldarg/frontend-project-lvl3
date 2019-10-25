import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import $ from 'jquery';
import { watch } from 'melanke-watchjs';
import isURL from 'validator/lib/isURL';
import State from './state';
import parseUrl from './parsers/url.parser';
import parseContent from './parsers/content.parser';
import { renderFeedsList, renderPostsList } from './renderers';

const updatePosts = (state) => () => {
  if (state.feeds.length === 0) {
    return;
  }

  const promises = state.feeds.map(({ url }) => parseUrl(url));
  Promise.all(promises)
    .then((responses) => {
      const newPosts = responses.map(({ content }) => parseContent(content).posts);
      state.replacePosts(newPosts);
    })
    .catch((error) => {
      console.log(error);
    })
    .finally(() => {
      setTimeout(updatePosts(state), 5000);
    });
};

export default () => {
  const state = new State();

  const input = document.getElementById('urlInput');
  const addFeedBtn = document.getElementById('addFeed');
  const errorLabel = document.getElementById('errorLabel');
  const spinner = document.getElementById('spinner');

  input.addEventListener('input', ({ target: { value } }) => {
    if (value === '') {
      state.formState = 'ready';
      return;
    }

    if (!isURL(value)) {
      state.formState = 'errorNotUrl';
      return;
    }

    if (!state.checkSubscription(value)) {
      state.formState = 'errorSubscribed';
      return;
    }

    state.formState = 'valid';
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
        errorLabel.textContent = 'Already in subscription list';
        break;
      case 'errorNotRss':
        input.disabled = false;
        addFeedBtn.disabled = true;
        spinner.classList.add('invisible');
        input.classList.add('border', 'border-danger');
        errorLabel.classList.remove('invisible');
        errorLabel.textContent = 'Invalid RSS source';
        break;
      case 'errorConnection':
        input.disabled = false;
        spinner.classList.add('invisible');
        addFeedBtn.disabled = false;
        input.classList.add('border', 'border-danger');
        errorLabel.classList.remove('invisible');
        errorLabel.textContent = 'Connection problems. Please, try again.';
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

  const isInvalidData = (data) => data.getElementsByTagName('parsererror').length > 0;

  addFeedBtn.addEventListener('click', () => {
    state.formState = 'loading';

    parseUrl(input.value)
      .then(({ url, content }) => {
        if (isInvalidData(content)) {
          state.formState = 'errorNotRss';
          return;
        }

        const { feed, posts } = parseContent(content);
        state.addFeed({ url, ...feed });
        state.addPosts(posts);
        state.formState = 'ready';
      })
      .catch((error) => {
        console.log(error);
        state.formState = 'errorConnection';
      });
  });

  input.addEventListener('keyup', (e) => {
    if (e.keyCode === 13 && !addFeedBtn.disabled) {
      addFeedBtn.click();
    }
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

    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').textContent = description;
    $('#postModal').modal();
  });
};
