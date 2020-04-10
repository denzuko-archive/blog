import { React, ReactDOM } from 'https://unpkg.com/es-react@16.12.0/dev';
import htm from 'https://unpkg.com/htm?module'
import { endpoint } from "https://cdn.pika.dev/@octokit/endpoint";;
import marked from 'https://unpkg.com/marked@0.8.0/lib/marked.esm.js';

const html = htm.bind(React.createElement)

const settings = {
  username: 'denzuko',
  repository: 'blog',
  authkey: '918ff8ac8cd56019b6ab111626c71d62f60814c6'
}

const Header = (props) => {
  return html`
    <header className="header">
      <h1 className="title">
        <a href="index.html"><strong>DevOps RoundTable</strong></a>
      </h1>
      <h2 className="description">
        Discussions on agile development and devops leadership.
      </h2>
    </header>
  `;
}

const Posts = (props) => {
  const [issues, setIssues] = React.useState();

  React.useEffect(() => {

    async function fetchIssues() {
      if (!issues) {
        const { url, ...options } = endpoint("GET /repos/:owner/:repo/issues", {
          owner: settings.username,
          repo: settings.repository,
          auth: settings.authkey
        });
        const res = await fetch(url, options);
        setIssues(await res.json());
      }
    };

    fetchIssues()

  }, [issues]);

  const {
    search,
  } = window.location;

  return html`
    <div className="posts">
      ${(issues || [])
        .filter(({ user })   => user.login === settings.username)
        .filter(({ number }) => !search || Number(search.slice(1)) === number)
        .map(({
          number,
          title,
          labels,
          user,
          created_at,
          comments,
          body,
        }) => html`
          <div className="post" id={${number}} key={${number}}>
            <h1 className="title">
              <a href="?${number}">
                ${title}
              </a>
            </h1>
            ${labels.length > 0 && html`
              <div className="categories">
                in
                ${labels.map((label) => html`
                  <span key="${label.id}" style=${{ color: '#' + label.color, padding: '0 .25em' }}>
                    ${label.name}
                  </span>
                `)}
              </div>
            `}
            <div className="meta">
              <span>by </span>
              <a href="${user.html_url}">${user.login}</a>
              <span>, </span>
              <span>${new Date(created_at).toLocaleDateString()} </span>
              ${comments ? html`<a href="?${number}"> ${comments} comment(s) </a>` : null}
            </div>
            <div className="body"
                 dangerouslySetInnerHTML="${{ __html: marked(body).replace(/<pre>/g, '<pre class="prettyprint">')}}"
            />
          </div>
          <div class="author">
            <p><span style="text-transform:capitalize">Written by</span> ${user.name}</p>
            <p><small>${user.bio}</small></p>
          </div>
        `)}
    </div>
  `
};

const Footer = (props) => {
  return html`<footer>
          <p><small>Copyright &copy; 2020, Dwight Spencer. All Rights Reserved. Distribution permitted via BSD modified 2-claus licence.</small></p>
        </footer>`
};

ReactDOM.render(
  html`
    <${Header} />
    <${Posts} />
    <${Footer} />
  `,
  document.querySelector('#app')
)

