import { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Dropdown from 'react-bootstrap/Dropdown';
import { Link, NavLink } from 'react-router-dom';
import { JwtPayload, jwtDecode } from 'jwt-decode';
import logo from '/logo.png';

interface DecodedTokenTypes extends JwtPayload {
  username: string;
}

interface UserTypes {
  username: string;
}

interface HeaderProps {
  user?: UserTypes | null;
}

function Header({ user }: HeaderProps) {

  const [username, setUsername] = useState('')
  useEffect(() => {
    const token = localStorage.getItem('token');
    const decodedToken = token ? jwtDecode<DecodedTokenTypes>(token) : null;
    if (decodedToken) {
      setUsername(decodedToken.username);
    } else if(user) {
      setUsername(user.username)
    } else {
      setUsername('')
    }
  }, [user]);

  return (
    <Container>
      <Navbar className="justify-content-between border-bottom mb-4 py-3">
        <Navbar.Brand as={NavLink} to="/" className="d-flex align-items-center fw-bold">
            <img
              src={logo}
              width="50"
              height="50"
              className="d-inline-block"
              alt="Re4cto client logo"
            />{' '}
            Re4cto
        </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Link
            to="/"
            className="btn btn-secondary rounded-3 me-1"
            aria-label="Messages"
          >
            Messages
          </Link>
          <Dropdown className="d-flex align-items-center text-end">
            <Dropdown.Toggle id="profile-menu" className="rounded-3">
              @{username}
            </Dropdown.Toggle>
            <Dropdown.Menu className="bg-body-tertiary mt-2 p-2 rounded-3" align="end">
              <Dropdown.Item as={NavLink} to="/friends" eventKey="1" className="mb-1 px-2 rounded-2">Friends</Dropdown.Item>
              <Dropdown.Item as={NavLink} to="/profile" eventKey="2" className="mb-1 px-2 rounded-2">Profile</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item as={NavLink} to="/logout" eventKey="3" className="my-1 px-2 rounded-2">Sign out</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Navbar.Collapse>
      </Navbar>
    </Container>
  );
}

export default Header;