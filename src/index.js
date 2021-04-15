import React, {Component} from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Container, Row, Col, Navbar, Nav } from 'react-bootstrap'

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
        mdFiles.forEach(f => f.name = f.name.replace(/\.[^/.]+$/, ""));
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
  renderFileList() {
    if (! this.state.files) {
      return <p>loading</p>
    }
    const c = this.state.currentFile;
    const handleSelect = (eventKey) => this.setState({currentFile:eventKey});
    return <Navbar bg="light">
      <Nav className="flex-column" activeKey={c} onSelect={handleSelect}>
        <Nav.Item><h5>{this.props.heading || 'Files'}</h5></Nav.Item>
        { this.state.files.map((f,i) => <Nav.Link key={i} eventKey={i}>{f.name}</Nav.Link>) }
      </Nav>
    </Navbar>
  }
  renderFile() {
    if (! this.state.files) {
      return <p>loading</p>
    }
    const c = this.state.currentFile;
    const f = this.state.files[c];
    return <div>
      { f.content && <ReactMarkdown
        plugins={[remarkGfm]}
        children={f.content} />
      }
    </div>
  }
  render() {
    return <Container>
      <Row>
        <Col sm={3}>{ this.renderFileList()}</Col>
        <Col sm={9}>{ this.renderFile() }</Col>
      </Row>
    </Container>
  }
}
