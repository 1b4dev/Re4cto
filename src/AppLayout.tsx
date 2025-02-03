import { Routes, Route } from "react-router-dom";
import { useState } from 'react';
import Container from "react-bootstrap/Container";

import Header from "./pages/components/main/Header";
import Footer from "./pages/components/main/Footer";
import Message from "./pages/Message";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Friends from "./pages/Friends";

interface UserTypes {
  username: string;
}

function AppLayout() {

  const[user, setUser] = useState<UserTypes | null>(null);
  const updateUser = (updatedUser: UserTypes | null) => {
    setUser(updatedUser);
  }

  return (
    <>
      <Header user={user} />
      <Container>
        <Routes>
          <Route path='/' element={<Message/>} />
          <Route path='*' element={<NotFound/>} />
          <Route path='/profile' element={<Profile updateUser={updateUser}/>} />
          <Route path='/friends' element={<Friends/>} />
        </Routes>
      </Container>
      <Footer />
    </>
  )
}
    
export default AppLayout;