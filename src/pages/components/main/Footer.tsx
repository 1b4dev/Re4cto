import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import logo from '/logo.png';

const Footer = () => {
  return (
    <Container>
      <footer className="d-flex flex-wrap justify-content-between align-items-center py-3 my-4 border-top">
        <Col as="p" md={4} className="mb-0 text-body-secondary">
          © {new Date().getFullYear()} Re4cto Client by 1B4dev
        </Col>
        <Col 
          as="a" 
          href="/" 
          md={4} 
          className="d-flex align-items-center justify-content-center mb-3 mb-md-0 me-md-auto link-body-emphasis text-decoration-none"
        >
          <img
            src={logo}
            width="40"
            height="40"
            className="d-inline-block"
            alt="Re4cto client logo"
          />
        </Col>
        <Col as="p" md={4} className="mb-0 text-body-secondary text-end">
          React.js + Vite + Bootstrap = Re4cto
        </Col>
      </footer>
    </Container>
  );
};

export default Footer;