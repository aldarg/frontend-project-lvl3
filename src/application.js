import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import $ from 'jquery';
import { watch } from 'melanke-watchjs';
import isURL from 'validator/lib/isURL';
import State from './state';
import parseUrl from './parsers/url.parser';
import parseContent from './parsers/content.parser';

export default () => {
  const state = new State();

  const input = document.getElementById('urlInput');
  const submitBtn = document.getElementById('submitBtn');
  const errorOutput = document.getElementById('errorLabel');

  input.addEventListener('input', ({ target: { value } }) => {
    if (value === '') {
      state.inputState = 'ready';
      return;
    }

    if (!isURL(value)) {
      state.inputState = 'errorNotUrl';
      return;
    }

    state.inputState = state.checkSubscription(value) ? 'valid' : 'errorSubscribed';
  });

  watch(state, 'inputState', () => {
    switch (state.inputState) {
      case 'valid':
        submitBtn.disabled = false;
        input.classList.remove('border', 'border-danger');
        errorOutput.classList.add('invisible');
        break;
      case 'errorNotUrl':
        submitBtn.disabled = true;
        input.classList.add('border', 'border-danger');
        errorOutput.classList.add('invisible');
        break;
      case 'errorSubscribed':
        submitBtn.disabled = true;
        input.classList.add('border', 'border-danger');
        errorOutput.classList.remove('invisible');
        errorOutput.textContent = 'Already in subscription list';
        break;
      case 'errorNotRss':
        submitBtn.disabled = true;
        input.classList.add('border', 'border-danger');
        errorOutput.classList.remove('invisible');
        errorOutput.textContent = 'Invalid RSS source';
        break;
      default:
        submitBtn.disabled = true;
        input.classList.remove('border', 'border-danger');
        errorOutput.classList.add('invisible');
        input.value = '';
        break;
    }
  });

  const validateContent = (data) => data.getElementsByTagName('parsererror').length > 0;

  submitBtn.addEventListener('click', () => {
    state.reloading = true;

    parseUrl(input.value)
      .then((data) => {
        state.reloading = false;

        if (validateContent(data)) {
          state.inputState = 'errorNotRss';
          return;
        }

        const content = parseContent(data);
        state.addSubscription({ url: input.value, ...content });
        state.inputState = 'ready';
      })
      .catch((error) => {
        console.log(error);
      });
  });

  const renderRssList = (subscriptions) => {
    const div = document.getElementById('subscriptions');
    div.innerHTML = '';

    subscriptions.forEach(({ title, description }) => {
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

  const rssItemsAppend = (parent, items) => {
    items.forEach(({ title, link, description }) => {
      const child = document.createElement('div');
      child.classList.add('list-group-item');

      const childLink = document.createElement('a');
      childLink.setAttribute('href', link);
      childLink.textContent = title;
      child.append(childLink);

      const childModalBtn = document.createElement('button');
      childModalBtn.classList.add('btn', 'btn-primary', 'btn-sm');
      childModalBtn.textContent = 'Info';
      childModalBtn.addEventListener('click', () => {
        state.modal = description;
      });
      child.append(childModalBtn);

      parent.append(child);
    });
  };

  const renderRssContent = (subscriptions) => {
    const div = document.getElementById('feed');
    div.innerHTML = '';

    subscriptions.forEach(({ items }) => rssItemsAppend(div, items));
  };

  watch(state, 'subscriptions', () => {
    renderRssList(state.subscriptions);
    renderRssContent(state.subscriptions);
  });

  watch(state, 'modal', () => {
    if (state.modal === '') {
      return;
    }

    const modalDiv = document.getElementById('descriptionModal');
    modalDiv.classList.remove('invisible');
    $(modalDiv).find('.modal-body').text(state.modal);
    $(modalDiv).modal('toggle');
  });

  watch(state, 'reloading', () => {
    const spinnerEl = document.getElementById('spinner');
    if (state.reloading) {
      spinnerEl.classList.remove('invisible');
    } else {
      spinnerEl.classList.add('invisible');
    }
  });
};
