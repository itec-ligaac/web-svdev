import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import Navbar from './components/Navbar';
import Home from './components/Home';
import Destinations from './components/Destinations';
import './App.css';


function App() {
  return (
    <Router>
      <div>
        <Navbar />
        <Switch>
          <Route path="/destinations">
            <Destinations />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
