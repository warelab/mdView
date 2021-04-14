import React, {Component} from 'react'
import ReactMarkdown from 'react-markdown'

export default class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentFile: 0
    }
  }
  componentDidMount() {
    const md_regex = /\.md$/i;
    const url = `https://api.github.com/repos/${this.props.org}/${this.props.repo}/contents/${this.props.path}`
    fetch(url)
      .then(response => response.json())
      .then(data => {
        const mdFiles = data.filter(f => md_regex.test(f.name)).reverse();
        this.setState({files: mdFiles});
        mdFiles.forEach(f => {
          fetch(f.download_url)
            .then(response => response.text())
            .then(content => {
              f.content = content;
              this.setState({files: mdFiles})
            })
        })
      });
  }

  renderFile() {
    const c = this.state.currentFile;
    const f = this.state.files[c];
    const n = this.state.files.length;
    return <div>
      {c > 0 && <a onClick={() => {this.setState({currentFile: c-1})}}>next</a>}
      {c < n-1 && <a onClick={() => {this.setState({currentFile: c+1})}}>prev</a>}
      <h4>{f.name}</h4>
      { f.content && <ReactMarkdown>{f.content}</ReactMarkdown> }
    </div>
  }
  render() {
    return <div>
      { this.state.files ? this.renderFile() : <p>loading...</p> }
    </div>
  }
}
