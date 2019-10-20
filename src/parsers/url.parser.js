import axios from 'axios';

const rssProxy = 'http://cors-anywhere.herokuapp.com/';

export default (rssUrl) => {
  const query = {
    method: 'get',
    url: `${rssProxy}${rssUrl}`,
  };

  return axios(query)
    .then((response) => new DOMParser().parseFromString(response.data, 'text/xml'));
};
