import axios from 'axios';

const rssProxy = 'http://cors-anywhere.herokuapp.com/';

export default (url) => {
  const query = {
    method: 'get',
    url: `${rssProxy}${url}`,
  };

  return axios(query)
    .then((response) => {
      const content = new DOMParser().parseFromString(response.data, 'text/xml');
      return { url, content };
    })
    .catch((e) => {
      throw e;
    });
};
