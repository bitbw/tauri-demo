import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/Layout';
import Home from '../pages/Home';
import About from '../pages/About';
import Counter from '../pages/Counter';
import UserManagement from '../pages/UserManagement';
import CommunicationDemo from '../pages/CommunicationDemo';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'about',
        element: <About />,
      },
      {
        path: 'counter',
        element: <Counter />,
      },
      {
        path: 'users',
        element: <UserManagement />,
      },
      {
        path: 'communication',
        element: <CommunicationDemo />,
      },
    ],
  },
]);
