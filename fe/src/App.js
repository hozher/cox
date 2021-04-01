import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          This application has been deployed using:
        </p>
        <a
          className="App-link"
          href="https://learn.hashicorp.com/tutorials/terraform/cdktf"
          target="_blank"
          rel="noopener noreferrer"
        >
          Terraform CDK (cdktf)
        </a>
        <p>
          Candidate: César Bonilla 
        </p>
      </header>
    </div>
  );
}

export default App;
