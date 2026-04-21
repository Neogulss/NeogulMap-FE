import './App.css'
import { BrowserRouter } from "react-router-dom";
import Router from './routes/Router.jsx';
import AlertContainer from './components/common/AlertContainer.jsx';
import ScrollToTop from './components/layouts/ScrollToTop.jsx';
function App() {

   return (
    <BrowserRouter>
    <ScrollToTop />
      <Router />
      <AlertContainer />
    </BrowserRouter>
  );
}

export default App
