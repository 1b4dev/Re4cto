import { Link } from 'react-router-dom';
import Button from 'react-bootstrap/Button';

function NotFound() {

  return (
    <div className="p-5 rounded-4 text-center bg-body-tertiary">
      <h1 className="text-body-emphasis">Sorry, we don&apos;t know this page</h1>
      <p className="col-lg-8 mx-auto fs-5 text-muted">
        There is nothing at this routed link, you might add something like this <br/> <code>&lt;Route path=&apos;/example&apos; element=&#123;&lt;ProtectedRoute&gt;&lt;Example/&gt;&lt;/ProtectedRoute&gt;&#125; /&gt;</code><br/> to app layout or go back to messages.
      </p>
      <div className="d-inline-flex mb-3">
        <Link to="/" aria-label="Navigate to home page">
          <Button
            className="d-inline-flex align-items-center btn-primary btn-lg px-4 rounded-3"
            type="button"
          >
            Go to Messages
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default NotFound;