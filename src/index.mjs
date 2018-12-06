import axios from 'axios';
import Promise from 'bluebird';
import R from 'ramda';

const org = process.env.ORG;
const token = process.env.GITHUB_TOKEN;

const http = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    'Authorization': `token ${token}`
  },
  responseType: 'json'
});

const reviewers = (url) => Promise.resolve(http.get(url))
  .then(r => r.data)
  .then(R.flatten)
  .map(R.path(['user', 'login']));

Promise.resolve(http.get(`/user/repos`, {
  params: {
    affiliation: 'organization_member',
    sort: 'pushed'
  }
}))
  .then(R.prop('data'))
  .map(r => http.get(`/repos/${r.full_name}/pulls`))
  .map(R.prop('data'))
  .then(R.flatten)
  .map(r => {
    return reviewers(r.review_comments_url)
      .then(u => [r.title, r.html_url, R.uniq(u)]);
    
  })
  .each(([title, url, r]) => {
    console.log(`${title}\n${url}\n${r.length ? `${r.join(', ')}\n` : ''}`);
  })