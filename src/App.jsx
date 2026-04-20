import './App.css'
import { BrowserRouter } from "react-router-dom";
import Router from './routes/Router.jsx';
import AlertContainer from './components/common/AlertContainer.jsx';
function App() {

   return (
    <BrowserRouter>
      <Router />
      <AlertContainer />
    </BrowserRouter>
  );
}

export default App
