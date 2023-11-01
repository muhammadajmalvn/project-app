import Navbar from '@/components/common/navbar';
import  Router  from 'next/router'
import React, { useEffect } from 'react';

const Homepage = () => {

  useEffect(() => {
    // Check if user is present in localStorage
    const user = localStorage.getItem('user');
console.log(user);
    // If user is not present, redirect to '/login'
    if (!user) {
      Router.push('/account/login')
    }
  }, []);

  return (
    <div>
      <Navbar/>
      Homepage
    </div>
  );
}

export default Homepage;
